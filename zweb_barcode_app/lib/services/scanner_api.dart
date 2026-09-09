import 'package:dio/dio.dart';

import '../models/scan_models.dart';
import '../models/device_settings.dart';

/// Falha já traduzida para o que o estoquista precisa ler na tela.
class ScannerApiException implements Exception {
  const ScannerApiException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// Contrato usado pela tela de leitura, para permitir teste sem rede.
abstract class ScannerApi {
  Future<SessionInfo> openSession();

  Future<List<ResolvedProduct>> resolveCodes(List<String> itemCodes, {String? company});

  Future<AssignmentResponse> assignLocation({
    required String locationCode,
    required List<String> itemCodes,
    String? company,
  });

  /// Associa um código de barras lido a um produto do catálogo.
  Future<BarcodeAssignment> assignBarcode({required String productCode, required String barcode});

  Future<ShelfBatchSubmission> submitShelfBatch({
    required String locationCode,
    required List<ShelfBatchItem> items,
    String? company,
  });
}

typedef ScannerApiFactory = ScannerApi Function(DeviceSettings settings);

/// Cliente das rotas `/api/mobile/*` do serviço interno da loja.
class ZwebScannerApi implements ScannerApi {
  ZwebScannerApi(DeviceSettings settings, {Dio? dio})
    : _dio =
          dio ??
          Dio(
            BaseOptions(
              baseUrl: settings.baseUrl,
              connectTimeout: const Duration(seconds: 8),
              receiveTimeout: const Duration(seconds: 20),
              headers: <String, String>{
                'Accept': 'application/json',
                'X-Zweb-Device-Key': settings.deviceKey,
              },
            ),
          );

  final Dio _dio;

  @override
  Future<SessionInfo> openSession() async {
    final response = await _post('/api/mobile/session');
    return SessionInfo.fromJson(response);
  }

  @override
  Future<List<ResolvedProduct>> resolveCodes(List<String> itemCodes, {String? company}) async {
    if (itemCodes.isEmpty) return const <ResolvedProduct>[];
    final response = await _post('/api/mobile/scan/resolve', body: <String, dynamic>{
      'itemCodes': itemCodes,
      'company': ?company,
    });
    final items = response['items'] as List<dynamic>? ?? const <dynamic>[];
    return items.whereType<Map<String, dynamic>>().map(ResolvedProduct.fromJson).toList(growable: false);
  }

  @override
  Future<AssignmentResponse> assignLocation({
    required String locationCode,
    required List<String> itemCodes,
    String? company,
  }) async {
    final response = await _post(
      '/api/mobile/locations/assign',
      body: <String, dynamic>{
        'locationCode': locationCode,
        'itemCodes': itemCodes,
        'company': ?company,
      },
    );
    return AssignmentResponse.fromJson(response);
  }

  @override
  Future<BarcodeAssignment> assignBarcode({required String productCode, required String barcode}) async {
    final response = await _post('/api/mobile/barcodes', body: <String, dynamic>{
      'productCode': productCode,
      'barcode': barcode,
    });
    return BarcodeAssignment.fromJson(response);
  }

  @override
  Future<ShelfBatchSubmission> submitShelfBatch({
    required String locationCode,
    required List<ShelfBatchItem> items,
    String? company,
  }) async {
    final response = await _post('/api/mobile/shelf-batches', body: <String, dynamic>{
      'locationCode': locationCode,
      'company': ?company,
      'items': items.map((ShelfBatchItem item) => item.toJson()).toList(growable: false),
    });
    return ShelfBatchSubmission.fromJson(response);
  }

  Future<Map<String, dynamic>> _post(String path, {Map<String, dynamic>? body}) async {
    try {
      final response = await _dio.post<dynamic>(path, data: body);
      final data = response.data;
      if (data is Map<String, dynamic>) return data;
      throw const ScannerApiException('O serviço respondeu em um formato inesperado.');
    } on DioException catch (error) {
      throw ScannerApiException(_describe(error));
    }
  }

  String _describe(DioException error) {
    final data = error.response?.data;
    final serviceMessage = data is Map<String, dynamic> ? data['error'] as String? : null;
    if (serviceMessage != null && serviceMessage.isNotEmpty) return serviceMessage;

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'O serviço da loja não respondeu. Confira a rede do aparelho.';
      case DioExceptionType.connectionError:
        return 'Não foi possível falar com o serviço da loja. Confira o endereço configurado.';
      default:
        break;
    }

    final statusCode = error.response?.statusCode;
    if (statusCode == 401) return 'Este aparelho não está autorizado. Confira a chave do coletor.';
    if (statusCode != null) return 'O serviço da loja respondeu $statusCode.';
    return 'Falha inesperada ao falar com o serviço da loja.';
  }
}
