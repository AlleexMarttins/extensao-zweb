import 'package:flutter_test/flutter_test.dart';
import 'package:zweb_barcode_app/models/shelf_location.dart';

void main() {
  test('compoe o endereco na mesma grafia das etiquetas impressas', () {
    expect(const ShelfLocation(rua: 3, nivel: 2, lado: 'DIR').toString(), 'RUA 3 NIVEL 2 PRAT DIR');
    expect(const ShelfLocation(rua: 8, nivel: 5, lado: 'ESQ').toString(), 'RUA 8 NIVEL 5 PRAT ESQ');
  });

  test('cobre todas as combinacoes do estoque sem repetir nenhuma', () {
    final compostos = <String>{};
    for (final int rua in ShelfLocation.ruas) {
      for (final int nivel in ShelfLocation.niveis) {
        for (final String lado in ShelfLocation.lados) {
          compostos.add(ShelfLocation(rua: rua, nivel: nivel, lado: lado).toString());
        }
      }
    }
    expect(compostos.length, 80);
    expect(compostos.contains('RUA 1 NIVEL 1 PRAT DIR'), isTrue);
    expect(compostos.contains('RUA 8 NIVEL 5 PRAT ESQ'), isTrue);
  });

  test('reconhece o endereco lido da etiqueta para refletir nas caixas', () {
    final lido = ShelfLocation.parse('RUA 8 NIVEL 5 PRAT ESQ');
    expect(lido, const ShelfLocation(rua: 8, nivel: 5, lado: 'ESQ'));

    // Digitado com outra caixa ou com espaco sobrando continua valendo.
    expect(ShelfLocation.parse('  rua 2 nivel 3 prat dir  '), const ShelfLocation(rua: 2, nivel: 3, lado: 'DIR'));
  });

  test('nao reconhece endereco fora do padrao, e as caixas ficam vazias', () {
    expect(ShelfLocation.parse('GVE-07'), isNull);
    expect(ShelfLocation.parse('Rua 8 Nível 3 Prat Dir'), isNull, reason: 'acento nao faz parte do padrao');
    expect(ShelfLocation.parse('RUA 9 NIVEL 1 PRAT DIR'), isNull, reason: 'rua fora do estoque');
    expect(ShelfLocation.parse('RUA 1 NIVEL 9 PRAT DIR'), isNull, reason: 'nivel fora do estoque');
    expect(ShelfLocation.parse('RUA 1 NIVEL 1 PRAT MEIO'), isNull);
    expect(ShelfLocation.parse(''), isNull);
    expect(ShelfLocation.parse(null), isNull);
  });

  test('o texto composto volta a ser reconhecido, sem perder informacao', () {
    for (final int rua in ShelfLocation.ruas) {
      for (final int nivel in ShelfLocation.niveis) {
        for (final String lado in ShelfLocation.lados) {
          final original = ShelfLocation(rua: rua, nivel: nivel, lado: lado);
          expect(ShelfLocation.parse(original.toString()), original);
        }
      }
    }
  });

  test('reconhece um codigo de barras digitado no lugar do endereco', () {
    // Foi o engano real: a etiqueta do GAS BUTANO lida como se fosse a da prateleira.
    expect(pareceCodigoDeProduto('7899956657917'), isTrue);
    expect(pareceCodigoDeProduto('7899452028976'), isTrue);
    expect(pareceCodigoDeProduto(' 7891579315137 '), isTrue);
  });

  test('nao acusa enderecos legitimos', () {
    expect(pareceCodigoDeProduto('RUA 5 NIVEL 1 PRAT ESQ'), isFalse);
    expect(pareceCodigoDeProduto('GVE-07'), isFalse);
    expect(pareceCodigoDeProduto('GVL-23'), isFalse);
    expect(pareceCodigoDeProduto('A-03-02'), isFalse);
    expect(pareceCodigoDeProduto(''), isFalse);
  });

  test('nao acusa codigo curto, que pode ser um endereco numerico da loja', () {
    expect(pareceCodigoDeProduto('17695'), isFalse);
    expect(pareceCodigoDeProduto('1234567'), isFalse);
  });
}
