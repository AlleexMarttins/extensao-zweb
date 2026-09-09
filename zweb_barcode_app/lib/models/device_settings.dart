/// Endereço do serviço interno e chave deste coletor.
///
/// Não existe usuário nem senha: o serviço identifica o aparelho pela chave,
/// e é o nome do aparelho que fica registrado na auditoria de cada endereço.
class DeviceSettings {
  const DeviceSettings({required this.baseUrl, required this.deviceKey, this.company = ''});

  static const DeviceSettings empty = DeviceSettings(baseUrl: '', deviceKey: '');

  final String baseUrl;
  final String deviceKey;

  /// Ultima empresa escolhida neste aparelho, para o coletor abrir onde parou.
  final String company;

  bool get isComplete => baseUrl.isNotEmpty && deviceKey.isNotEmpty;

  DeviceSettings copyWith({String? company}) =>
      DeviceSettings(baseUrl: baseUrl, deviceKey: deviceKey, company: company ?? this.company);
}

/// Guarda a configuração do aparelho entre execuções do app.
abstract class SettingsStore {
  Future<DeviceSettings> load();

  Future<void> save(DeviceSettings settings);
}
