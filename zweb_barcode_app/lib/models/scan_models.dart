/// Situação de um código lido, do momento da leitura até a resposta do envio.
enum ScanStatus {
  /// Lido no coletor, ainda sem confirmação do serviço.
  resolving,

  /// Produto encontrado no catálogo e pronto para receber o endereço.
  found,

  /// Código que não existe no catálogo do serviço.
  notFound,

  /// Endereço gravado com sucesso.
  saved,

  /// O serviço recusou este item.
  failed,
}

/// Um código lido pelo estoquista, com o que o serviço já sabe sobre ele.
class ScannedItem {
  const ScannedItem({
    required this.code,
    this.status = ScanStatus.resolving,
    this.productId,
    this.productCode,
    this.productDescription,
    this.currentLocation,
    this.message,
    this.barcodePendingRegistration = false,
  });

  final String code;
  final ScanStatus status;
  final int? productId;
  final String? productCode;
  final String? productDescription;
  final String? currentLocation;
  final String? message;
  final bool barcodePendingRegistration;

  bool get isSendable => status == ScanStatus.found || status == ScanStatus.failed;

  ScannedItem copyWith({
    ScanStatus? status,
    int? productId,
    String? productCode,
    String? productDescription,
    String? currentLocation,
    String? message,
    bool? barcodePendingRegistration,
  }) {
    return ScannedItem(
      code: code,
      status: status ?? this.status,
      productId: productId ?? this.productId,
      productCode: productCode ?? this.productCode,
      productDescription: productDescription ?? this.productDescription,
      currentLocation: currentLocation ?? this.currentLocation,
      message: message ?? this.message,
      barcodePendingRegistration: barcodePendingRegistration ?? this.barcodePendingRegistration,
    );
  }
}

/// Item que o coletor envia como parte de uma prateleira. O serviço só guarda
/// esta intenção; a extensão confirma qualquer gravação no ZWeb depois.
class ShelfBatchItem {
  const ShelfBatchItem({
    required this.scannedCode,
    required this.productCode,
    this.productId,
    this.productDescription,
    this.barcode,
  });

  final String scannedCode;
  final String productCode;
  final int? productId;
  final String? productDescription;
  final String? barcode;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'scannedCode': scannedCode,
    'productCode': productCode,
    if (productId != null) 'productId': productId,
    if (productDescription != null && productDescription!.isNotEmpty) 'productDescription': productDescription,
    if (barcode != null && barcode!.isNotEmpty) 'barcode': barcode,
  };
}

class ShelfBatchSubmission {
  const ShelfBatchSubmission({required this.batchId, required this.totalItems, required this.locationCode});

  factory ShelfBatchSubmission.fromJson(Map<String, dynamic> json) {
    final batch = json['batch'] as Map<String, dynamic>? ?? const <String, dynamic>{};
    final items = batch['items'] as List<dynamic>? ?? const <dynamic>[];
    return ShelfBatchSubmission(
      batchId: batch['batchId'] as String? ?? '',
      totalItems: items.length,
      locationCode: batch['location'] as String? ?? '',
    );
  }

  final String batchId;
  final int totalItems;
  final String locationCode;
}

/// Uma das empresas atendidas pelo coletor.
class Company {
  const Company({required this.code, required this.name});

  factory Company.fromJson(Map<String, dynamic> json) {
    final code = json['code'] as String? ?? '';
    return Company(code: code, name: json['name'] as String? ?? code);
  }

  final String code;
  final String name;

  @override
  bool operator ==(Object other) => other is Company && other.code == code;

  @override
  int get hashCode => code.hashCode;
}

/// Resposta de `POST /api/mobile/session`.
class SessionInfo {
  const SessionInfo({
    required this.device,
    required this.catalogItems,
    this.catalogUpdatedAt,
    this.companies = const <Company>[],
  });

  factory SessionInfo.fromJson(Map<String, dynamic> json) {
    final catalog = json['catalog'] as Map<String, dynamic>? ?? const <String, dynamic>{};
    final updatedAt = catalog['updatedAt'] as String?;
    final companies = json['companies'] as List<dynamic>? ?? const <dynamic>[];
    return SessionInfo(
      device: json['device'] as String? ?? '',
      catalogItems: (catalog['items'] as num?)?.toInt() ?? 0,
      catalogUpdatedAt: updatedAt == null ? null : DateTime.tryParse(updatedAt),
      companies: companies
          .whereType<Map<String, dynamic>>()
          .map(Company.fromJson)
          .where((Company company) => company.code.isNotEmpty)
          .toList(growable: false),
    );
  }

  final String device;
  final int catalogItems;
  final DateTime? catalogUpdatedAt;
  final List<Company> companies;
}

/// Item de `POST /api/mobile/scan/resolve`.
class ResolvedProduct {
  const ResolvedProduct({
    required this.scannedCode,
    required this.found,
    this.productId,
    this.productCode,
    this.productDescription,
    this.currentLocation,
  });

  factory ResolvedProduct.fromJson(Map<String, dynamic> json) {
    return ResolvedProduct(
      scannedCode: json['scannedCode'] as String? ?? '',
      found: json['found'] == true,
      productId: (json['productId'] as num?)?.toInt(),
      productCode: json['productCode'] as String?,
      productDescription: json['productDescription'] as String?,
      currentLocation: json['currentLocation'] as String?,
    );
  }

  final String scannedCode;
  final bool found;
  final int? productId;
  final String? productCode;
  final String? productDescription;
  final String? currentLocation;
}

/// Item de `POST /api/mobile/locations/assign`.
class AssignmentResult {
  const AssignmentResult({
    required this.scannedCode,
    required this.status,
    this.location,
    this.message,
  });

  factory AssignmentResult.fromJson(Map<String, dynamic> json) {
    return AssignmentResult(
      scannedCode: json['scannedCode'] as String? ?? '',
      status: json['status'] as String? ?? 'error',
      location: json['location'] as String?,
      message: json['message'] as String?,
    );
  }

  final String scannedCode;
  final String status;
  final String? location;
  final String? message;

  ScanStatus get scanStatus {
    switch (status) {
      case 'success':
        return ScanStatus.saved;
      case 'not_found':
        return ScanStatus.notFound;
      default:
        return ScanStatus.failed;
    }
  }
}

/// Resposta completa de `POST /api/mobile/locations/assign`.
class AssignmentResponse {
  const AssignmentResponse({
    required this.locationCode,
    required this.totalItems,
    required this.successCount,
    required this.notFoundCount,
    required this.errorCount,
    required this.results,
  });

  factory AssignmentResponse.fromJson(Map<String, dynamic> json) {
    final summary = json['summary'] as Map<String, dynamic>? ?? const <String, dynamic>{};
    final results = json['results'] as List<dynamic>? ?? const <dynamic>[];
    return AssignmentResponse(
      locationCode: summary['locationCode'] as String? ?? '',
      totalItems: (summary['totalItems'] as num?)?.toInt() ?? 0,
      successCount: (summary['successCount'] as num?)?.toInt() ?? 0,
      notFoundCount: (summary['notFoundCount'] as num?)?.toInt() ?? 0,
      errorCount: (summary['errorCount'] as num?)?.toInt() ?? 0,
      results: results
          .whereType<Map<String, dynamic>>()
          .map(AssignmentResult.fromJson)
          .toList(growable: false),
    );
  }

  final String locationCode;
  final int totalItems;
  final int successCount;
  final int notFoundCount;
  final int errorCount;
  final List<AssignmentResult> results;
}

/// Resposta de `POST /api/mobile/barcodes`.
class BarcodeAssignment {
  const BarcodeAssignment({
    required this.productCode,
    required this.productDescription,
    required this.barcode,
    this.previousBarcode,
  });

  factory BarcodeAssignment.fromJson(Map<String, dynamic> json) {
    return BarcodeAssignment(
      productCode: json['productCode'] as String? ?? '',
      productDescription: json['productDescription'] as String? ?? '',
      barcode: json['barcode'] as String? ?? '',
      previousBarcode: json['previousBarcode'] as String?,
    );
  }

  final String productCode;
  final String productDescription;
  final String barcode;
  final String? previousBarcode;
}
