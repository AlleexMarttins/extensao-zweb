# Bloqueador Administrativo

Instalação (Chrome/Edge):

1. Abra `chrome://extensions/` (ou `edge://extensions/`).
2. Ative `Modo de Desenvolvedor`.
3. Clique em `Carregar sem compactação` e selecione a pasta `extension`.
4. A extensão foi configurada para rodar exclusivamente em `https://zweb.com.br/*`, mas pode ser alterado para funcionar em qualquer página, confira no final do README.md.

Comportamento:
- A extensão procura elementos com id `botaoCadastrar`, textos como `Cadastrar produto`, `aria-label` de ações ("Excluir", "Editar", "Abrir") e ícones comuns (`fa-pencil`, `fa-times`, `fa-trash`).
- Ações de excluir/editar são ocultadas (`display: none`) quando detectadas; o botão de cadastrar é desabilitado e neutralizado.
- Bloqueia também `dblclick` e o menu de contexto (`contextmenu`) em linhas/células que podem acionar edição/exclusão.

Controle (ligar/desligar):
- Abra o popup da extensão (clique no ícone da extensão no navegador). Há uma checkbox para habilitar/desabilitar o bloqueio e um botão para recarregar a aba ativa.
- Ao desabilitar, a extensão recarrega a página ativa (se você usar o botão `Recarregar página ativa`) para restaurar o estado original.

Alterar para funcionar em qualquer página:
- Abra `manifest.json` e localize:
  ```json
  "host_permissions": ["https://zweb.com.br/*"],
  ...
  "content_scripts": [
    {
      "matches": ["https://zweb.com.br/*"],
  ```
- Substitua `"https://zweb.com.br/*"` por `"<all_urls>"` em ambos os campos:
  ```json
  "host_permissions": ["<all_urls>"],
  ...
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
  ```
- Salve e recarregue a extensão em `chrome://extensions/`.
