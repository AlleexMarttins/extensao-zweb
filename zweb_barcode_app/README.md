# Coletor de endereçamento ZWeb

App do estoquista: lê os códigos dos itens, lê o código do local e grava o endereçamento no serviço interno da loja (`services/zweb-api`).

O coletor não fala com a API do ZWeb e não usa usuário nem senha. Ele se identifica por uma chave de aparelho, e é o nome do aparelho que fica registrado na auditoria de cada endereço. O desenho completo está em [`docs/arquitetura-coletor-enderecamento.md`](../docs/arquitetura-coletor-enderecamento.md).

## 1. Preparar o serviço

No servidor interno, gere uma chave para cada coletor:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

Configure e suba o serviço:

```powershell
$env:ZWEB_MOBILE_DEVICE_KEYS = 'Coletor Estoque 1:<chave gerada>'
node services/zweb-api/src/server.js
```

O serviço passa a ouvir em `http://<ZWEB_BIND_HOST>:8788`. O celular precisa estar na mesma rede da loja.

## 2. Sincronizar o catálogo

Abra a lista de produtos do ZWeb em qualquer estação com a extensão instalada. Ela pagina o cadastro e alimenta o catálogo do coletor. Para conferir:

```bash
curl -H "X-Zweb-Service-Key: <chave do serviço>" http://<servidor>:8788/api/zweb/product-catalog/status
```

Enquanto o catálogo estiver vazio, o coletor avisa na tela e nenhum código é reconhecido.

## 3. Rodar o app

```bash
cd zweb_barcode_app
flutter pub get
flutter run
```

Na primeira abertura, informe o endereço do serviço (`http://192.168.1.240:8788`) e a chave do aparelho. A configuração fica guardada no celular; a chave nunca aparece na tela depois de salva.

Para gerar o instalador Android:

```bash
flutter build apk --release --split-per-abi
```

Os arquivos saem em `build/app/outputs/flutter-apk/`. Instale nos celulares o `app-arm64-v8a-release.apk`, que atende praticamente todo aparelho Android atual; o `--split-per-abi` evita distribuir um pacote com as três arquiteturas juntas. Sem o `--split-per-abi`, sai um único `app-release.apk` que serve para qualquer aparelho e é bem maior.

> **Assinatura:** o projeto ainda usa a chave de depuração do template do Flutter (veja o `TODO` em `android/app/build.gradle.kts`). Isso permite instalar o APK manualmente nos celulares da loja, mas não serve para a Play Store, e o dia em que uma chave própria for criada os aparelhos precisarão desinstalar a versão antiga antes de atualizar.

## 4. Usar no corredor

1. **Ler itens** abre a câmera e permanece aberta: cada código lido aparece na lista com a descrição do produto e o endereço atual, se já houver. Código repetido é ignorado; código fora do catálogo aparece na hora como não encontrado.
2. **Ler endereço** lê o código do local, ou digite direto no campo.
3. **Enviar** grava o lote. Cada item recebe o resultado individual — um item fora do catálogo não impede a gravação dos demais.

O endereço gravado aparece na lista de produtos e no cadastro do ZWeb pela extensão, sem nenhuma ação extra.

## Verificação

```bash
flutter analyze
flutter test
```

Os testes cobrem a leitura, a identificação do produto, o bloqueio do envio sem endereço, o sucesso parcial e a preservação do lote quando a rede falha. Não há dependência de rede nem de câmera: o cliente HTTP e o serviço são substituídos por dublês.

## Limitações conhecidas

- O tráfego entre o celular e o serviço é HTTP na rede interna (`usesCleartextTraffic` habilitado no Android). Não exponha o serviço para fora da loja sem colocar TLS na frente.
- A leitura por EAN depende de o produto ter o código de barras preenchido no ZWeb. Produto sem EAN cadastrado é lido pelo código interno, o mesmo mostrado na tela do ZWeb.
- O app não tem modo offline: o envio precisa da rede da loja no momento da gravação. Se o envio falhar, o lote continua na tela para nova tentativa.
