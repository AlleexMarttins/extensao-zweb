import 'package:flutter/material.dart';

import '../models/scan_models.dart';
import '../theme/app_theme.dart';

/// Lista dos códigos lidos, com o estado de cada um antes e depois do envio.
///
/// Três informações por item, em ordem de urgência: o que é o produto, que
/// código foi lido e — em destaque — onde ele já está guardado. Enviar o lote
/// sobrescreve esse local, então ele é a informação que decide se o estoquista
/// segue em frente ou tira o item da lista.
class ScannedItemsList extends StatelessWidget {
  const ScannedItemsList({
    required this.items,
    required this.onRemove,
    required this.onAssignBarcode,
    super.key,
  });

  final List<ScannedItem> items;
  final void Function(String code) onRemove;

  /// Chamado ao tocar num item que o catálogo não reconheceu.
  final void Function(String code) onAssignBarcode;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const _ListaVazia();

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
      itemCount: items.length,
      itemBuilder: (BuildContext context, int index) =>
          _Linha(item: items[index], onRemove: onRemove, onAssignBarcode: onAssignBarcode),
    );
  }
}

class _Linha extends StatelessWidget {
  const _Linha({required this.item, required this.onRemove, required this.onAssignBarcode});

  final ScannedItem item;
  final void Function(String code) onRemove;
  final void Function(String code) onAssignBarcode;

  @override
  Widget build(BuildContext context) {
    final tema = Theme.of(context);
    final cores = tema.colorScheme;

    final falhou = item.status == ScanStatus.notFound || item.status == ScanStatus.failed;
    final gravado = item.status == ScanStatus.saved;
    final faixa = switch (item.status) {
      ScanStatus.resolving => cores.outlineVariant,
      ScanStatus.found => cores.primary,
      ScanStatus.saved => AppTheme.sucesso,
      ScanStatus.notFound || ScanStatus.failed => cores.error,
    };

    final descricao = item.productDescription;
    final temDescricao = descricao != null && descricao.isNotEmpty;
    final local = item.currentLocation;
    final temLocal = local != null && local.isNotEmpty;
    final mensagem = item.message;
    final codigo = item.productCode;
    final temCodigo = codigo != null && codigo.isNotEmpty;
    // Só o item que o catálogo não reconheceu abre a associação de código.
    final podeAssociar = item.status == ScanStatus.notFound;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.only(left: 5),
      // A faixa de estado é o fundo do cartão aparecendo pela borda esquerda:
      // uma cor a menos para o olho processar do que um ícone por linha.
      decoration: BoxDecoration(color: faixa, borderRadius: BorderRadius.circular(AppTheme.raio)),
      child: Container(
        decoration: BoxDecoration(
          color: cores.surfaceContainerLowest,
          borderRadius: const BorderRadius.horizontal(
            left: Radius.circular(3),
            right: Radius.circular(AppTheme.raio),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Expanded(
              child: InkWell(
                onTap: podeAssociar ? () => onAssignBarcode(item.code) : null,
                borderRadius: BorderRadius.circular(AppTheme.raio),
                child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 11, 4, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(
                      temDescricao ? descricao : item.code,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: tema.textTheme.titleMedium?.copyWith(
                        color: gravado ? cores.onSurfaceVariant : cores.onSurface,
                      ),
                    ),
                    if (temDescricao) ...<Widget>[
                      const SizedBox(height: 3),
                      Text(
                        temCodigo ? '${item.code}   Código: ${item.productCode}' : item.code,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: tema.textTheme.bodySmall?.copyWith(
                          color: cores.onSurfaceVariant,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ],
                    if (gravado) ...<Widget>[
                      const SizedBox(height: 8),
                      const _Etiqueta(
                        texto: 'Gravado',
                        icone: Icons.check_rounded,
                        fundo: AppTheme.sucessoClaro,
                        frente: AppTheme.sucesso,
                      ),
                    ] else if (temLocal) ...<Widget>[
                      const SizedBox(height: 8),
                      _Etiqueta(
                        texto: local,
                        icone: Icons.place,
                        fundo: cores.onSurface,
                        frente: cores.surfaceContainerLowest,
                      ),
                    ],
                    if (falhou && mensagem != null && mensagem.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 7),
                      Text(
                        mensagem,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: tema.textTheme.bodySmall?.copyWith(color: cores.error, fontWeight: FontWeight.w600),
                      ),
                    ],
                    ],
                  ),
                ),
              ),
            ),
            _Acao(item: item, onRemove: onRemove),
          ],
        ),
      ),
    );
  }
}

/// O local já registrado, em bloco cheio.
///
/// O contraste vem do peso e da forma, nunca do matiz: matiz aqui é o nome da
/// empresa, e um endereço em laranja dentro do tema laranja não destaca nada.
class _Etiqueta extends StatelessWidget {
  const _Etiqueta({
    required this.texto,
    required this.icone,
    required this.fundo,
    required this.frente,
  });

  final String texto;
  final IconData icone;
  final Color fundo;
  final Color frente;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(8, 5, 10, 5),
      decoration: BoxDecoration(color: fundo, borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icone, size: 16, color: frente),
          const SizedBox(width: 5),
          Flexible(
            child: Text(
              texto,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: frente,
                fontSize: 13.5,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.3,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Acao extends StatelessWidget {
  const _Acao({required this.item, required this.onRemove});

  final ScannedItem item;
  final void Function(String code) onRemove;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;

    if (item.status == ScanStatus.resolving) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(0, 18, 18, 18),
        child: SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(strokeWidth: 2.4, color: cores.outline),
        ),
      );
    }
    if (item.status == ScanStatus.saved) return const SizedBox(width: 12);

    return IconButton(
      icon: const Icon(Icons.close),
      iconSize: 21,
      color: cores.onSurfaceVariant,
      tooltip: 'Remover',
      onPressed: () => onRemove(item.code),
    );
  }
}

class _ListaVazia extends StatelessWidget {
  const _ListaVazia();

  @override
  Widget build(BuildContext context) {
    final tema = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(Icons.barcode_reader, size: 46, color: tema.colorScheme.outlineVariant),
          const SizedBox(height: 12),
          Text(
            'Nenhum item lido',
            style: tema.textTheme.titleMedium?.copyWith(color: tema.colorScheme.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}
