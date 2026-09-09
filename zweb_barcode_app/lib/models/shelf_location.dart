/// Endereço de prateleira no padrão da loja: `RUA 3 NIVEL 2 PRAT DIR`.
///
/// A composição fica aqui, e não na tela, porque essa grafia é o que vai para
/// o banco: maiúsculas, sem acento e com os mesmos separadores das etiquetas
/// impressas. Duas grafias diferentes viram dois locais diferentes.
class ShelfLocation {
  const ShelfLocation({required this.rua, required this.nivel, required this.lado});

  static const List<int> ruas = <int>[1, 2, 3, 4, 5, 6, 7, 8];
  static const List<int> niveis = <int>[1, 2, 3, 4, 5];
  static const List<String> lados = <String>['DIR', 'ESQ'];

  static final RegExp _padrao = RegExp(
    r'^RUA\s+(\d+)\s+NIVEL\s+(\d+)\s+PRAT\s+(DIR|ESQ)$',
    caseSensitive: false,
  );

  final int rua;
  final int nivel;
  final String lado;

  /// Reconhece um endereço já no padrão — seja lido do código de barras,
  /// digitado ou carregado de um produto — para as caixas refletirem o valor.
  /// Devolve null em qualquer coisa fora do padrão, como `GVE-07`.
  static ShelfLocation? parse(String? value) {
    final match = _padrao.firstMatch((value ?? '').trim());
    if (match == null) return null;
    final rua = int.parse(match.group(1)!);
    final nivel = int.parse(match.group(2)!);
    final lado = match.group(3)!.toUpperCase();
    if (!ruas.contains(rua) || !niveis.contains(nivel)) return null;
    return ShelfLocation(rua: rua, nivel: nivel, lado: lado);
  }

  @override
  String toString() => 'RUA $rua NIVEL $nivel PRAT $lado';

  @override
  bool operator ==(Object other) =>
      other is ShelfLocation && other.rua == rua && other.nivel == nivel && other.lado == lado;

  @override
  int get hashCode => Object.hash(rua, nivel, lado);
}

/// Um endereço que é só dígitos e longo tem cara de código de barras de
/// produto, não de prateleira — foi assim que uma etiqueta de produto acabou
/// gravada como local. Não é proibido, porque endereços livres existem; é
/// motivo para o estoquista confirmar antes de enviar.
bool pareceCodigoDeProduto(String value) {
  final texto = value.trim();
  return texto.length >= 8 && RegExp(r'^\d+$').hasMatch(texto);
}
