# Configuração privada da instalação

O código público não inclui a senha de proteção de produto nem a chave do serviço interno.

Antes de usar essas funções, copie `extension/nucleo/installation-config.example.js` para `extension/nucleo/installation-config.local.js` e preencha os dois campos no arquivo local. Esse arquivo está ignorado pelo Git e deve ficar somente na instalação privada. Não copie credenciais reais para exemplos, testes, relatórios ou issues públicas.

Sem configuração local, a proteção não aceita senha vazia e o acesso ao serviço não possui uma chave válida. Os valores não são impressos nos logs. A senha da extensão é uma proteção de interface, não substitui permissões no servidor.

Depois de mudar a configuração, recarregue a extensão e atualize as abas após salvar o trabalho aberto.
