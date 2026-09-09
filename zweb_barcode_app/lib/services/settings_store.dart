import 'package:shared_preferences/shared_preferences.dart';

import '../models/device_settings.dart';

class SharedPreferencesSettingsStore implements SettingsStore {
  static const String _baseUrlKey = 'zweb.baseUrl';
  static const String _deviceKeyKey = 'zweb.deviceKey';
  static const String _companyKey = 'zweb.company';

  @override
  Future<DeviceSettings> load() async {
    final preferences = await SharedPreferences.getInstance();
    return DeviceSettings(
      baseUrl: preferences.getString(_baseUrlKey) ?? '',
      deviceKey: preferences.getString(_deviceKeyKey) ?? '',
      company: preferences.getString(_companyKey) ?? '',
    );
  }

  @override
  Future<void> save(DeviceSettings settings) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_baseUrlKey, settings.baseUrl);
    await preferences.setString(_deviceKeyKey, settings.deviceKey);
    await preferences.setString(_companyKey, settings.company);
  }
}
