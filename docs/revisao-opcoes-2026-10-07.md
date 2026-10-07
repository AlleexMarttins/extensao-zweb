# Revisão das opções — 07/10/2026

## Correções concluídas — versão 1.4.14

Os seis achados abaixo foram tratados e a investigação foi executada novamente. Todos os casos passaram. Para o clone assistido de NF-e e o filtro por faixa, corrigir significa mostrar a indisponibilidade e impedir a ativação, sem liberar operações suspensas.

- Mudanças parciais incorporam o estado atual, preservando as demais escolhas; remover uma preferência restaura seu padrão.
- O painel grava somente a chave alterada. A gravação em andamento impede outro clique no mesmo controle e falhas são informadas.
- A faixa de endereçamento é removida ao desligar ou sair da lista; respostas antigas não a recriam fora da lista.
- Reabrir um aviso cancela o fechamento atrasado anterior.
- Os dois controles indisponíveis são desabilitados com motivo no painel, mesmo que haja preferência antiga ligada.
- O erro adicional informado na linha getURL também foi coberto: o contexto indisponível não causa exceção durante a injeção nem novas tentativas nessa aba. O código antigo não pode recuperar o contexto sozinho; atualizar a aba carrega a extensão nova.

Validação atual: 86 testes da extensão e 126 do serviço interno aprovados. Os testes foram locais, sem homologação fiscal real e sem consulta ao ZWeb. O script de investigação foi ajustado para verificar a indisponibilidade correta dos controles, não exigir que a barreira de segurança seja liberada. A revisão nativa do CLI não foi retomada nem considerada concluída.

## Resultado confirmado

O teste em Chrome local percorreu todas as opções cadastradas em features.js, desligou e ligou cada uma, conferiu a persistência e verificou se as demais escolhas foram preservadas. Nenhuma consulta externa foi feita por esse teste.

A suíte da extensão terminou com 82 testes aprovados. A suíte do serviço interno terminou com 126 testes aprovados, usando respostas simuladas e servidores de teste locais.

## Bateria de investigação executada

Executei `node tools/investigate-extension-options.cjs`, com Chrome sem perfil de usuário, respostas locais e bloqueio de solicitações do navegador. O script informa achados; seu encerramento normal não significa que os casos estejam corretos. Foram encontrados seis desvios e nenhuma tentativa de rede externa. Não alterei nem publiquei código funcional nesta etapa.

### 1. Uma mudança pode reativar outras opções — prioridade alta

Em `extension/nucleo/content.js`, `applyFeatureState` normaliza uma mudança parcial com os padrões do catálogo. O observador de armazenamento passa somente as chaves alteradas. No teste, proteção e filtro estavam desligados; ao desligar apenas o lote, proteção e filtro voltaram a ficar ligados no estado da página. O armazenamento não foi necessariamente alterado: o erro está no estado aplicado à página. Correção proposta: preservar o estado atual ao incorporar mudanças parciais e tratar remoção de preferência explicitamente.

### 2. Duas alterações rápidas podem se sobrescrever — prioridade alta

Em `extension/ui/popup.js`, cada alteração lê e depois grava todas as preferências. Com callbacks de armazenamento atrasados, dois cliques leem o mesmo estado antigo. No teste, desliguei proteção e filtro rapidamente; o resultado foi proteção ligada e filtro desligado. Correção proposta: gravar somente a chave modificada, sem reenviar as escolhas antigas das demais opções.

### 3. Desligar endereçamento não remove a faixa — prioridade média

Em `extension/setores/produtos/product-locations.js`, `syncVisibleListLocations` retorna quando a opção está desligada, sem remover a faixa existente. O teste manteve a faixa visível depois de executar a sincronização com a opção desligada. Correção proposta: limpar a faixa e o produto apresentado ao desativar; conferir também a saída da rota de produtos. O campo do cadastro continuar disponível é uma decisão anterior, não este defeito.

### 4. Reabrir um aviso durante o fechamento faz ele desaparecer — prioridade média

Em `extension/nucleo/content.js`, `hideExtensionNativeModal` agenda `display:none` sem conferir se a janela foi aberta novamente. No teste, abri, fechei e reabri imediatamente; depois do tempo da animação a janela voltou a ficar escondida. Correção proposta: cancelar ou invalidar o fechamento atrasado quando houver nova abertura. É uma falha distinta do empilhamento corrigido na versão 1.4.13.

### 5. Clonar NF-e é oferecido, mas o interruptor não controla o fluxo — prioridade média

O catálogo mantém `nfeCloneAssistEnabled`, porém `isFiscalCloneAssistEnabledForCurrentRoute` retorna falso diretamente para NF-e. Liguei a opção na fixture e o resultado permaneceu falso. Correção proposta: alinhar a interface com o fluxo efetivamente disponível; não restaurar operações fiscais nem remover barreiras de segurança automaticamente.

### 6. Filtro por faixa é oferecido com a consulta suspensa — prioridade média

`ensureProductPreviewButton` permite exibir a função quando a preferência está ligada, mas `productRangeRead` está bloqueada na política de execução. Confirmei a diferença lendo a função e executando a política localmente. Não executei consulta de faixa real. A barreira está correta: o problema é oferecer o recurso sem indicar sua indisponibilidade. Correção proposta: apresentar o bloqueio antes da tentativa ou não oferecer a ação indisponível.

## Cobertura e limites após esta bateria

- Todas as 27 opções: renderização, persistência sequencial e preservação das demais preferências no teste básico do painel.
- Produtos: proteção do cadastro, comportamento da faixa de endereçamento ao desligar e disponibilidade do filtro por faixa.
- DAV: regressões existentes de cliente padrão, seleção por identificador, quantidades e limites/parada do lote.
- Fiscal e documentos: política de operações, disponibilidade do clone NF-e, empilhamento e reabertura de avisos.
- Serviço interno: suíte local de 126 casos, incluindo cache, filas, estoque e catálogo.

Isso ainda não cobre cada operação em uma tela real do ZWeb. Não foram transmitidos, cancelados, clonados ou gravados documentos; não foram executados downloads fiscais reais nem alterações de fornecedor. Também não foi medido crescimento de memória em uma sessão longa real da grade. A revisão nativa do Codex permanece interrompida pelo erro de modelo já descrito abaixo.

## Limites da validação

O teste dos interruptores não verifica sozinho o comportamento de cada função na página real. Downloads fiscais, cancelamento, clonagem, fornecedor em lote e impressão ainda exigem casos específicos de homologação; não foram executadas operações reais nesta revisão.

Endereçamento tem uma diferença importante: o interruptor controla a visualização na grade, mas o campo de manutenção no cadastro permanece disponível por decisão anterior. Isso precisa ficar claro no painel antes de tratar o interruptor como controle de toda a função.

Algumas opções podem estar ligadas no painel enquanto a operação externa correspondente continua bloqueada pela política de segurança. Não liberei essas operações para fazer a revisão. O filtro de faixa e os clones assistidos precisam ter essa diferença conferida na interface.

## Falha reproduzida e correção preparada

Um formulário nativo com camada visual acima de 1065 cobre o aviso de devoluções. O teste falhou antes da alteração. A correção preparada calcula a camada dos diálogos visíveis para posicionar o aviso e seu fundo acima deles. O teste passou após a correção e também confirmou que o formulário recebe cliques ao fechar o aviso.

Versão 1.4.13 publicada na pasta compartilhada junto com o novo painel e ícone. A suíte da extensão passou a ter 82 testes após os testes de busca, filtros e acessibilidade do popup.

## Revisão nativa de código

Foi aberto o painel de alterações locais da extensão e acionado codex review em modo somente leitura, com instruções para não consultar o ZWeb, não ler credenciais, não alterar arquivos e não executar operações de produção.

A revisão foi interrompida antes da análise: o CLI informou que gpt-6-luna não é suportado com a conta ChatGPT utilizada. Não foi escolhido outro modelo. Não há parecer da revisão nativa e nenhum commit ou push foi feito.
