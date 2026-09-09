import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'models/device_settings.dart';
import 'providers/scan_provider.dart';
import 'screens/device_setup_screen.dart';
import 'screens/scan_screen.dart';
import 'services/scanner_api.dart';
import 'services/settings_store.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const BalizaApp());
}

class BalizaApp extends StatelessWidget {
  const BalizaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ScanProvider>(
      create: (BuildContext context) => ScanProvider(
        settingsStore: SharedPreferencesSettingsStore(),
        apiFactory: (DeviceSettings settings) => ZwebScannerApi(settings),
      )..loadSettings(),
      child: const _App(),
    );
  }
}

/// A empresa escolhida define o tema, então ela mora acima do [MaterialApp]:
/// trocar de empresa repinta a tela inteira, e não só um rótulo no topo.
class _App extends StatelessWidget {
  const _App();

  @override
  Widget build(BuildContext context) {
    final String empresa = context.select<ScanProvider, String>((ScanProvider provider) => provider.company);
    return MaterialApp(
      title: AppTheme.nome,
      theme: AppTheme.tema(empresa),
      // Sem transição de tema: a cor é um aviso, e aviso não desbota por meio
      // segundo. Também poupa o aparelho de 2 GB de interpolar o tema inteiro.
      themeAnimationDuration: Duration.zero,
      home: const _HomeGate(),
    );
  }
}

/// Mostra a configuração enquanto o aparelho não estiver autorizado.
class _HomeGate extends StatelessWidget {
  const _HomeGate();

  @override
  Widget build(BuildContext context) {
    final carregou = context.select<ScanProvider, bool>((ScanProvider provider) => provider.settingsLoaded);
    if (!carregou) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final connected = context.select<ScanProvider, bool>((ScanProvider provider) => provider.isConnected);
    return connected ? const ScanScreen() : const DeviceSetupScreen();
  }
}
