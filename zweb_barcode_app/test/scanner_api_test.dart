import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zweb_barcode_app/models/device_settings.dart';
import 'package:zweb_barcode_app/models/scan_models.dart';
import 'package:zweb_barcode_app/services/scanner_api.dart';

/// Responde no lugar da rede, devolvendo o corpo combinado por rota.
class _StubAdapter implements HttpClientAdapter {
  _StubAdapter(this.responses);

  final Map<String, (int, String)> responses;
  final List<RequestOptions> requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(RequestOptions options, Stream<Uint8List>? requestStream, Future<void>? cancelFuture) async {
    requests.add(options);
    final entry = responses[options.path];
    if (entry == null) return ResponseBody.fromString('{"error":"Rota não encontrada."}', 404, headers: _jsonHeaders);
    return ResponseBody.fromString(entry.$2, entry.$1, headers: _jsonHeaders);
  }

  @override
  void close({bool force = false}) {}

  static final Map<String, List<String>> _jsonHeaders = <String, List<String>>{
    Headers.contentTypeHeader: <String>['application/json'],
  };
}

ZwebScannerApi _buildApi(_StubAdapter adapter) {
  final dio = Dio(BaseOptions(baseUrl: 'http://192.168.1.240:8788'))..httpClientAdapter = adapter;
  return ZwebScannerApi(
    const DeviceSettings(baseUrl: 'http://192.168.1.240:8788', deviceKey: 'chave-de-teste-0123456789'),
    dio: dio,
  );
}

void main() {
  test('le a sessao e o tamanho do catalogo', () async {
    final adapter = _StubAdapter(<String, (int, String)>{
      '/api/mobile/session': (
        200,
        '{"success":true,"device":"Coletor Estoque 1","catalog":{"items":4821,"updatedAt":"2026-08-13T12:00:00.000Z"}}',
      ),
    });

    final session = await _buildApi(adapter).openSession();

    expect(session.device, 'Coletor Estoque 1');
    expect(session.catalogItems, 4821);
    expect(session.catalogUpdatedAt?.year, 2026);
  });

  test('envia os codigos lidos e le o retorno item a item', () async {
    final adapter = _StubAdapter(<String, (int, String)>{
      '/api/mobile/scan/resolve': (
        200,
        '{"items":[{"scannedCode":"2000","found":true,"productId":171,"productCode":"2000",'
            '"productDescription":"CABO PP 3X2,5","currentLocation":"A-01"},'
            '{"scannedCode":"404404","found":false}]}',
      ),
    });

    final resolved = await _buildApi(adapter).resolveCodes(<String>['2000', '404404']);

    expect(resolved.first.productDescription, 'CABO PP 3X2,5');
    expect(resolved.first.currentLocation, 'A-01');
    expect(resolved.last.found, isFalse);
    expect(adapter.requests.single.data, <String, dynamic>{
      'itemCodes': <String>['2000', '404404'],
    });
  });

  test('le o resumo do envio com sucesso parcial', () async {
    final adapter = _StubAdapter(<String, (int, String)>{
      '/api/mobile/locations/assign': (
        200,
        '{"success":true,"summary":{"totalItems":2,"successCount":1,"notFoundCount":1,"errorCount":1,'
            '"locationCode":"Rua 2"},"results":[{"scannedCode":"2000","status":"success","location":"Rua 2"},'
            '{"scannedCode":"404404","status":"not_found","message":"Produto nao encontrado no catalogo."}]}',
      ),
    });

    final assignment = await _buildApi(adapter).assignLocation(
      locationCode: 'Rua 2',
      itemCodes: <String>['2000', '404404'],
    );

    expect(assignment.successCount, 1);
    expect(assignment.notFoundCount, 1);
    expect(assignment.results.last.message, 'Produto nao encontrado no catalogo.');
  });

  test('envia uma prateleira sem pedir nenhum produto ao ZWeb', () async {
    final adapter = _StubAdapter(<String, (int, String)>{
      '/api/mobile/shelf-batches': (
        201,
        '{"success":true,"batch":{"batchId":"lote-1","location":"GVE-07","items":[{},{}]}}',
      ),
    });

    final batch = await _buildApi(adapter).submitShelfBatch(
      locationCode: 'GVE-07',
      items: const <ShelfBatchItem>[
        ShelfBatchItem(scannedCode: '7899744088206', productCode: '16821', barcode: '7899744088206'),
        ShelfBatchItem(scannedCode: '7891111111111', productCode: '2000'),
      ],
    );

    expect(batch.batchId, 'lote-1');
    expect(batch.totalItems, 2);
    expect(adapter.requests.single.data, <String, dynamic>{
      'locationCode': 'GVE-07',
      'items': <Map<String, dynamic>>[
        <String, dynamic>{'scannedCode': '7899744088206', 'productCode': '16821', 'barcode': '7899744088206'},
        <String, dynamic>{'scannedCode': '7891111111111', 'productCode': '2000'},
      ],
    });
  });

  test('traduz a recusa do aparelho para uma mensagem util na tela', () async {
    final adapter = _StubAdapter(<String, (int, String)>{
      '/api/mobile/session': (401, '{"error":"Aparelho não autorizado."}'),
    });

    expect(
      () => _buildApi(adapter).openSession(),
      throwsA(isA<ScannerApiException>().having((ScannerApiException error) => error.message, 'message', 'Aparelho não autorizado.')),
    );
  });

  test('nao chama o servico quando nao ha codigo lido', () async {
    final adapter = _StubAdapter(<String, (int, String)>{});

    expect(await _buildApi(adapter).resolveCodes(<String>[]), isEmpty);
    expect(adapter.requests, isEmpty);
  });
}
