## Registro de mudanças

### 07/10/2026 — Novo repositório para compartilhar a extensão

Separei a publicação em um repositório novo, chamado extensao-zweb, com o histórico limpo. Mantive o anterior como zweb-private-backup, privado, porque o GitHub ainda permitia abrir um registro antigo pelo endereço direto. Confirmei que esse registro não existe no novo repositório. A configuração particular da loja continua fora do Git. Essa mudança não altera a extensão em uso nos computadores nem faz consultas ao ZWeb.

### 07/10/2026 — Preparação do repositório público

Retirei do código publicado a senha de proteção e a chave do serviço interno. A instalação da loja passa a usar um arquivo de configuração privado, fora do Git. Também removi do histórico os bancos de teste, capturas e documentos internos encontrados na revisão. Os arquivos usados localmente foram preservados fora da cópia pública.

A limpeza reescreve os commits antigos, por isso outras cópias do repositório precisam ser atualizadas com cuidado. A versão 1.4.15 separa a configuração privada do código compartilhado. Não publiquei os valores de configuração e não fiz consultas ao ZWeb para essa mudança.

### 07/10/2026 — Correção das preferências e publicação 1.4.14

Corrigi as preferências para que alterar uma opção não reative as outras na página. O painel agora salva somente a escolha modificada, evitando que duas alterações rápidas se sobrescrevam. Se não for possível salvar, a escolha volta ao estado anterior e aparece um aviso.

A faixa de endereçamento agora some ao desligar sua opção ou sair da lista de produtos. O campo no cadastro continua disponível, como já estava combinado; deixei essa diferença clara na descrição. Corrigi também o fechamento atrasado dos avisos para que não esconda uma janela que acabei de reabrir.

O filtro por faixa e o assistente de Clonar NF-e continuam indisponíveis: o painel mostra o motivo e não permite ativar esses controles. Não liberei consultas ou operações suspensas. Também tratei a falha da ponte quando a extensão é recarregada e a aba ainda mantém o código antigo, sem deixar a tentativa se repetir nessa aba. Nesse caso, é preciso atualizar a página para carregar o novo contexto.

Validei os casos em ambiente local: 86 testes da extensão, 126 do serviço interno e todos os casos da bateria de investigação passaram. A publicação inclui o painel, o ícone e os ajustes de DAV que já estavam disponíveis na pasta compartilhada, mas ainda não tinham sido registrados no Git. As alterações do aplicativo de celular e os arquivos temporários de banco não fazem parte desta publicação.

### 07/10/2026 — Investigação das configurações e avisos

Executei uma bateria local para procurar problemas que os testes anteriores ainda não cobriam. Encontrei duas falhas importantes nas preferências: mudar uma opção pode reativar outras na página, e mudar duas rapidamente pode fazer uma escolha sobrescrever a outra. Também confirmei que a faixa de endereçamento não some ao desligar a opção e que um aviso reaberto durante o fechamento pode desaparecer depois.

Encontrei ainda duas diferenças entre o painel e as funções disponíveis: o controle de Clonar NF-e não governa o fluxo atual e o filtro por faixa é oferecido apesar da consulta continuar suspensa. A suspensão não foi removida. Registrei os casos e as correções propostas no relatório de revisão. Nesta etapa não publiquei uma nova versão nem alterei o funcionamento da extensão. Os 82 testes anteriores da extensão e os 126 do serviço continuaram passando, mostrando que precisamos ampliar a cobertura com esses cenários.

### 07/10/2026 — Novo visual do painel da extensão

Troquei o ícone da extensão e reorganizei o painel de opções. Agora posso buscar uma opção pelo nome ou pela descrição e filtrar por área, sem precisar percorrer a lista inteira. Deixei os controles mais compactos e coloquei as casas decimais em uma seção que abre quando preciso. Mantive as preferências existentes e acrescentei identificação dos controles para uso por teclado e leitores de tela.

Testei o painel em Chrome local no tamanho de um popup, incluindo busca com acentos, caracteres especiais, filtros por área e salvamento dos interruptores. A suíte ficou com 82 testes aprovados. Publiquei a versão 1.4.13 na pasta compartilhada, incluindo o ajuste do aviso de devoluções preparado nesta revisão. Não fiz consultas ao ZWeb nem alterei o serviço do servidor para essa atualização.

### 07/10/2026 — Revisão das opções e aviso de devoluções

Comecei uma revisão geral das opções da extensão. Testei cada interruptor do painel ligado e desligado, conferindo se a escolha fica salva e se não altera as outras opções. Isso verifica os interruptores, mas ainda não significa que todas as funções foram conferidas na tela real do ZWeb.

Reproduzi localmente o aviso de devoluções ficando atrás do formulário de relatório e preparei uma correção para ele abrir acima da janela existente. Também testei se, depois de fechar o aviso, o formulário volta a receber cliques. Os 81 testes da extensão e os 126 testes do serviço interno passaram em ambiente local. Incluí a correção na publicação 1.4.13, junto com o novo painel.

Também tentei usar a revisão nativa de código do Codex. Ela foi interrompida porque o modelo configurado no CLI não foi aceito pela conta. Não alterei essa configuração e não estou considerando essa revisão concluída.

### 07/10/2026 — Botão de cadastro oculto com a proteção

Ajustei a proteção para esconder o botão “Cadastrar produto”, em vez de apenas deixá-lo desabilitado. Também incluí o cadastro apresentado como link. Testei se ele some com a proteção ligada, continua oculto quando a tela recria o botão e reaparece quando desligo a proteção. Esses testes foram feitos localmente, sem consultas ao ZWeb.

### 07/10/2026 — Proteção do cadastro de produtos

Corrigi o botão “Cadastrar produto”, que tinha deixado de ficar bloqueado com a proteção ligada depois dos ajustes de desempenho da grade. Mantive a melhoria de desempenho e passei a cuidar desse botão separadamente. Ao desligar a proteção, o botão volta ao estado anterior. Testei em navegador local o bloqueio, a troca do botão durante a navegação e a liberação, sem fazer consultas ao ZWeb.

Serve para dar um parecer pra vocês a partir do ponto de vista do cliente, reunindo as alterações que estou fazendo na extensão e na estrutura de integração com o ZWeb. A ideia é registrar o motivo de cada mudança, o impacto esperado na operação da loja e o que foi validado antes da publicação.

Estou migrando gradualmente partes da extensão para um serviço interno da loja, sem retirar as funções que ainda dependem da interface autenticada do ZWeb. A extensão continua sendo o ponto de uso nos computadores, enquanto o serviço compartilhado concentra consultas que podem ser reaproveitadas por várias estações.

### 1. Serviço interno para consultas do ZWeb

Criei um serviço Node.js em um servidor interno da loja. Ele utiliza a API para consultar dados que são usados pela extensão.

Consultas já integradas:

- categorias financeiras;
- formas de pagamento;
- clientes e destinatários;
- status de vendas;
- identificação do cliente padrão para novos DAVs.

O serviço mantém o segredo OAuth no servidor, fora da extensão e fora do repositório. Também adicionei uma chave interna para impedir que qualquer equipamento da rede faça consultas acidentais ao serviço sem autorização.

Quando várias pessoas usam a extensão ao mesmo tempo, as estações não precisam repetir a mesma consulta diretamente no ZWeb. O serviço reaproveita respostas recentes e junta chamadas iguais que acontecerem ao mesmo tempo. Isso reduz carga na API e deixa a estrutura pronta para outras melhorias.

### 2. Cliente padrão em novos DAVs

Passei a buscar o cliente padrão por um identificador fixo no serviço interno, em vez de percorrer toda a lista de clientes sempre que um DAV é aberto.

A extensão não depende mais da posição do cliente na lista e não corre o risco de escolher outro cadastro com o mesmo nome. O preenchimento ficou mais rápido e previsível.

Dessa maneira, vendas no balcão ficam mais ágeis, já que os DAVs já vêm com o cliente selecionado automaticamente. É um detalhe pequeno que faz diferença na correria.

### 3. Consultas reaproveitadas entre os computadores

Nem toda informação precisa ser buscada no ZWeb toda vez que alguém abre uma tela. Por isso, deixei cada tipo de consulta com um prazo próprio de reaproveitamento:

- categorias: até 30 minutos;
- formas de pagamento: até 15 minutos;
- clientes: até 10 minutos;
- status de vendas: até 1 minuto.

Se dois computadores precisarem da mesma informação ao mesmo tempo, o serviço faz uma consulta e aproveita a resposta para os dois. Por exemplo, se duas pessoas abrirem uma tela que precisa das formas de pagamento, não faz sentido o ZWeb receber duas chamadas iguais no mesmo instante.

Também deixei o descarte imediato para as alterações feitas pelo próprio ZWeb. Quando um cadastro de categoria, forma de pagamento, cliente, destinatário ou status de venda é salvo ou excluído com sucesso, a extensão informa o serviço qual tipo de informação mudou. O cache daquele tipo é removido na hora e a próxima estação que consultar recebe uma versão nova do ZWeb, que passa a ser reaproveitada normalmente.

Essa comunicação só acontece depois da confirmação de sucesso do ZWeb. Se um salvamento falhar, o cache continua intacto. Isso evita descartar uma resposta boa por uma tentativa que não chegou a alterar nada.

Isso não altera nenhum cadastro. É só uma forma de evitar trabalho repetido e deixar a extensão mais leve quando a loja está com vários computadores em uso.

### 4. Fechamento de estoque com menos consultas desnecessárias

Na tela de estoque, a extensão continua acompanhando a própria tela rapidamente para não atrasar a resposta visual. O que mudou foi a consulta usada apenas para perceber se outro navegador alterou alguma coisa: ela passou de cinco para trinta segundos.

Na prática, o fechamento manual e o automático continuam com o mesmo funcionamento. A diferença é que cada computador deixou de repetir essa consulta tantas vezes. A redução é de cerca de 83% nessa parte da rotina, sem fazer o operador esperar trinta segundos para usar a tela.

### 5. Relatório de comissões sem repetir a mesma busca de devoluções

Antes de gerar o relatório de comissões, a extensão precisa atualizar o histórico de devoluções. Ajustei isso para evitar que a mesma consulta seja iniciada várias vezes ao mesmo tempo. Depois que uma atualização termina, ela ainda pode ser aproveitada por trinta segundos antes de buscar tudo de novo.

Exemplo: se o relatório for gerado duas vezes em sequência, a segunda tentativa não precisa percorrer de novo todas as páginas de NF-e que acabaram de ser verificadas. Quando esse prazo passa, a extensão consulta novamente para não trabalhar com uma informação antiga.

### 6. Campo de busca de itens mais leve

O campo usado para pesquisar itens tinha uma verificação rodando em intervalo fixo. Primeiro reduzi esse intervalo e depois troquei a maior parte dele pelos próprios eventos do campo, como entrar nele, digitar ou alterar o valor. A última verificação global que ainda restava nessa busca rodava a cada 120 milissegundos; ela passou a depender de foco, mudança de rota e da criação real do campo pelo ZWeb.

Para quem está vendendo, o resultado continua imediato. Ao pesquisar um item, a extensão faz o ajuste necessário na hora. A diferença é que ela não fica conferindo o campo o tempo todo enquanto a tela está aberta.

### 7. Devoluções compartilhadas entre as estações

O histórico de devoluções do relatório de comissões agora também pode ser compartilhado pelo serviço interno. A extensão primeiro verifica se já existe uma atualização recente. Se não existir, uma estação faz a consulta no ZWeb e o resultado fica disponível para as outras.

Isso evita que três computadores gerando o relatório perto um do outro façam a mesma leitura de NF-e três vezes. O cálculo do relatório continua sendo feito pela extensão. O serviço só guarda o histórico necessário para essa consulta ser reaproveitada.

Também deixei um caminho de segurança: se esse serviço interno não estiver disponível, a extensão volta para a consulta direta que já existia. Ou seja, a geração do relatório não fica parada por depender somente da nova estrutura.

### 8. Forma de acompanhar se o cache está ajudando

Adicionei uma consulta técnica para enxergar se as informações guardadas pelo serviço ainda estão atualizadas, se venceram ou se ainda não foram buscadas. Ela também mostra quantas chamadas deixaram de ser repetidas porque uma resposta já estava disponível.

Isso ajuda quando aparecer alguma lentidão ou diferença de informação. Em vez de tentar adivinhar se o problema foi uma resposta antiga, uma consulta pendente ou uma falha externa, dá para conferir o estado do serviço.

### 9. Retirada do simulador de preço antigo

Removi o simulador de preço que ficava ligado ao cadastro de produtos e à importação de compras. Essa função já não era usada na rotina e continuava deixando uma opção e um atalho antigos dentro da extensão.

O cálculo de valores da compra foi mantido. A mudança só retira o caminho que abria o cadastro de produto para simular e preencher preço sem salvar. Com isso, ficam menos arquivos carregados, menos configurações para manter e menos possibilidade de uma função antiga interferir na tela.

### 10. Atualização da extensão sem conferência contínua

Retirei uma atualização geral que rodava a cada segundo e meio em todas as telas do ZWeb. A extensão continua reagindo quando a página muda, quando um elemento novo aparece ou quando uma configuração é alterada, mas não fica mais acordando sem necessidade enquanto a tela está parada.

Na prática, os botões e ajustes continuam aparecendo quando a tela carrega. A diferença é que a extensão usa as mudanças reais da página como sinal para se atualizar, em vez de repetir a mesma conferência em intervalo fixo.

### 11. Fechamento automático de estoque

Corrigi o momento em que o navegador responsável pela liberação do estoque é identificado. Agora essa marcação acontece antes de o ZWeb processar a troca do controle, evitando o caso em que o estoque fica liberado sem que o prazo automático seja associado ao navegador que abriu.

Também ajustei a confirmação do fechamento. Antes, a extensão podia considerar a ação concluída só porque conseguiu abrir a tela de configuração e tentar o clique. Agora ela consulta novamente a configuração no ZWeb e só apresenta sucesso quando confirma que a permissão foi realmente desligada. Se a mudança não for confirmada, o agendamento permanece como falha em vez de informar um fechamento que não aconteceu.

O fechamento manual continua disponível para qualquer pessoa na tela. O fechamento automático permanece ligado somente ao navegador que ativou a liberação, sem transferir essa ação para os outros computadores.

### 12. Coletor de endereçamento por código de barras

Foi criado um coletor de endereçamento para uso no celular. O estoquista lê o código do produto, lê ou informa o local da prateleira, confere a descrição que apareceu na tela e envia o lote. Depois disso, o endereço aparece na lista e no cadastro de produtos do ZWeb pela extensão.

Em vez de criar outro sistema gravando diretamente no ZWeb com usuário e senha de funcionário, aproveitei o serviço interno que já guarda os endereçamentos. Assim existe uma fonte só para essa informação. Isso também preserva a separação que foi feita no cadastro: o campo Observações do produto fica livre para a descrição necessária no e-commerce, enquanto o local fica no banco próprio de endereçamentos.

O celular não usa senha de usuário do ZWeb. Cada aparelho recebe uma chave própria e o nome do aparelho fica gravado no histórico de cada alteração. Se algum coletor for perdido ou deixar de ser usado, é possível revogar apenas a chave dele, sem trocar senha de funcionário e sem interromper os demais aparelhos.

Para reconhecer o item lido, a extensão passou a manter no serviço um catálogo com código, descrição e código de barras. A varredura completa aproveita a consulta que a própria tela de produtos já faz, em vez de criar uma consulta diferente no ZWeb só para o coletor. O catálogo completo foi conferido com 21.287 produtos, incluindo códigos de barras cadastrados. O leitor também foi validado tanto pelo código interno quanto pelo código de barras do produto.

Na prática, item que não estiver no catálogo aparece marcado antes do envio e não impede a gravação dos demais. Se a rede falhar, as leituras continuam na tela para nova tentativa, em vez de o lote ser perdido. Também ajustei a tela para mostrar a descrição, o código lido e o local atual em linhas separadas. Isso ajuda a conferir produtos muito parecidos antes de sobrescrever um endereço já existente.

### 13. Atualização do catálogo sem esperar a próxima varredura

Além da varredura completa periódica, passei a atualizar o item individual quando o cadastro de produto é salvo e a pessoa sai daquela tela. Isso resolve o caso de cadastrar ou alterar um código de barras e querer usar o coletor logo em seguida.

O envio não acontece ao abrir o produto, porque nesse momento o ZWeb ainda pode estar mostrando o código antigo. Ele acontece ao sair do cadastro, quando a alteração já foi salva. Dessa forma, o produto alterado fica disponível para o coletor sem esperar a próxima atualização geral, e a varredura completa continua como conferência de segurança para alterações feitas por outros caminhos.

### 14. Endereçamento no cadastro de produtos

O campo de Endereçamento foi incluído abaixo de Observações, usando a mesma organização visual dos campos nativos do ZWeb. Ele é um campo de uma linha, com rótulo próprio, e não acrescenta uma coluna nova dentro da grade de produtos.

Preferi não alterar a estrutura da grade porque ela é dinâmica e depende das colunas que o próprio ZWeb monta. Em vez disso, a extensão mostra o local como uma identificação discreta na descrição do item e deixa a edição no cadastro individual. Assim o vendedor consegue localizar o produto com facilidade sem deslocar colunas, filtros ou ações já existentes.

O endereçamento é salvo junto com o botão Salvar do próprio ZWeb. Se o campo não foi alterado, não há gravação desnecessária no histórico. Também foi conferido que a extensão mantém o tamanho, o espaçamento e a altura dos campos que já existem na tela, em vez de colocar um painel diferente no meio do cadastro.

### 15. Padronização dos locais no coletor

No coletor, além da leitura de uma etiqueta de prateleira ou da digitação manual, incluí a seleção de rua, nível e lado. Quando as três opções são escolhidas, o local é montado já no padrão utilizado nas etiquetas. Se for lido um endereço que já segue esse padrão, a seleção acompanha o valor automaticamente.

Mantive a digitação e a leitura livre porque existem locais antigos que não seguem o padrão de rua, nível e prateleira. A seleção serve para reduzir diferenças de escrita nos endereços novos, sem impedir o uso dos locais que já existem.

### 16. Medição das consultas compartilhadas

Fiz uma medição no serviço que está em uso, logo após reiniciá-lo, com dez pedidos simultâneos para cada consulta. Essa situação representa computadores abrindo a mesma parte do ZWeb no mesmo momento.

Antes do serviço compartilhado, dez computadores fazendo a mesma consulta gerariam dez chamadas independentes ao ZWeb. Com a integração, no primeiro acesso o serviço faz uma chamada e entrega a mesma resposta aos outros nove pedidos que chegaram ao mesmo tempo. Depois que a resposta fica em cache, não é necessário fazer nova chamada externa até o prazo daquela informação vencer.

| Consulta | Prazo de reaproveitamento | Primeiro acesso, 10 pedidos | Chamadas ao ZWeb no primeiro acesso | Chamadas evitadas | Tempo mediano com cache aquecido |
| --- | ---: | ---: | ---: | ---: | ---: |
| Categorias financeiras | 30 minutos | 583 ms | 1 | 9 de 10 | 7 ms |
| Formas de pagamento | 15 minutos | 85 ms | 1 | 9 de 10 | 15 ms |
| Clientes e destinatários | 10 minutos | 272 ms | 1 | 9 de 10 | 25 ms |
| Status de vendas | 1 minuto | 56 ms | 1 | 9 de 10 | 4 ms |
| Cliente padrão para novos DAVs | não depende de consulta externa | 14 ms | 0 | 10 de 10 | 4 ms |

Os tempos acima foram medidos do computador de administração até o serviço interno, incluindo a primeira consulta ao ZWeb quando ela foi necessária. O número mais importante para carga é a coluna de chamadas ao ZWeb: em cada grupo de dez pedidos iguais, quatro consultas que antes seriam repetidas dez vezes passaram a chegar uma vez ao ZWeb, uma redução de 90% no momento de maior concorrência. Enquanto o cache estiver válido, a redução é de 100% para pedidos repetidos.

O cliente padrão de DAV é um caso diferente. Ele não busca a lista de clientes, não depende de posição na tela e não faz consulta externa. O serviço devolve diretamente o identificador previamente definido. Na medição, dez pedidos simultâneos foram atendidos entre 2 e 16 ms, com mediana de 4 ms depois da primeira chamada local.

Durante a medição encontrei e corrigi uma divergência interna nos nomes de cache de formas de pagamento e status de vendas. Elas respondiam normalmente, mas não estavam sendo reaproveitadas. Depois da correção, as duas passaram pelo mesmo teste de dez pedidos simultâneos, com uma única chamada externa e nove respostas agrupadas. A correção foi publicada no serviço em uso e protegida por teste automatizado.

### 17. Leitura de prateleira sem sinal de rede

O coletor passou a guardar no próprio aparelho os lotes lidos quando ele estiver sem conexão. A leitura, a escolha do endereço e o botão de envio continuam sendo usados da mesma forma.

Quando a conexão voltar, os lotes guardados seguem para o serviço interno na ordem em que foram feitos. Não foi criada uma tela ou aviso extra para isso, para não acrescentar etapas ao trabalho de quem está no estoque.

Também foi mantida uma proteção para não repetir tentativas em sequência caso o serviço continue indisponível. Cada retorno de conexão inicia somente uma conferência ordenada da fila que ficou guardada.

A versão do aplicativo foi atualizada para 1.1.3, mantendo a instalação anterior e as informações já guardadas no aparelho.

Também foi ajustada a configuração usada apenas para gerar a instalação do Android, evitando que o compilador reserve memória demais no computador de manutenção.

Depois de uma conferência em uso, corrigi também o retorno do Wi-Fi durante uma leitura. Se o sinal cair antes de a descrição do item aparecer, o coletor agora termina essas conferências pendentes em uma busca única quando a conexão volta.

Essa correção foi preparada na versão 1.1.4 do aplicativo.

Também foi separado o caso de item ausente do caso de perda de sinal durante a leitura. Sem resposta do serviço, o item continua pendente para ser confirmado depois; ele só é marcado como ausente quando o serviço realmente devolve essa confirmação.

Essa separação foi incluída na versão 1.1.5 do aplicativo.

Também foi retirada a espera visual da leitura. O código entra na lista imediatamente e a conferência do catálogo, quando disponível, acontece sem prender a leitura seguinte. O endereço pode ser informado normalmente e a confirmação final permanece concentrada no envio do lote.

Esse ajuste foi incluído na versão 1.1.6 do aplicativo.

Também deixei disponível a associação manual de código de barras para itens lidos sem conexão. Assim, se o item ainda não tiver sido conferido pelo catálogo, é possível informar o código do produto e seguir para o envio final do lote.

Esse ajuste foi incluído na versão 1.1.7 do aplicativo.

### 30/09/2026 — Transmissão pela grade passa a ser feita pelo ZWeb

Retirei a opção de transmitir NF-e que a extensão acrescentava à grade, pois o ZWeb passou a oferecer essa função diretamente. Também retirei as chamadas e os avisos usados por essa automação. A transmissão agora fica por conta da opção do próprio sistema, evitando duas opções para a mesma tarefa.

Os arquivos atualizados foram disponibilizados na pasta compartilhada usada pelos computadores da loja, com conferência de que são iguais aos arquivos testados. As próximas atualizações também serão copiadas para essa pasta e conferidas antes de serem consideradas entregues.

### 02/10/2026 — Fechamento de estoque com prazo compartilhado

Passei o fechamento automático da opção Permitir estoque negativo, em Configurações Gerais, para o serviço compartilhado da loja. Quando a extensão identifica essa opção ligada, o serviço guarda um prazo de cinco minutos. Outros computadores vendo a mesma opção não reiniciam a contagem, e fechar o navegador não apaga o prazo.

Ao terminar o prazo, o serviço consulta a configuração atual, desliga a opção se necessário e consulta novamente para confirmar. As chamadas são feitas uma por vez, com espaçamento e limite de espera. Após uma falha, uma nova tentativa só acontece depois de uma hora.

O prazo permanece guardado após reiniciar o serviço. A autorização de acesso fica apenas na memória: após um reinício, é necessário que um navegador atualizado abra o ZWeb para fornecer uma sessão válida. Os testes locais conferiram vários computadores, reinício, cancelamento manual e falhas; a confirmação do fechamento no ZWeb ainda depende do teste em uso.

A atualização foi copiada para o servidor e o serviço foi reiniciado. A conferência confirmou a função ativa no serviço, com 47 testes da extensão e 115 testes do serviço aprovados.

### 02/10/2026 — Interruptor de estoque acompanha o estado salvo

Acrescentei uma conferência ao abrir Configurações Gerais para que o interruptor de estoque acompanhe a configuração salva. A atualização usa o estado da página, sem clicar no botão ou mandar salvar novamente. Se a pessoa começar a mexer na configuração enquanto a consulta estiver chegando, essa resposta não substitui a escolha dela.

As consultas de várias estações compartilham a mesma resposta por trinta segundos. Após falha, a consulta fica em espera por uma hora. A extensão passou para a versão 1.4.1. O comportamento foi verificado em testes locais; a aparência no ZWeb precisa ser conferida depois de recarregar a extensão.

Depois do teste em duas estações, corrigi a prioridade das informações: uma alteração salva com sucesso passa a atualizar imediatamente o estado compartilhado, mesmo que uma consulta anterior tenha falhado. Um painel antigo não substitui essa confirmação recente. Também acrescentei o motivo da falha ao diagnóstico, pois a mensagem anterior não mostrava por que a consulta havia sido recusada. Essa correção está na versão 1.4.2 e ainda precisa de nova conferência na interface real.

A pedido, liberei uma nova conferência visual para teste. Separei a espera dessa consulta da espera do fechamento automático: uma falha ao fechar não impede a conferência do botão. Mantive a proteção de uma hora após falha em cada operação e preservei o agendamento existente.

Passei a guardar o motivo e o horário das falhas de conferência do estoque no servidor. O aviso de espera agora informa a causa e quando uma nova tentativa será permitida. Reiniciar o serviço não apaga mais essa proteção. O registro não guarda senhas, tokens nem o conteúdo das respostas. Também passei a guardar uma causa resumida quando o fechamento automático falha. Os testes foram feitos localmente; a causa da falha anterior não pode ser recuperada retroativamente.

Ao investigar a resposta sem configuração de estoque, encontrei uma diferença na identificação de acesso: o serviço usava uma identificação antiga, enquanto o código do ZWeb já usa outra. Ajustei o serviço para seguir o formato usado pelo ZWeb. Essa correção vale tanto para conferir o botão quanto para o fechamento automático. Os testes locais validaram o formato; a confirmação da resposta real ainda depende da homologação em uso.

Na homologação, confirmei que a consulta funciona no navegador autenticado, mas devolve uma resposta sem configuração quando parte do servidor. Por isso, a conferência visual passou a usar a sessão do navegador. O serviço libera somente uma estação para consultar, compartilha o resultado por trinta segundos e bloqueia por uma hora se houver falha ou ausência de resposta. A consulta usa apenas os dados da empresa, sem carregar o dashboard inteiro. Não altera nem salva a opção de estoque. Essa revisão está na versão 1.4.3. O fechamento automático não foi testado com alteração real da configuração nesta homologação.

Os 51 testes da extensão e 14 testes específicos do serviço passaram. A consulta direta na página retornou a configuração corretamente. O teste do fluxo completo da versão nova ficou pendente da recarga da extensão no Chrome: o navegador ainda estava executando a versão anterior. Não considerei essa etapa concluída.

Depois da recarga, conferi pessoalmente a consulta pelo fluxo da extensão: ela recebeu a configuração em uma única chamada e atualizou o registro compartilhado. O teste do botão revelou outra diferença: o formulário usa um estado separado dos dados da empresa. Corrigi a atualização para alcançar também esse estado, sem clicar, salvar ou alterar outras opções. Essa correção está na versão 1.4.4.

Validei a correção na página real: a consulta levou aproximadamente 407 milissegundos, retornou o estoque negativo desativado e guardou essa confirmação no serviço. Simulei um botão visualmente ligado apenas na memória da tela; a atualização corrigiu o botão para desligado. A captura confirmou que não houve chamada para salvar configurações durante esse teste. O fechamento automático real continua sem validação nesta rodada.

Após o teste em outras máquinas, corrigi duas situações de uso simultâneo: as estações que estão aguardando uma consulta agora recebem seu resultado, sem fazer outra consulta ao ZWeb; e uma resposta antiga não substitui uma alteração salva enquanto a consulta estava em andamento. A espera é limitada e não gera repetição automática. Esses casos foram reproduzidos em testes locais antes da correção.

### 07/10/2026 — Reaproveitamento no formulário e redução de consultas do lote

Acrescentei um caminho direto para usar clientes e produtos que já estejam carregados no seletor do DAV. Quando o formulário permite esse acesso, a extensão usa a seleção nativa pelo identificador do cliente ou pelo código exato do produto, sem pesquisar novamente. Quando os dados não estão disponíveis, continua usando a seleção pela interface que já foi confirmada em uso. Não criei linhas artificiais: a quantidade e a adição continuam passando pelo ZWeb para preservar seus cálculos e validações. Esse reaproveitamento é uma otimização quando os dados estão disponíveis, não uma substituição completa da interface por API.

Removi a consulta por páginas que o lote fazia antes de começar. Ela podia continuar em andamento enquanto o preenchimento visual já tinha começado. Também retirei a segunda tentativa automática de pesquisa. O lote agora elimina códigos repetidos, aceita até 50 códigos por execução, processa um por vez com intervalo mínimo de um segundo entre itens, para na primeira falha e mantém uma espera de trinta minutos naquela aba. O resultado informa os itens que ficaram pendentes. Essas proteções valem para a execução do lote, não para todas as ações manuais de todos os navegadores da loja.

A revisão está na versão 1.4.10. Os testes locais verificaram seleção sem nova pesquisa, preservação da escolha manual, ausência de consulta duplicada, espaçamento e interrupção por falha. Não foram feitas consultas ao ZWeb de produção nesta implementação. A homologação real depende da recarga da extensão.

### 07/10/2026 — Quantidade inteira no lote

Depois da confirmação do cliente padrão, reproduzi o erro do lote em que uma unidade virava cem. A extensão acrescentava duas casas decimais quando não conseguia ler a configuração da máscara; o campo inteiro removia a vírgula e aproveitava os zeros. Corrigi esse preenchimento para não acrescentar casas decimais sem uma configuração conhecida. Mantive a interrupção quando a quantidade não é confirmada, para não adicionar um item errado. Os testes locais conferiram os valores 1, 2, 10 e 100, incluindo perder o foco depois de preencher. A revisão está na versão 1.4.9. O teste da linha adicionada no ZWeb real continua pendente da recarga da extensão; nenhum DAV foi salvo.

### 07/10/2026 — Seleção nativa quando o componente interno não está acessível

Ajustei o cliente padrão para não depender somente do acesso ao componente interno do formulário. Quando esse acesso não está disponível, a extensão aciona a opção nativa da lista, sem desenhar um cliente selecionado por conta própria. Só confirma o resultado quando o cliente aparece como seleção e a lista está fechada. Se existir mais de uma opção de mesmo nome, não escolhe uma ao acaso. O teste de navegador agora cobre também essa situação, incluindo clicar fora depois da seleção. Essa revisão está na versão 1.4.8, validada localmente; a conferência real depende da recarga da extensão. Não foi salvo nenhum DAV.

### 07/10/2026 — Preparação dos próximos testes no navegador

Registrei como preparar a homologação com o perfil Vendas autenticado e a extensão carregada da pasta compartilhada, sempre conferindo a versão instalada. Após a recarga informada, retomei a aba real: o cliente ainda apareceu como pesquisa e sumiu ao perder o foco. Não considerei a correção concluída. A tentativa seguinte de operar o campo foi interrompida por falha na conexão de controle do navegador; nenhum DAV foi salvo. O teste do lote nessa rodada permanece pendente.

### 07/10/2026 — Correção da rota usada na homologação

Na aba autenticada, identifiquei que o ZWeb abre o novo DAV com uma barra no final do endereço. A integração nova não aceitava essa variação e ignorava os comandos de selecionar o cliente e preencher a quantidade. Reproduzi o endereço real no teste, confirmei a falha e corrigi a aceitação das duas formas. Os testes de navegador agora passam pela comunicação completa entre a extensão e a página, inclusive no envio da quantidade. Essa revisão está na versão 1.4.7. A homologação real ficou aguardando a recarga da extensão; não foi salvo nenhum DAV.

### 07/10/2026 — Seleção real do cliente e quantidade do lote

Depois do teste em uso, ficou claro que a primeira correção ainda podia deixar apenas o texto de pesquisa: ao clicar fora, ele sumia. Substituí a seleção por texto pela rotina do próprio formulário, usando o identificador do cliente. A confirmação agora depende do cliente estar guardado no formulário, não somente aparecer na tela. Acrescentei um teste no Chrome que clica fora e confere se o cliente continua selecionado, inclusive quando existem dois clientes com o mesmo nome.

Também corrigi o envio da quantidade do lote para respeitar a máscara numérica do ZWeb. Uma unidade não deve se transformar em dez mil por diferença de casas decimais. A extensão confere o valor recebido pelo campo e interrompe o item se a quantidade não for confirmada. Entradas inválidas não são transformadas silenciosamente em outra quantidade. A revisão está na versão 1.4.6, com testes locais e sem consultas à produção; ainda depende da conferência no ZWeb real após recarregar.

### 07/10/2026 — Correção do cliente padrão nos novos DAVs

Corrigi o preenchimento que podia mostrar o nome sem selecionar o cliente de verdade. A extensão agora aciona a opção da lista e só considera a etapa concluída depois que a seleção aparece no formulário. Também corrigi o controle para cada novo DAV, sem ficar repetindo o preenchimento na mesma tela ou substituir um cliente escolhido pela pessoa. Clientes com nomes parecidos não são tratados como o cliente padrão; se houver duas opções com o mesmo nome, a extensão não escolhe uma ao acaso. Uma falha não provoca novas buscas automáticas naquela tela, e a consulta ao serviço interno tem prazo máximo de oito segundos.

Criei 14 testes para essa função, incluindo um teste no Chrome isolado com opções e seleção chegando com atraso. Não foram feitas consultas ao ZWeb de produção. Os testes locais passaram; a confirmação no formulário real depende da recarga da extensão e da homologação. Essa atualização está na versão 1.4.5.

### 07/10/2026 — Atualização do repositório da extensão

Conferi os arquivos usados pelos computadores e trouxe para o repositório as alterações da extensão 1.4.4 e do serviço de estoque que trabalha com ela. Preservei a versão mais recente do captador de DAV que já estava no servidor. Os arquivos ativos da extensão correspondem à versão publicada; cópias antigas de segurança e uma ferramenta de diagnóstico não utilizada pela extensão ficaram fora. As alterações do app do celular e os arquivos temporários do banco também ficaram fora desta atualização. Os 52 testes da extensão e os 16 testes específicos do controle de estoque passaram. Essa conferência não substitui o teste do fechamento automático em uso.

### 03/10/2026 — Escolha da empresa no coletor sem Wi-Fi

Corrigi a escolha entre Horizonte e MVA no app do coletor para não depender da conexão. A lista de empresas passa a ficar guardada no aparelho, junto com a última escolha. Mesmo ao reabrir sem rede, o seletor continua disponível. A perda da sessão online não apaga essa lista. Os lotes já guardados continuam vinculados à empresa em que foram preparados; trocar a seleção não muda esses lotes. Não acrescentei mensagens de modo offline à interface.

Os 45 testes do app passaram, incluindo a reabertura sem rede e o envio posterior de lotes das duas empresas sem misturar os destinos. A análise do código não apontou problemas. Gerei o APK da versão 1.1.8; a instalação e a conferência física no celular ainda precisam ser feitas.

Instalei a versão 1.1.8 no celular conectado, um Moto E20, por cima da versão 1.1.7, sem desinstalar nem limpar os dados. A instalação retornou sucesso e conferi no aparelho a versão 1.1.8, código 1010. O teste de uso com o Wi-Fi desligado ainda não foi feito no aparelho nesta instalação.
