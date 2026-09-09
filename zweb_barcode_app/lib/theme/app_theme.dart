import 'package:flutter/material.dart';

/// Cores, medidas e tipografia do coletor.
///
/// A cor da empresa veste a tela inteira: azul é Eletronica Horizonte, laranja
/// é MVA. Endereçar no estoque errado não acusa erro em lugar nenhum — nem no
/// coletor, nem no serviço —, então a cor é a única defesa que funciona antes
/// de alguém ler qualquer coisa.
///
/// O verde de gravado fica fora das duas paletas de propósito: um item que já
/// foi para o serviço precisa ser reconhecido do mesmo jeito nas duas empresas.
abstract final class AppTheme {
  /// Nome exibido do app, para não se repetir escrito pela interface.
  static const String nome = 'Baliza';

  static const Color _azul = Color(0xFF1257C7);
  static const Color _azulClaro = Color(0xFFDCE7FF);
  static const Color _azulEscuro = Color(0xFF0A2A63);

  static const Color _laranja = Color(0xFFC0550A);
  static const Color _laranjaClaro = Color(0xFFFFE3CD);
  static const Color _laranjaEscuro = Color(0xFF48200A);

  static const Color sucesso = Color(0xFF13703C);
  static const Color sucessoClaro = Color(0xFFD9F2E2);

  /// Alvo de toque de quem opera em pé, no corredor, com uma mão só.
  static const double alvo = 48;

  static const double raio = 14;

  static bool _ehMva(String empresa) => empresa.toUpperCase() == 'MVA';

  static Color corDaEmpresa(String empresa) => _ehMva(empresa) ? _laranja : _azul;

  /// O tema inteiro nasce do código da empresa. Trocar de empresa repinta a
  /// tela no mesmo quadro do toque.
  static ThemeData tema(String empresa) {
    final bool mva = _ehMva(empresa);
    final Color primaria = mva ? _laranja : _azul;

    final ColorScheme cores = ColorScheme.fromSeed(seedColor: primaria).copyWith(
      primary: primaria,
      onPrimary: Colors.white,
      primaryContainer: mva ? _laranjaClaro : _azulClaro,
      onPrimaryContainer: mva ? _laranjaEscuro : _azulEscuro,
    );

    final ThemeData base = ThemeData(colorScheme: cores, useMaterial3: true);
    final TextTheme t = base.textTheme;

    // Tudo um ponto maior e mais pesado que o padrão: a tela é lida a
    // distância de braço, com o celular na mão que sobrou.
    final TextTheme texto = t.copyWith(
      titleLarge: t.titleLarge?.copyWith(fontSize: 21, fontWeight: FontWeight.w700, letterSpacing: -0.3),
      titleMedium: t.titleMedium?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.1,
        height: 1.25,
      ),
      bodyMedium: t.bodyMedium?.copyWith(fontSize: 14.5, height: 1.3),
      bodySmall: t.bodySmall?.copyWith(fontSize: 13, height: 1.3),
      labelLarge: t.labelLarge?.copyWith(fontSize: 15.5, fontWeight: FontWeight.w700),
      labelMedium: t.labelMedium?.copyWith(fontSize: 13.5, fontWeight: FontWeight.w700),
      labelSmall: t.labelSmall?.copyWith(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2),
    );

    return base.copyWith(
      scaffoldBackgroundColor: cores.surfaceContainerLow,
      textTheme: texto,
      appBarTheme: AppBarThemeData(
        backgroundColor: cores.primary,
        foregroundColor: cores.onPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: texto.titleLarge?.copyWith(color: cores.onPrimary, fontSize: 19),
      ),
      dividerTheme: DividerThemeData(color: cores.outlineVariant, thickness: 1, space: 1),
      filledButtonTheme: FilledButtonThemeData(style: _botao),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: _botao.copyWith(side: WidgetStatePropertyAll<BorderSide>(BorderSide(color: cores.outline))),
      ),
      textButtonTheme: TextButtonThemeData(style: TextButton.styleFrom(minimumSize: const Size(0, alvo))),
      inputDecorationTheme: InputDecorationThemeData(
        filled: true,
        fillColor: cores.surfaceContainerLowest,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 18),
        border: _campo(cores.outlineVariant),
        enabledBorder: _campo(cores.outlineVariant),
        focusedBorder: _campo(cores.primary, largura: 2),
        errorBorder: _campo(cores.error),
        focusedErrorBorder: _campo(cores.error, largura: 2),
        labelStyle: TextStyle(color: cores.onSurfaceVariant, fontWeight: FontWeight.w600),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        insetPadding: const EdgeInsets.all(12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(raio - 2)),
      ),
      dialogTheme: DialogThemeData(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
    );
  }

  static OutlineInputBorder _campo(Color cor, {double largura = 1}) => OutlineInputBorder(
    borderRadius: BorderRadius.circular(raio - 2),
    borderSide: BorderSide(color: cor, width: largura),
  );

  /// Botões altos o bastante para serem acertados sem olhar.
  static final ButtonStyle _botao = ButtonStyle(
    minimumSize: const WidgetStatePropertyAll<Size>(Size(0, 54)),
    padding: const WidgetStatePropertyAll<EdgeInsetsGeometry>(EdgeInsets.symmetric(horizontal: 12)),
    shape: WidgetStatePropertyAll<OutlinedBorder>(
      RoundedRectangleBorder(borderRadius: BorderRadius.circular(raio)),
    ),
  );
}
