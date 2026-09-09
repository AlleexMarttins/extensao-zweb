# Arquitetura do serviço Zweb na rede local

## Topologia prevista

```text
Computadores da rede
  Extensão Assistente Zweb
          |
          | HTTP interno ou HTTPS interno
          v
Servidor 192.168.1.240
  Serviço zweb-api
  client_secret
  tokens OAuth em memória
  cache e controle de frequência
          |
          | HTTPS de saída
          v
API pública Zweb

Firewall 192.168.1.254
  Controle de acesso entre VLANs ou sub-redes
  Restrição da porta do serviço
  Proxy HTTPS, caso seja necessário
```

## Responsabilidade do servidor 192.168.1.240

O serviço deve escutar somente na rede interna, em uma porta dedicada. A extensão aponta para esse endereço, por exemplo:

```text
http://192.168.1.240:8788
```

Em produção, o ideal é disponibilizar um nome interno com HTTPS, como:

```text
https://zweb-api.interno
```

O `client_secret` fica exclusivamente no servidor. Os computadores clientes recebem apenas respostas do serviço interno. O token OAuth não deve ser armazenado no navegador, no `chrome.storage` ou em arquivos da extensão.

## Regras de rede

Na primeira etapa, o firewall deve permitir somente:

- clientes autorizados da rede interna para `192.168.1.240:8788`;
- `192.168.1.240` para saída HTTPS na API Zweb;
- administração do serviço somente a partir da rede de TI.

Não é necessário abrir a porta do serviço para a internet. O firewall pode bloquear qualquer origem externa para essa porta.

Se a rede possuir mais de uma VLAN, a regra deve permitir somente as VLANs que realmente usam a extensão. Não é necessário liberar acesso amplo entre redes.

## CORS e identificação do cliente

O serviço deve aceitar requisições somente da origem do Zweb e, quando aplicável, da extensão instalada. Não deve usar `Access-Control-Allow-Origin: *` em produção.

Como todos os computadores compartilham a mesma integração, o controle principal deve ser feito pelo firewall e por uma autenticação própria entre a extensão e o serviço. A primeira versão pode usar uma chave pública de instalação, sem substituir o segredo OAuth do servidor.

## Operação

O serviço precisa ser executado como processo persistente no servidor 192.168.1.240, com inicialização automática, logs sem tokens ou segredos e monitoramento do endpoint:

```text
GET http://192.168.1.240:8788/health
```

Antes de migrar qualquer ação de produção, deve ser possível desligar a integração pública e retornar a extensão para a lógica atual sem reinstalação em todos os computadores.

## Papel do firewall 192.168.1.254

O firewall não precisa executar a lógica da integração. Ele pode ser usado para:

- restringir quem acessa a porta `8788`;
- registrar conexões ao serviço;
- fornecer HTTPS interno por proxy reverso;
- bloquear acesso externo acidental;
- separar clientes comuns, administração e o servidor em regras distintas.

A configuração do firewall só deve ser alterada depois de confirmar as sub-redes e interfaces reais. A implantação inicial pode funcionar apenas com o serviço escutando em `192.168.1.240` e uma regra local restritiva.
