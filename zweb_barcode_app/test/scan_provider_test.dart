import 'package:flutter_test/flutter_test.dart';
import 'package:zweb_barcode_app/models/scan_models.dart';
import 'package:zweb_barcode_app/providers/scan_provider.dart';
import 'package:zweb_barcode_app/models/device_settings.dart';
import 'package:zweb_barcode_app/services/scanner_api.dart';

class _MemorySettingsStore implements SettingsStore {
  _MemorySettingsStore([this.settings = DeviceSettings.empty]);

  DeviceSettings settings;

  @override
  Future<DeviceSettings> load() async => settings;

  @override
  Future<void> save(DeviceSettings value) async => settings = value;
}

class _FakeScannerApi implements ScannerApi {
  _FakeScannerApi({this.catalog = const <String, String>{}, this.locations = const <String, String>{}});

  final Map<String, String> catalog;
  final Map<String, String> locations;
  ScannerApiException? sessionFailure;
  ScannerApiException? assignFailure;
  final List<List<ShelfBatchItem>> assignedBatches = <List<ShelfBatchItem>>[];
  String? assignedLocation;

  final List<Company> empresas = const <Company>[
    Company(code: 'EH', name: 'Eletronica Horizonte'),
    Company(code: 'MVA', name: 'MVA'),
  ];
  final List<String> empresasUsadas = <String>[];

  @override
  Future<SessionInfo> openSession() async {
    if (sessionFailure != null) throw sessionFailure!;
    return SessionInfo(device: 'Coletor Estoque 1', catalogItems: catalog.length, companies: empresas);
  }

  @override
  Future<List<ResolvedProduct>> resolveCodes(List<String> itemCodes, {String? company}) async {
    empresasUsadas.add(company ?? '');
    return itemCodes
        .map(
          (String code) => ResolvedProduct(
            scannedCode: code,
            found: catalog.containsKey(code),
            productId: catalog.containsKey(code) ? 100 + catalog.keys.toList().indexOf(code) : null,
            productCode: code,
            productDescription: catalog[code],
            currentLocation: locations[code],
          ),
        )
        .toList(growable: false);
  }

  final List<Map<String, String>> barcodesAssociados = <Map<String, String>>[];

  @override
  Future<BarcodeAssignment> assignBarcode({required String productCode, required String barcode}) async {
    if (!catalog.containsKey(productCode)) {
      throw ScannerApiException('Produto $productCode nao existe no catalogo.');
    }
    barcodesAssociados.add(<String, String>{'productCode': productCode, 'barcode': barcode});
    return BarcodeAssignment(
      productCode: productCode,
      productDescription: catalog[productCode]!,
      barcode: barcode,
    );
  }

  @override
  Future<AssignmentResponse> assignLocation({
    required String locationCode,
    required List<String> itemCodes,
    String? company,
  }) async {
    if (assignFailure != null) throw assignFailure!;
    empresasUsadas.add(company ?? '');
    assignedLocation = locationCode;
    final results = itemCodes
        .map(
          (String code) => AssignmentResult(
            scannedCode: code,
            status: catalog.containsKey(code) ? 'success' : 'not_found',
            location: catalog.containsKey(code) ? locationCode : null,
            message: catalog.containsKey(code)
                ? "Endereco '$locationCode' atribuido com sucesso."
                : 'Produto nao encontrado no catalogo.',
          ),
        )
        .toList(growable: false);
    final successCount = results.where((AssignmentResult result) => result.status == 'success').length;
    return AssignmentResponse(
      locationCode: locationCode,
      totalItems: results.length,
      successCount: successCount,
      notFoundCount: results.length - successCount,
      errorCount: results.length - successCount,
      results: results,
    );
  }

  @override
  Future<ShelfBatchSubmission> submitShelfBatch({
    required String locationCode,
    required List<ShelfBatchItem> items,
    String? company,
  }) async {
    if (assignFailure != null) throw assignFailure!;
    empresasUsadas.add(company ?? '');
    assignedBatches.add(items);
    assignedLocation = locationCode;
    return ShelfBatchSubmission(batchId: 'lote-teste', totalItems: items.length, locationCode: locationCode);
  }
}

ScanProvider _buildProvider(_FakeScannerApi api, {DeviceSettings? stored}) {
  return ScanProvider(
    settingsStore: _MemorySettingsStore(
      stored ?? const DeviceSettings(baseUrl: 'http://192.168.1.240:8788', deviceKey: 'chave-de-teste-0123456789'),
    ),
    apiFactory: (DeviceSettings settings) => api,
  );
}

void main() {
  test('conecta usando a configuracao guardada, sem usuario e senha', () async {
    final api = _FakeScannerApi(catalog: <String, String>{'2000': 'CABO PP 3X2,5'});
    final provider = _buildProvider(api);

    await provider.loadSettings();

    expect(provider.isConnected, isTrue);
    expect(provider.session?.device, 'Coletor Estoque 1');
    expect(provider.errorMessage, isNull);
  });

  test('nao conecta enquanto o aparelho nao estiver configurado', () async {
    final provider = _buildProvider(_FakeScannerApi(), stored: DeviceSettings.empty);

    await provider.loadSettings();

    expect(provider.isConnected, isFalse);
    expect(provider.errorMessage, isNull);
  });

  test('mostra a mensagem do servico quando a chave do aparelho e recusada', () async {
    final api = _FakeScannerApi()..sessionFailure = const ScannerApiException('Aparelho não autorizado.');
    final provider = _buildProvider(api);

    await provider.loadSettings();

    expect(provider.isConnected, isFalse);
    expect(provider.errorMessage, 'Aparelho não autorizado.');
  });

  test('identifica o item lido e mostra o endereco atual', () async {
    final api = _FakeScannerApi(
      catalog: <String, String>{'2000': 'CABO PP 3X2,5'},
      locations: <String, String>{'2000': 'A-01'},
    );
    final provider = _buildProvider(api);
    await provider.loadSettings();

    await provider.addScannedCode('2000');

    expect(provider.items.single.status, ScanStatus.found);
    expect(provider.items.single.productDescription, 'CABO PP 3X2,5');
    expect(provider.items.single.currentLocation, 'A-01');
  });

  test('marca na hora o codigo que nao esta no catalogo', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO PP 3X2,5'}));
    await provider.loadSettings();

    await provider.addScannedCode('404404');

    expect(provider.items.single.status, ScanStatus.notFound);
    expect(provider.sendableCount, 0);
  });

  test('ignora a releitura do mesmo codigo no lote', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO PP 3X2,5'}));
    await provider.loadSettings();

    await provider.addScannedCode('2000');
    await provider.addScannedCode(' 2000 ');

    expect(provider.items.length, 1);
  });

  test('so libera o envio com endereco informado e item valido', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO PP 3X2,5'}));
    await provider.loadSettings();
    expect(provider.canSubmit, isFalse);

    await provider.addScannedCode('2000');
    expect(provider.canSubmit, isFalse);

    provider.setLocationCode('   ');
    expect(provider.canSubmit, isFalse);

    provider.setLocationCode('Rua 2 Nivel 5');
    expect(provider.canSubmit, isTrue);
  });

  test('envia uma prateleira inteira para confirmacao posterior pela extensao', () async {
    final api = _FakeScannerApi(catalog: <String, String>{'2000': 'CABO PP 3X2,5', '2001': 'DISJUNTOR 25A'});
    final provider = _buildProvider(api);
    await provider.loadSettings();
    await provider.addScannedCode('2000');
    await provider.addScannedCode('2001');
    await provider.addScannedCode('404404');
    provider.setLocationCode('Rua 2 Nivel 5');

    final ok = await provider.submitBatch();

    expect(ok, isTrue);
    expect(api.assignedBatches.single.map((ShelfBatchItem item) => item.productCode), <String>['2000', '2001']);
    expect(api.assignedLocation, 'Rua 2 Nivel 5');
    expect(provider.items.map((ScannedItem item) => item.status).toList(), <ScanStatus>[
      ScanStatus.found,
      ScanStatus.found,
      ScanStatus.notFound,
    ]);
    expect(provider.lastAssignment?.totalItems, 2);
  });

  test('preserva o lote quando o envio falha, para o estoquista tentar de novo', () async {
    final api = _FakeScannerApi(catalog: <String, String>{'2000': 'CABO PP 3X2,5'})
      ..assignFailure = const ScannerApiException('O serviço da loja não respondeu.');
    final provider = _buildProvider(api);
    await provider.loadSettings();
    await provider.addScannedCode('2000');
    provider.setLocationCode('Rua 2 Nivel 5');

    final ok = await provider.submitBatch();

    expect(ok, isFalse);
    expect(provider.errorMessage, 'O serviço da loja não respondeu.');
    expect(provider.items.single.status, ScanStatus.found);
    expect(provider.canSubmit, isTrue);
  });

  test('limpa o lote sem derrubar a sessao do aparelho', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO PP 3X2,5'}));
    await provider.loadSettings();
    await provider.addScannedCode('2000');
    provider.setLocationCode('Rua 2 Nivel 5');

    provider.clearBatch();

    expect(provider.items, isEmpty);
    expect(provider.locationCode, isEmpty);
    expect(provider.isConnected, isTrue);
  });

  test('abre na primeira empresa quando o aparelho ainda nao escolheu nenhuma', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO'}));
    await provider.loadSettings();

    expect(provider.company, 'EH');
    expect(provider.hasCompanyChoice, isTrue);
    expect(provider.selectedCompany?.name, 'Eletronica Horizonte');
  });

  test('reabre na empresa que o aparelho estava usando', () async {
    final provider = _buildProvider(
      _FakeScannerApi(catalog: <String, String>{'2000': 'CABO'}),
      stored: const DeviceSettings(
        baseUrl: 'http://192.168.1.240:8788',
        deviceKey: 'chave-de-teste-0123456789',
        company: 'MVA',
      ),
    );
    await provider.loadSettings();

    expect(provider.company, 'MVA');
  });

  test('cai na primeira empresa se a guardada nao existir mais no servico', () async {
    final provider = _buildProvider(
      _FakeScannerApi(catalog: <String, String>{'2000': 'CABO'}),
      stored: const DeviceSettings(
        baseUrl: 'http://192.168.1.240:8788',
        deviceKey: 'chave-de-teste-0123456789',
        company: 'EXTINTA',
      ),
    );
    await provider.loadSettings();

    expect(provider.company, 'EH');
  });

  test('a empresa escolhida acompanha a leitura e o envio', () async {
    final api = _FakeScannerApi(catalog: <String, String>{'2000': 'CABO'});
    final provider = _buildProvider(api);
    await provider.loadSettings();
    await provider.setCompany('MVA');

    await provider.addScannedCode('2000');
    provider.setLocationCode('RUA 1 NIVEL 1 PRAT DIR');
    await provider.submitBatch();

    expect(api.empresasUsadas, everyElement('MVA'));
  });

  test('trocar de empresa descarta o lote lido para a empresa anterior', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO'}));
    await provider.loadSettings();
    await provider.addScannedCode('2000');
    provider.setLocationCode('RUA 1 NIVEL 1 PRAT DIR');
    expect(provider.items.length, 1);

    await provider.setCompany('MVA');

    expect(provider.items, isEmpty);
    expect(provider.locationCode, isEmpty);
    expect(provider.isConnected, isTrue, reason: 'trocar de empresa nao derruba a sessao');
  });

  test('escolher a mesma empresa nao descarta nada', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO'}));
    await provider.loadSettings();
    await provider.addScannedCode('2000');

    await provider.setCompany('EH');

    expect(provider.items.length, 1);
  });

  test('associar o codigo lido a um produto deixa o item pronto para envio', () async {
    final api = _FakeScannerApi(catalog: <String, String>{'17695': 'SPOT LED BF'});
    final provider = _buildProvider(api);
    await provider.loadSettings();
    await provider.addScannedCode('7899452028976');
    expect(provider.items.single.status, ScanStatus.notFound);
    expect(provider.sendableCount, 0);

    final erro = await provider.associarCodigoDeBarras(code: '7899452028976', productCode: '17695');

    expect(erro, isNull);
    expect(api.barcodesAssociados, isEmpty, reason: 'a leitura nao escreve no ZWeb item a item');
    expect(provider.items.single.status, ScanStatus.found);
    expect(provider.items.single.productCode, '17695');
    expect(provider.items.single.barcodePendingRegistration, isTrue);
    expect(provider.sendableCount, 1, reason: 'o item passa a contar para o envio');
  });

  test('aceita associar um produto fora do catalogo e deixa a extensao validar depois', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'17695': 'SPOT LED BF'}));
    await provider.loadSettings();
    await provider.addScannedCode('7899452028976');

    final erro = await provider.associarCodigoDeBarras(code: '7899452028976', productCode: '99999');

    expect(erro, isNull);
    expect(provider.items.single.status, ScanStatus.found);
    expect(provider.items.single.productCode, '99999');
  });

  test('a configuracao so e dada por carregada depois de ler o aparelho', () async {
    final provider = _buildProvider(_FakeScannerApi(catalog: <String, String>{'2000': 'CABO'}));

    expect(provider.settingsLoaded, isFalse, reason: 'antes de ler, a tela de configuracao nao pode aparecer');

    await provider.loadSettings();

    expect(provider.settingsLoaded, isTrue);
    expect(provider.settings.baseUrl, 'http://192.168.1.240:8788');
    expect(provider.settings.deviceKey, isNotEmpty);
  });

  test('conexao que falha nao apaga a configuracao guardada', () async {
    // Era o engano da tela em branco: sem rede, parecia que o aparelho tinha
    // perdido endereco e chave.
    final api = _FakeScannerApi()..sessionFailure = const ScannerApiException('O serviço da loja não respondeu.');
    final provider = _buildProvider(api);

    await provider.loadSettings();

    expect(provider.settingsLoaded, isTrue);
    expect(provider.isConnected, isFalse);
    expect(provider.errorMessage, 'O serviço da loja não respondeu.');
    expect(provider.settings.baseUrl, 'http://192.168.1.240:8788');
    expect(provider.settings.deviceKey, 'chave-de-teste-0123456789');
  });
}
