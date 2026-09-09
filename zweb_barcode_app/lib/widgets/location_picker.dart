import 'package:flutter/material.dart';

import '../models/shelf_location.dart';
import '../theme/app_theme.dart';

/// Monta o endereço em teclas, não em caixas de seleção.
///
/// O estoque inteiro cabe em duas fileiras, então todas as opções ficam à
/// vista: um toque por fileira fecha o endereço. Com a outra mão segurando a
/// caixa, abrir um menu, rolar e escolher era o gesto mais caro da tela.
///
/// As três fileiras só produzem um endereço quando as três têm valor — um
/// endereço pela metade não deve chegar ao campo de envio. Por isso a escolha
/// parcial mora aqui: partindo do campo vazio, nenhum toque sozinho completa
/// um endereço, e sem guardar os anteriores as fileiras nunca fechariam um.
class LocationPicker extends StatefulWidget {
  const LocationPicker({
    required this.selecao,
    required this.onChanged,
    super.key,
  });

  /// Valor atual do campo, se ele estiver no padrão da loja.
  final ShelfLocation? selecao;

  /// Chamado com o endereço composto assim que as três fileiras têm valor.
  final void Function(ShelfLocation location) onChanged;

  @override
  State<LocationPicker> createState() => _LocationPickerState();
}

class _LocationPickerState extends State<LocationPicker> {
  int? _rua;
  int? _nivel;
  String? _lado;

  @override
  void initState() {
    super.initState();
    _adotar(widget.selecao);
  }

  /// O campo continua mandando nas fileiras: endereço lido da etiqueta aparece
  /// aceso aqui, e endereço apagado apaga a escolha.
  @override
  void didUpdateWidget(LocationPicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selecao != oldWidget.selecao) _adotar(widget.selecao);
  }

  void _adotar(ShelfLocation? selecao) {
    _rua = selecao?.rua;
    _nivel = selecao?.nivel;
    _lado = selecao?.lado;
  }

  void _selecionar({int? rua, int? nivel, String? lado}) {
    setState(() {
      _rua = rua ?? _rua;
      _nivel = nivel ?? _nivel;
      _lado = lado ?? _lado;
    });
    final proximaRua = _rua;
    final proximoNivel = _nivel;
    final proximoLado = _lado;
    if (proximaRua == null || proximoNivel == null || proximoLado == null) return;
    widget.onChanged(ShelfLocation(rua: proximaRua, nivel: proximoNivel, lado: proximoLado));
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        _Fileira<int>(
          rotulo: 'Rua',
          opcoes: ShelfLocation.ruas,
          valor: _rua,
          textoDaOpcao: (int rua) => '$rua',
          onChanged: (int rua) => _selecionar(rua: rua),
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Expanded(
              flex: 5,
              child: _Fileira<int>(
                rotulo: 'Nível',
                opcoes: ShelfLocation.niveis,
                valor: _nivel,
                textoDaOpcao: (int nivel) => '$nivel',
                onChanged: (int nivel) => _selecionar(nivel: nivel),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              flex: 2,
              child: _Fileira<String>(
                rotulo: 'Lado',
                opcoes: ShelfLocation.lados,
                valor: _lado,
                textoDaOpcao: (String lado) => lado,
                onChanged: (String lado) => _selecionar(lado: lado),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// O endereço fechado, no lugar das teclas.
///
/// Depois de escolhido, o endereço é lido muitas vezes e mexido quase nunca:
/// vale mais como uma linha grande do que como três fileiras ocupando a lista.
class LocationSummary extends StatelessWidget {
  const LocationSummary({required this.endereco, required this.onTap, super.key});

  final String endereco;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    final raio = BorderRadius.circular(12);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: raio,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: <Widget>[
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(color: cores.primaryContainer, borderRadius: BorderRadius.circular(11)),
                child: Icon(Icons.place, size: 22, color: cores.onPrimaryContainer),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  endereco,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.2,
                    height: 1.15,
                    color: cores.onSurface,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Icon(Icons.edit_outlined, size: 22, color: cores.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }
}

class _Fileira<T> extends StatelessWidget {
  const _Fileira({
    required this.rotulo,
    required this.opcoes,
    required this.valor,
    required this.textoDaOpcao,
    required this.onChanged,
  });

  final String rotulo;
  final List<T> opcoes;
  final T? valor;
  final String Function(T opcao) textoDaOpcao;
  final void Function(T opcao) onChanged;

  @override
  Widget build(BuildContext context) {
    final tema = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          rotulo.toUpperCase(),
          style: tema.textTheme.labelSmall?.copyWith(color: tema.colorScheme.onSurfaceVariant),
        ),
        const SizedBox(height: 6),
        Row(
          children: List<Widget>.generate(
            opcoes.length,
            (int i) => Expanded(
              child: Padding(
                padding: EdgeInsets.only(left: i == 0 ? 0 : 5),
                child: _Tecla(
                  texto: textoDaOpcao(opcoes[i]),
                  ativa: opcoes[i] == valor,
                  onTap: () => onChanged(opcoes[i]),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Tecla extends StatelessWidget {
  const _Tecla({required this.texto, required this.ativa, required this.onTap});

  final String texto;
  final bool ativa;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    final raio = BorderRadius.circular(10);
    return Material(
      color: ativa ? cores.primary : cores.surfaceContainerHighest,
      borderRadius: raio,
      child: InkWell(
        onTap: onTap,
        borderRadius: raio,
        child: Container(
          height: AppTheme.alvo,
          alignment: Alignment.center,
          child: Text(
            texto,
            maxLines: 1,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: ativa ? cores.onPrimary : cores.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }
}
