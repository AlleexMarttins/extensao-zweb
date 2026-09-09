import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../models/scan_models.dart';
import '../models/shelf_location.dart';
import '../providers/scan_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/company_switcher.dart';
import '../widgets/location_picker.dart';
import '../widgets/scanned_items_list.dart';
import 'barcode_scanner_screen.dart';
import 'device_setup_screen.dart';

/// Ícones claros sobre a faixa colorida do topo.
const SystemUiOverlayStyle _barraDeSistema = SystemUiOverlayStyle(
  statusBarColor: Colors.transparent,
  statusBarIconBrightness: Brightness.light,
  statusBarBrightness: Brightness.dark,
);

/// Tela principal do estoquista: lê os itens, lê o endereço e envia o lote.
///
/// O topo colorido junta as duas decisões que mandam o lote para algum lugar —
/// qual empresa e qual endereço. O resto da tela é a lista, que é o que o
/// estoquista fica olhando enquanto trabalha.
class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final TextEditingController _locationController = TextEditingController();

  /// A seleção atende o estoque inteiro; o campo livre existe para os locais
  /// fora do padrão, como GVE-07. Os dois ativos ao mesmo tempo só criavam
  /// dúvida sobre qual valia.
  bool _enderecoLivre = false;

  /// Nulo = as teclas decidem sozinhas: ficam à vista enquanto o lote não
  /// começou e dão lugar ao endereço fechado depois do primeiro item, que é
  /// quando a lista passa a valer mais que elas. Tocar no endereço reabre.
  bool? _tecladoAberto;

  @override
  void dispose() {
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _scanItems() async {
    final provider = context.read<ScanProvider>();
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext context) => BarcodeScannerScreen(
          title: 'Ler itens',
          continuous: true,
          onCode: (String code) async {
            await provider.addScannedCode(code);
            final item = provider.items.where((ScannedItem entry) => entry.code == code).firstOrNull;
            if (item == null) {
              return ScanFeedback('Já estava na lista', kind: ScanFeedbackKind.aviso, codigo: code);
            }
            switch (item.status) {
              case ScanStatus.found:
              case ScanStatus.saved:
              case ScanStatus.resolving:
                final descricao = item.productDescription;
                return ScanFeedback(
                  descricao != null && descricao.isNotEmpty ? descricao : 'Item lido',
                  codigo: code,
                );
              case ScanStatus.notFound:
                return ScanFeedback('Fora do catálogo', kind: ScanFeedbackKind.erro, codigo: code);
              case ScanStatus.failed:
                return ScanFeedback(
                  item.message ?? 'Falha na leitura',
                  kind: ScanFeedbackKind.erro,
                  codigo: code,
                );
            }
          },
        ),
      ),
    );
  }

  Future<void> _scanLocation() async {
    final provider = context.read<ScanProvider>();
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext context) => BarcodeScannerScreen(
          title: 'Ler endereço',
          onCode: (String code) async {
            _locationController.text = code;
            provider.setLocationCode(code);
            return ScanFeedback(code);
          },
        ),
      ),
    );
  }

  /// Barra o engano mais caro: ler a etiqueta do produto no lugar da etiqueta
  /// da prateleira, gravando um código de barras como endereço.
  Future<bool> _confirmarEnderecoSuspeito(ScanProvider provider) async {
    final endereco = provider.locationCode.trim();
    final suspeito = pareceCodigoDeProduto(endereco) || await provider.enderecoExisteComoProduto();
    if (!suspeito || !mounted) return !suspeito;

    final confirmado = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        icon: const Icon(Icons.warning_amber_rounded, size: 32),
        title: const Text('Isso parece um produto'),
        content: Text('"$endereco" tem cara de código de produto, não de endereço.'),
        actions: <Widget>[
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Enviar assim mesmo')),
        ],
      ),
    );
    return confirmado == true;
  }

  Future<void> _submit() async {
    final provider = context.read<ScanProvider>();
    if (!await _confirmarEnderecoSuspeito(provider)) return;
    await provider.submitBatch();
    if (!mounted) return;

    final assignment = provider.lastAssignment;
    final falhou = provider.errorMessage != null || assignment == null;
    final message = provider.errorMessage ?? (assignment == null ? 'Nada foi enviado.' : 'Sucesso!');

    final cores = Theme.of(context).colorScheme;
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: falhou ? cores.error : AppTheme.sucesso,
          behavior: SnackBarBehavior.floating,
          margin: EdgeInsets.only(
            left: 24,
            right: 24,
            bottom: MediaQuery.sizeOf(context).height / 2 - 28,
          ),
          showCloseIcon: true,
          closeIconColor: Colors.white70,
        ),
      );
  }

  /// A seleção manda no campo de texto, e não o contrário: assim o endereço
  /// enviado tem sempre a mesma grafia das etiquetas impressas.
  void _aplicarSelecao(ShelfLocation location) {
    final texto = location.toString();
    _locationController.text = texto;
    context.read<ScanProvider>().setLocationCode(texto);
    setState(() => _tecladoAberto = null);
  }

  /// Trocar de empresa descarta o lote, entao confirma quando ha itens lidos.
  Future<void> _trocarEmpresa(String code) async {
    final provider = context.read<ScanProvider>();
    final lidos = provider.items.length;
    if (lidos > 0) {
      final confirmado = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text('Trocar de empresa?'),
          content: Text(
            lidos == 1 ? 'O item lido será descartado.' : 'Os $lidos itens lidos serão descartados.',
          ),
          actions: <Widget>[
            TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Trocar')),
          ],
        ),
      );
      if (confirmado != true) return;
    }
    await provider.setCompany(code);
    if (!mounted) return;
    _locationController.clear();
    setState(() => _tecladoAberto = null);
  }

  /// O código lido não existe no catálogo. Em vez de descartar a leitura, o
  /// estoquista informa o produto e a associação segue junto com a prateleira.
  Future<void> _associarCodigoDeBarras(String code) async {
    final provider = context.read<ScanProvider>();
    final querAssociar = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('Endereçar código de barras a um produto?'),
        content: Text(code),
        actions: <Widget>[
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Não')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Sim')),
        ],
      ),
    );
    if (querAssociar != true || !mounted) return;

    final productCode = await showDialog<String>(
      context: context,
      builder: (BuildContext context) => const _CodigoDoProdutoDialog(),
    );
    if (productCode == null || productCode.isEmpty || !mounted) return;

    final erro = await provider.associarCodigoDeBarras(code: code, productCode: productCode);
    if (!mounted) return;
    final cores = Theme.of(context).colorScheme;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(erro ?? 'Código separado para o produto $productCode no envio do lote.'),
        backgroundColor: erro == null ? AppTheme.sucesso : cores.error,
      ),
    );
  }

  void _clearBatch() {
    _locationController.clear();
    context.read<ScanProvider>().clearBatch();
    setState(() => _tecladoAberto = null);
  }

  void _alternarModoDeEndereco() {
    final provider = context.read<ScanProvider>();
    setState(() {
      _enderecoLivre = !_enderecoLivre;
      _tecladoAberto = null;
    });
    if (_enderecoLivre) return;
    // Voltando para a seleção, um valor fora do padrão não tem como ser
    // representado pelas teclas, então sai de cena em vez de ficar invisível.
    if (ShelfLocation.parse(provider.locationCode) == null) {
      _locationController.clear();
      provider.setLocationCode('');
    }
  }

  void _abrirConfiguracao() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (BuildContext context) => const DeviceSetupScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: _barraDeSistema,
      child: Scaffold(
        body: Column(
          children: <Widget>[
            Material(
              color: cores.primary,
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 2, 6, 12),
                  child: Column(
                    children: <Widget>[
                      _BarraDoAparelho(onLimpar: _clearBatch, onConfigurar: _abrirConfiguracao),
                      const SizedBox(height: 8),
                      _SeletorDeEmpresa(onTrocar: _trocarEmpresa),
                      _cartaoDeEndereco(context),
                    ],
                  ),
                ),
              ),
            ),
            const _AvisoDeCatalogo(),
            Expanded(child: _Lista(onAssignBarcode: _associarCodigoDeBarras)),
            _BarraDeAcoes(onLer: _scanItems, onEnviar: _submit),
          ],
        ),
      ),
    );
  }

  Widget _cartaoDeEndereco(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    final endereco = context.select<ScanProvider, String>((ScanProvider provider) => provider.locationCode);
    final temItens = context.select<ScanProvider, bool>((ScanProvider provider) => provider.items.isNotEmpty);
    final aberto = _enderecoLivre || (_tecladoAberto ?? (!temItens || endereco.trim().isEmpty));

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(
        color: cores.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(18),
      ),
      child: aberto
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                if (_enderecoLivre)
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: TextField(
                          controller: _locationController,
                          autofocus: true,
                          decoration: const InputDecoration(labelText: 'Endereço'),
                          onChanged: context.read<ScanProvider>().setLocationCode,
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton.filledTonal(
                        onPressed: _scanLocation,
                        icon: const Icon(Icons.qr_code_scanner),
                        iconSize: 24,
                        tooltip: 'Ler endereço',
                      ),
                    ],
                  )
                else
                  LocationPicker(selecao: ShelfLocation.parse(endereco), onChanged: _aplicarSelecao),
                const SizedBox(height: 2),
                TextButton.icon(
                  onPressed: _alternarModoDeEndereco,
                  icon: Icon(_enderecoLivre ? Icons.grid_view_rounded : Icons.keyboard_outlined, size: 19),
                  label: Text(_enderecoLivre ? 'Rua, nível e lado' : 'Outro endereço'),
                ),
              ],
            )
          : LocationSummary(
              endereco: endereco,
              onTap: () => setState(() => _tecladoAberto = true),
            ),
    );
  }
}

class _BarraDoAparelho extends StatelessWidget {
  const _BarraDoAparelho({required this.onLimpar, required this.onConfigurar});

  final VoidCallback onLimpar;
  final VoidCallback onConfigurar;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    final aparelho = context.select<ScanProvider, String>(
      (ScanProvider provider) => provider.session?.device ?? '',
    );
    final temItens = context.select<ScanProvider, bool>(
      (ScanProvider provider) => provider.items.isNotEmpty,
    );

    return Row(
      children: <Widget>[
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            aparelho,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: cores.onPrimary.withValues(alpha: 0.85),
            ),
          ),
        ),
        IconButton(
          tooltip: 'Limpar lote',
          onPressed: temItens ? onLimpar : null,
          color: cores.onPrimary,
          disabledColor: cores.onPrimary.withValues(alpha: 0.35),
          icon: const Icon(Icons.playlist_remove),
        ),
        IconButton(
          tooltip: 'Configuração',
          onPressed: onConfigurar,
          color: cores.onPrimary,
          icon: const Icon(Icons.settings_outlined),
        ),
      ],
    );
  }
}

class _SeletorDeEmpresa extends StatelessWidget {
  const _SeletorDeEmpresa({required this.onTrocar});

  final void Function(String codigo) onTrocar;

  @override
  Widget build(BuildContext context) {
    final empresas = context.select<ScanProvider, List<Company>>(
      (ScanProvider provider) => provider.companies,
    );
    if (empresas.isEmpty) return const SizedBox.shrink();

    final cores = Theme.of(context).colorScheme;
    final selecionada = context.select<ScanProvider, String>((ScanProvider provider) => provider.company);
    final ocupado = context.select<ScanProvider, bool>((ScanProvider provider) => provider.busy);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: empresas.length == 1
          ? Padding(
              padding: const EdgeInsets.fromLTRB(4, 2, 4, 6),
              child: Text(
                empresas.single.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.4,
                  color: cores.onPrimary,
                ),
              ),
            )
          : CompanySwitcher(
              empresas: empresas,
              selecionada: selecionada,
              onChanged: ocupado ? null : onTrocar,
            ),
    );
  }
}

class _AvisoDeCatalogo extends StatelessWidget {
  const _AvisoDeCatalogo();

  @override
  Widget build(BuildContext context) {
    final vazio = context.select<ScanProvider, bool>((ScanProvider provider) {
      final sessao = provider.session;
      return sessao != null && sessao.catalogItems == 0;
    });
    if (!vazio) return const SizedBox.shrink();

    final cores = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      color: cores.errorContainer,
      padding: const EdgeInsets.fromLTRB(16, 6, 8, 6),
      child: Row(
        children: <Widget>[
          Icon(Icons.warning_amber_rounded, size: 20, color: cores.onErrorContainer),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Catálogo de produtos vazio.',
              style: TextStyle(color: cores.onErrorContainer, fontSize: 14, fontWeight: FontWeight.w700),
            ),
          ),
          TextButton(
            onPressed: () => context.read<ScanProvider>().connect(),
            style: TextButton.styleFrom(foregroundColor: cores.onErrorContainer),
            child: const Text('Verificar'),
          ),
        ],
      ),
    );
  }
}

class _Lista extends StatelessWidget {
  const _Lista({required this.onAssignBarcode});

  final void Function(String code) onAssignBarcode;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ScanProvider>();
    return ScannedItemsList(
      items: provider.items,
      onRemove: provider.removeCode,
      onAssignBarcode: onAssignBarcode,
    );
  }
}

class _BarraDeAcoes extends StatelessWidget {
  const _BarraDeAcoes({required this.onLer, required this.onEnviar});

  final Future<void> Function() onLer;
  final Future<void> Function() onEnviar;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    final ocupado = context.select<ScanProvider, bool>((ScanProvider provider) => provider.busy);
    final podeEnviar = context.select<ScanProvider, bool>((ScanProvider provider) => provider.canSubmit);
    final prontos = context.select<ScanProvider, int>((ScanProvider provider) => provider.sendableCount);

    return Container(
      decoration: BoxDecoration(
        color: cores.surfaceContainerLowest,
        border: Border(top: BorderSide(color: cores.outlineVariant)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
          child: Row(
            children: <Widget>[
              Expanded(
                child: FilledButton.tonalIcon(
                  onPressed: ocupado ? null : onLer,
                  icon: const Icon(Icons.barcode_reader),
                  label: const Text('Ler itens'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: podeEnviar ? onEnviar : null,
                  icon: ocupado
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                        )
                      : const Icon(Icons.arrow_upward_rounded),
                  label: Text(prontos > 0 ? 'Enviar ($prontos)' : 'Enviar'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}

/// Campo do código do produto: só números e no máximo cinco dígitos, que é o
/// tamanho dos códigos do cadastro.
class _CodigoDoProdutoDialog extends StatefulWidget {
  const _CodigoDoProdutoDialog();

  @override
  State<_CodigoDoProdutoDialog> createState() => _CodigoDoProdutoDialogState();
}

class _CodigoDoProdutoDialogState extends State<_CodigoDoProdutoDialog> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _confirmar() {
    final codigo = _controller.text.trim();
    if (codigo.isEmpty) return;
    Navigator.of(context).pop(codigo);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Código do produto'),
      content: TextField(
        controller: _controller,
        autofocus: true,
        keyboardType: TextInputType.number,
        maxLength: 5,
        textInputAction: TextInputAction.done,
        inputFormatters: <TextInputFormatter>[FilteringTextInputFormatter.digitsOnly],
        decoration: const InputDecoration(hintText: '17695', counterText: ''),
        onSubmitted: (String _) => _confirmar(),
      ),
      actions: <Widget>[
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancelar')),
        ValueListenableBuilder<TextEditingValue>(
          valueListenable: _controller,
          builder: (BuildContext context, TextEditingValue valor, Widget? child) => FilledButton(
            onPressed: valor.text.trim().isEmpty ? null : _confirmar,
            child: const Text('Associar'),
          ),
        ),
      ],
    );
  }
}
