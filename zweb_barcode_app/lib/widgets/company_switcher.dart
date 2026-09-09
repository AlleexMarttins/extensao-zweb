import 'package:flutter/material.dart';

import '../models/scan_models.dart';

/// Alterna a empresa dentro da faixa colorida do topo.
///
/// Duas metades cheias, do tamanho do polegar. A empresa em uso é a que está
/// pintada de branco sobre a cor dela — o mesmo azul ou laranja que veste o
/// resto da tela, para o sinal ser um só e não dois.
class CompanySwitcher extends StatelessWidget {
  const CompanySwitcher({
    required this.empresas,
    required this.selecionada,
    required this.onChanged,
    super.key,
  });

  final List<Company> empresas;
  final String selecionada;

  /// Nulo enquanto o coletor está ocupado.
  final void Function(String codigo)? onChanged;

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: cores.onPrimary.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: empresas
            .map(
              (Company empresa) => Expanded(
                child: _Aba(
                  nome: empresa.name,
                  ativa: empresa.code == selecionada,
                  corAtiva: cores.primary,
                  corInativa: cores.onPrimary,
                  onTap: onChanged == null ? null : () => onChanged!(empresa.code),
                ),
              ),
            )
            .toList(growable: false),
      ),
    );
  }
}

class _Aba extends StatelessWidget {
  const _Aba({
    required this.nome,
    required this.ativa,
    required this.corAtiva,
    required this.corInativa,
    required this.onTap,
  });

  final String nome;
  final bool ativa;
  final Color corAtiva;
  final Color corInativa;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final raio = BorderRadius.circular(12);
    return Material(
      color: ativa ? Colors.white : Colors.transparent,
      borderRadius: raio,
      child: InkWell(
        // Tocar na empresa que já está em uso não é troca de empresa, e não
        // deve fazer o coletor perguntar se pode descartar o lote.
        onTap: ativa ? null : onTap,
        borderRadius: raio,
        child: Container(
          height: 44,
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              nome,
              maxLines: 1,
              softWrap: false,
              style: TextStyle(
                fontSize: 15.5,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.2,
                color: ativa ? corAtiva : corInativa,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
