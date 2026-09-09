import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../theme/app_theme.dart';

/// Como foi cada leitura, para a câmera responder sem o estoquista voltar à
/// lista para conferir.
enum ScanFeedbackKind { ok, aviso, erro }

/// A resposta de uma leitura, do jeito que ela aparece embaixo da câmera.
class ScanFeedback {
  const ScanFeedback(this.mensagem, {this.kind = ScanFeedbackKind.ok, this.codigo});

  final String mensagem;
  final ScanFeedbackKind kind;
  final String? codigo;
}

/// Câmera de leitura. Em modo contínuo, permanece aberta para ler vários itens
/// seguidos; em modo simples, fecha assim que o primeiro código é reconhecido.
class BarcodeScannerScreen extends StatefulWidget {
  const BarcodeScannerScreen({
    required this.title,
    required this.onCode,
    this.continuous = false,
    super.key,
  });

  final String title;
  final bool continuous;
  final Future<ScanFeedback> Function(String code) onCode;

  @override
  State<BarcodeScannerScreen> createState() => _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends State<BarcodeScannerScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    detectionTimeoutMs: 900,
  );
  final Set<String> _handledCodes = <String>{};
  ScanFeedback? _feedback;
  bool _handling = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleCapture(BarcodeCapture capture) async {
    if (_handling) return;
    final code = capture.barcodes
        .map((barcode) => barcode.rawValue?.trim() ?? '')
        .where((value) => value.isNotEmpty)
        .firstOrNull;
    if (code == null) return;
    if (widget.continuous && _handledCodes.contains(code)) return;

    _handling = true;
    _handledCodes.add(code);
    final feedback = await widget.onCode(code);
    if (!mounted) return;

    if (!widget.continuous) {
      Navigator.of(context).pop();
      return;
    }
    setState(() => _feedback = feedback);
    _handling = false;
  }

  @override
  Widget build(BuildContext context) {
    final cores = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(widget.title),
        actions: <Widget>[_Lanterna(controller: _controller)],
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: <Widget>[
                MobileScanner(
                  controller: _controller,
                  onDetect: (BarcodeCapture capture) => _handleCapture(capture),
                  errorBuilder: (BuildContext context, MobileScannerException error) => _CameraIndisponivel(error: error),
                ),
                IgnorePointer(child: CustomPaint(painter: _Mira(cor: cores.primary))),
              ],
            ),
          ),
          _Painel(
            feedback: _feedback,
            lidos: _handledCodes.length,
            continuo: widget.continuous,
          ),
        ],
      ),
    );
  }
}

/// Janela de leitura: o resto do quadro escurece para o código ficar no meio,
/// que é onde a câmera foca melhor com o braço esticado.
class _Mira extends CustomPainter {
  const _Mira({required this.cor});

  final Color cor;

  @override
  void paint(Canvas canvas, Size size) {
    final largura = math.min(size.width * 0.8, 340.0);
    final altura = math.min(size.height * 0.45, 200.0);
    final janela = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: largura,
      height: altura,
    );
    final arredondada = RRect.fromRectAndRadius(janela, const Radius.circular(18));

    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Offset.zero & size),
        Path()..addRRect(arredondada),
      ),
      Paint()..color = const Color(0x99000000),
    );

    final traco = Paint()
      ..color = cor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;
    final canto = math.min(30.0, largura / 4);

    for (final horizontal in <double>[-1, 1]) {
      for (final vertical in <double>[-1, 1]) {
        final x = horizontal < 0 ? janela.left : janela.right;
        final y = vertical < 0 ? janela.top : janela.bottom;
        canvas.drawLine(Offset(x + canto * horizontal * -1, y), Offset(x, y), traco);
        canvas.drawLine(Offset(x, y + canto * vertical * -1), Offset(x, y), traco);
      }
    }
  }

  @override
  bool shouldRepaint(_Mira oldDelegate) => oldDelegate.cor != cor;
}

class _Lanterna extends StatelessWidget {
  const _Lanterna({required this.controller});

  final MobileScannerController controller;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<MobileScannerState>(
      valueListenable: controller,
      builder: (BuildContext context, MobileScannerState state, Widget? child) {
        final indisponivel = state.torchState == TorchState.unavailable;
        final ligada = state.torchState == TorchState.on;
        return IconButton(
          onPressed: indisponivel ? null : () => controller.toggleTorch(),
          icon: Icon(ligada ? Icons.flashlight_on : Icons.flashlight_off_outlined),
          color: ligada ? Colors.amber : Colors.white,
          disabledColor: Colors.white24,
          tooltip: 'Lanterna',
        );
      },
    );
  }
}

/// Resposta da última leitura e a saída da câmera.
class _Painel extends StatelessWidget {
  const _Painel({required this.feedback, required this.lidos, required this.continuo});

  final ScanFeedback? feedback;
  final int lidos;
  final bool continuo;

  @override
  Widget build(BuildContext context) {
    final tema = Theme.of(context);
    final cores = tema.colorScheme;
    final atual = feedback;

    final (Color fundo, Color frente) = switch (atual?.kind) {
      null => (cores.surfaceContainerLowest, cores.onSurface),
      ScanFeedbackKind.ok => (AppTheme.sucessoClaro, AppTheme.sucesso),
      ScanFeedbackKind.aviso => (cores.surfaceContainerHighest, cores.onSurfaceVariant),
      ScanFeedbackKind.erro => (cores.errorContainer, cores.onErrorContainer),
    };

    return Container(
      width: double.infinity,
      color: fundo,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (atual != null) ...<Widget>[
                Text(
                  atual.mensagem,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, height: 1.2, color: frente),
                ),
                if (atual.codigo != null) ...<Widget>[
                  const SizedBox(height: 4),
                  Text(
                    atual.codigo!,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: tema.textTheme.bodySmall?.copyWith(
                      color: frente.withValues(alpha: 0.75),
                      letterSpacing: 0.4,
                    ),
                  ),
                ],
                const SizedBox(height: 14),
              ],
              if (continuo)
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(lidos == 0 ? 'Concluir' : 'Concluir ($lidos)'),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CameraIndisponivel extends StatelessWidget {
  const _CameraIndisponivel({required this.error});

  final MobileScannerException error;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(Icons.no_photography_outlined, size: 44, color: Colors.white54),
            const SizedBox(height: 14),
            const Text(
              'Câmera indisponível',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(
              'Confira a permissão de câmera do aparelho.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.3),
            ),
            const SizedBox(height: 10),
            Text(
              error.errorCode.name,
              style: const TextStyle(color: Colors.white38, fontSize: 12, letterSpacing: 0.6),
            ),
          ],
        ),
      ),
    );
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
