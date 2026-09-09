import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/device_settings.dart';
import '../providers/scan_provider.dart';
import '../theme/app_theme.dart';

/// Configuração do aparelho. Substitui a tela de usuário e senha do desenho
/// original: o coletor se identifica por uma chave própria, entregue pelo
/// responsável do serviço interno.
class DeviceSetupScreen extends StatefulWidget {
  const DeviceSetupScreen({super.key});

  @override
  State<DeviceSetupScreen> createState() => _DeviceSetupScreenState();
}

class _DeviceSetupScreenState extends State<DeviceSetupScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _baseUrlController;
  late final TextEditingController _deviceKeyController;

  @override
  void initState() {
    super.initState();
    final settings = context.read<ScanProvider>().settings;
    _baseUrlController = TextEditingController(text: settings.baseUrl);
    _deviceKeyController = TextEditingController(text: settings.deviceKey);
  }

  @override
  void dispose() {
    _baseUrlController.dispose();
    _deviceKeyController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final provider = context.read<ScanProvider>();
    final connected = await provider.saveSettings(
      DeviceSettings(baseUrl: _baseUrlController.text, deviceKey: _deviceKeyController.text),
    );
    if (!mounted || connected) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(provider.errorMessage ?? 'Não foi possível conectar.'),
        backgroundColor: Theme.of(context).colorScheme.error,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ScanProvider>();
    final cores = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Configuração')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              const _Marca(),
              const SizedBox(height: 32),
              TextFormField(
                controller: _baseUrlController,
                keyboardType: TextInputType.url,
                autocorrect: false,
                decoration: const InputDecoration(
                  labelText: 'Endereço do serviço',
                  hintText: 'http://192.168.1.240:8788',
                ),
                validator: (String? value) {
                  final text = value?.trim() ?? '';
                  if (text.isEmpty) return 'Informe o endereço do serviço.';
                  final uri = Uri.tryParse(text);
                  if (uri == null || !uri.isAbsolute || uri.host.isEmpty) return 'Endereço inválido.';
                  return null;
                },
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _deviceKeyController,
                autocorrect: false,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Chave do aparelho'),
                validator: (String? value) {
                  final text = value?.trim() ?? '';
                  if (text.length < 16) return 'A chave precisa ter ao menos 16 caracteres.';
                  return null;
                },
              ),
              const SizedBox(height: 26),
              FilledButton(
                onPressed: provider.busy ? null : _save,
                child: provider.busy
                    ? const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                          ),
                          SizedBox(width: 12),
                          Text('Conectando'),
                        ],
                      )
                    : const Text('Conectar'),
              ),
              if (provider.errorMessage != null) ...<Widget>[
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                  decoration: BoxDecoration(
                    color: cores.errorContainer,
                    borderRadius: BorderRadius.circular(AppTheme.raio - 2),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Icon(Icons.error_outline, size: 20, color: cores.onErrorContainer),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          provider.errorMessage!,
                          style: TextStyle(
                            color: cores.onErrorContainer,
                            fontSize: 14,
                            height: 1.3,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Marca extends StatelessWidget {
  const _Marca();

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    return Row(
      children: <Widget>[
        Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(color: cores.primary, borderRadius: BorderRadius.circular(16)),
          child: Icon(Icons.place, size: 31, color: cores.onPrimary),
        ),
        const SizedBox(width: 14),
        Text(
          AppTheme.nome,
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.8,
            color: cores.onSurface,
          ),
        ),
      ],
    );
  }
}
