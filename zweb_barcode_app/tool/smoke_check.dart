// Confere, de um computador da rede, se o serviço interno responde ao coletor.
// Use quando um aparelho não conectar e você precisar saber se o problema está
// no celular, na rede ou no serviço.
//
//   dart run tool/smoke_check.dart http://192.168.1.240:8788 <chave-do-aparelho> [codigo]
import 'dart:io';

import 'package:zweb_barcode_app/models/device_settings.dart';
import 'package:zweb_barcode_app/services/scanner_api.dart';

Future<void> main(List<String> arguments) async {
  if (arguments.length < 2) {
    stderr.writeln('Uso: dart run tool/smoke_check.dart <endereco> <chave-do-aparelho> [codigo]');
    exitCode = 64;
    return;
  }

  final api = ZwebScannerApi(DeviceSettings(baseUrl: arguments[0], deviceKey: arguments[1]));
  try {
    final session = await api.openSession();
    stdout.writeln('Aparelho: ${session.device}');
    stdout.writeln('Catálogo: ${session.catalogItems} produto(s), atualizado em ${session.catalogUpdatedAt}');

    if (arguments.length >= 3) {
      final resolved = await api.resolveCodes(<String>[arguments[2]]);
      for (final product in resolved) {
        stdout.writeln(
          product.found
              ? 'Código ${product.scannedCode}: ${product.productDescription} (local atual: ${product.currentLocation ?? 'nenhum'})'
              : 'Código ${product.scannedCode}: fora do catálogo.',
        );
      }
    }
  } on ScannerApiException catch (error) {
    stderr.writeln('Falha: ${error.message}');
    exitCode = 1;
  }
}
