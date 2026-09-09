import 'package:flutter/foundation.dart';

import '../models/scan_models.dart';
import '../models/device_settings.dart';
import '../services/scanner_api.dart';

/// Estado da jornada do estoquista: configurar o aparelho, ler os itens,
/// ler o endereço e enviar o lote.
class ScanProvider extends ChangeNotifier {
  ScanProvider({required SettingsStore settingsStore, required ScannerApiFactory apiFactory})
    // Um parâmetro nomeado não pode ser privado, então os campos são atribuídos aqui.
    // ignore: prefer_initializing_formals
    : _settingsStore = settingsStore,
      // ignore: prefer_initializing_formals
      _apiFactory = apiFactory;

  final SettingsStore _settingsStore;
  final ScannerApiFactory _apiFactory;

  ScannerApi? _api;
  DeviceSettings _settings = DeviceSettings.empty;
  SessionInfo? _session;
  final List<ScannedItem> _items = <ScannedItem>[];
  String _locationCode = '';
  bool _busy = false;
  String? _errorMessage;
  ShelfBatchSubmission? _lastAssignment;
  String _company = '';
  bool _settingsLoaded = false;

  DeviceSettings get settings => _settings;

  /// Falso até a configuração guardada ser lida do aparelho. A tela de
  /// configuração não pode ser construída antes disso: ela copia os valores no
  /// `initState` e ficaria em branco, parecendo que a configuração se perdeu.
  bool get settingsLoaded => _settingsLoaded;
  SessionInfo? get session => _session;
  List<ScannedItem> get items => List<ScannedItem>.unmodifiable(_items);
  String get locationCode => _locationCode;
  bool get busy => _busy;
  String? get errorMessage => _errorMessage;
  ShelfBatchSubmission? get lastAssignment => _lastAssignment;
  bool get isConnected => _session != null;

  List<Company> get companies => _session?.companies ?? const <Company>[];
  String get company => _company;
  Company? get selectedCompany =>
      companies.where((Company item) => item.code == _company).firstOrNull;
  bool get hasCompanyChoice => companies.length > 1;

  int get sendableCount => _items.where((item) => item.isSendable).length;
  bool get canSubmit => !_busy && isConnected && _locationCode.trim().isNotEmpty && sendableCount > 0;

  /// Mantem a empresa guardada se ela ainda existir no servico; senao cai na
  /// primeira. Endereçar na empresa errada e um erro silencioso e caro, entao
  /// nunca fica sem empresa definida.
  String _escolherEmpresa(List<Company> disponiveis, String preferida) {
    if (disponiveis.isEmpty) return '';
    if (disponiveis.any((Company item) => item.code == preferida)) return preferida;
    return disponiveis.first.code;
  }

  /// Troca a empresa e descarta o lote: os itens foram lidos mostrando o
  /// endereço da empresa anterior, e enviá-los para outra seria engano.
  Future<void> setCompany(String code) async {
    if (code.isEmpty || code == _company) return;
    _company = code;
    _items.clear();
    _locationCode = '';
    _lastAssignment = null;
    _errorMessage = null;
    _settings = _settings.copyWith(company: code);
    await _settingsStore.save(_settings);
    notifyListeners();
  }

  Future<void> loadSettings() async {
    _settings = await _settingsStore.load();
    _company = _settings.company;
    _settingsLoaded = true;
    notifyListeners();
    if (_settings.isComplete) await connect();
  }

  Future<bool> saveSettings(DeviceSettings settings) async {
    _settings = DeviceSettings(
      baseUrl: settings.baseUrl.trim(),
      deviceKey: settings.deviceKey.trim(),
      company: _company,
    );
    await _settingsStore.save(_settings);
    notifyListeners();
    return connect();
  }

  /// Abre a sessão do coletor e confirma que a chave do aparelho é aceita.
  Future<bool> connect() async {
    if (!_settings.isComplete) {
      _fail('Informe o endereço do serviço e a chave do aparelho.');
      return false;
    }
    _begin();
    try {
      _api = _apiFactory(_settings);
      _session = await _api!.openSession();
      _company = _escolherEmpresa(_session!.companies, _settings.company);
      _finish();
      return true;
    } on ScannerApiException catch (error) {
      _session = null;
      _fail(error.message);
      return false;
    }
  }

  /// Registra um código lido e pergunta ao serviço de que produto se trata.
  Future<void> addScannedCode(String rawCode) async {
    final code = rawCode.trim();
    if (code.isEmpty) return;
    if (_items.any((item) => item.code == code)) return;
    if (_api == null) {
      _fail('Conecte o coletor ao serviço antes de ler os itens.');
      return;
    }

    _items.add(ScannedItem(code: code));
    _errorMessage = null;
    notifyListeners();

    try {
      final resolved = await _api!.resolveCodes(<String>[code], company: _company);
      final product = resolved.where((item) => item.scannedCode == code).firstOrNull;
      _replaceItem(
        code,
        (item) => product == null || !product.found
            ? item.copyWith(status: ScanStatus.notFound, message: 'Produto não encontrado no catálogo.')
            : item.copyWith(
                status: ScanStatus.found,
                productId: product.productId,
                productCode: product.productCode,
                productDescription: product.productDescription,
                currentLocation: product.currentLocation,
              ),
      );
    } on ScannerApiException catch (error) {
      _replaceItem(code, (item) => item.copyWith(status: ScanStatus.failed, message: error.message));
    }
    notifyListeners();
  }

  void removeCode(String code) {
    _items.removeWhere((item) => item.code == code);
    notifyListeners();
  }

  void setLocationCode(String locationCode) {
    _locationCode = locationCode;
    notifyListeners();
  }

  /// Pergunta ao serviço se o texto do endereço é, na verdade, um produto do
  /// catálogo. Sem rede, devolve falso: o aviso local já cobre o caso óbvio.
  Future<bool> enderecoExisteComoProduto() async {
    final endereco = _locationCode.trim();
    if (endereco.isEmpty || _api == null) return false;
    try {
      final resolvidos = await _api!.resolveCodes(<String>[endereco], company: _company);
      return resolvidos.any((ResolvedProduct item) => item.found);
    } on ScannerApiException {
      return false;
    }
  }

  /// A associação entra no lote. Não há RPC ao ZWeb nesta etapa, porque o
  /// estoque costuma reunir uma prateleira inteira antes de enviar.
  Future<String?> associarCodigoDeBarras({required String code, required String productCode}) async {
    final normalizedProductCode = productCode.trim();
    if (normalizedProductCode.isEmpty) return 'Informe o código do produto.';
    _replaceItem(
      code,
      (item) => item.copyWith(
        status: ScanStatus.found,
        productCode: normalizedProductCode,
        productDescription: 'Produto $normalizedProductCode',
        message: 'Será cadastrado quando o lote for enviado.',
        barcodePendingRegistration: true,
      ),
    );
    notifyListeners();
    return null;
  }

  void clearBatch() {
    _items.clear();
    _locationCode = '';
    _lastAssignment = null;
    _errorMessage = null;
    notifyListeners();
  }

  /// Envia uma prateleira inteira ao serviço interno. A extensão faz a etapa
  /// posterior, controlada, de confirmar os produtos no ZWeb.
  Future<bool> submitBatch() async {
    if (!canSubmit) return false;
    _begin();
    try {
      final items = _items.where((item) => item.isSendable && (item.productCode?.isNotEmpty ?? false)).map((item) => ShelfBatchItem(
        scannedCode: item.code,
        productId: item.productId,
        productCode: item.productCode!,
        productDescription: item.productDescription,
        barcode: item.barcodePendingRegistration ? item.code : null,
      )).toList(growable: false);
      final assignment = await _api!.submitShelfBatch(
        locationCode: _locationCode.trim(),
        items: items,
        company: _company,
      );
      _lastAssignment = assignment;
      _finish();
      return true;
    } on ScannerApiException catch (error) {
      _fail(error.message);
      return false;
    }
  }

  void _replaceItem(String code, ScannedItem Function(ScannedItem item) update) {
    final index = _items.indexWhere((item) => item.code == code);
    if (index < 0) return;
    _items[index] = update(_items[index]);
  }

  void _begin() {
    _busy = true;
    _errorMessage = null;
    notifyListeners();
  }

  void _finish() {
    _busy = false;
    notifyListeners();
  }

  void _fail(String message) {
    _busy = false;
    _errorMessage = message;
    notifyListeners();
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
