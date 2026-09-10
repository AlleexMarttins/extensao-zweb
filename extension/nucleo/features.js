(function(global) {
  'use strict';

  // Cada operação precisa de liberação explícita. A lista abaixo é a barreira
  // de produção: qualquer item não aprovado continua negado individualmente.
  const PRODUCTION_ZWEB_AUTOMATION_ENABLED = true;
  const ZWEB_OPERATION_POLICY = Object.freeze({
    pdvCashCounterRead: false,
    personLookup: false,
    supplierLookup: true,
    negativeStockAutomaticClose: false,
    productRangeRead: false,
    productBulkRead: true,
    productPreferredSupplierWrite: true,
    fiscalDocumentRead: true,
    fiscalDocumentWrite: true,
    fiscalTransmission: true,
    fiscalCancellation: true,
    davClone: false,
    commissionReturnsRefresh: true,
    productLocationMigration: false,
    productBarcodeWrite: true,
    productShelfBatchWrite: true,
    referenceCategoryRefresh: false
  });

  // Register every user-facing automation here so the popup can render a toggle
  // automatically and the runtime can share the same defaults.
  const FEATURE_DEFINITIONS = [
    {
      key: 'enabled',
      group: 'Geral',
      title: 'Prote\u00e7\u00e3o',
      description: 'Bloqueia bot\u00f5es, campos e a\u00e7\u00f5es sens\u00edveis da Zweb.',
      reloadPrompt: true,
      defaultValue: true,
    },
    {
      key: 'visualCustomizationEnabled',
      group: 'Geral',
      title: 'Personaliza\u00e7\u00e3o Visual',
      description: 'Aplica fonte, tamanho e cores personalizados em toda a Zweb.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'filterEnabled',
      group: 'Produtos',
      title: 'Filtro',
      description: 'Mostra no modal Filtrar apenas colunas ativas.',
      reloadPrompt: true,
      defaultValue: true,
    },
    {
      key: 'multiTermFilterEnabled',
      group: 'Produtos',
      title: 'Filtro Composto',
      description: 'Permite filtros persistentes com E/OU no Filtrar, como FT + 12V + 5A ou Codigo 15 OU 150.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'productPreviewEnabled',
      group: 'Produtos',
      title: 'Filtro de C\u00f3digos',
      description: 'Exibe um filtro especializado por faixa de c\u00f3digos na lista de produtos.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'productPreferredSupplierBulkEnabled',
      group: 'Produtos',
      title: 'Fornecedor Preferencial',
      description: 'No modal Replicar altera\u00e7\u00f5es, adiciona a replica\u00e7\u00e3o do fornecedor preferencial para os itens marcados.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'productCloneProtectionEnabled',
      group: 'Produtos',
      title: 'Bloquear Clonar',
      description: 'Bloqueia separadamente o bot\u00e3o Clonar dentro do cadastro de produto.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'lowStockHighlightEnabled',
      group: 'Produtos',
      title: 'Estoque M\u00ednimo',
      description: 'Destaca em vermelho produtos cuja Quantidade esteja menor ou igual \u00e0 Qtd. m\u00ednima.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'productLocationsEnabled',
      group: 'Produtos',
      title: 'Enderecamento',
      description: 'Mostra e permite atualizar o local do produto sem usar o campo Observacao.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'itemSearchHashEnabled',
      group: 'Fiscal',
      title: 'Busca com #',
      description: 'Normaliza a busca de itens para c\u00f3digo com # no DAV e no cadastro de NF-e.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'batchEnabled',
      group: 'DAV',
      title: 'Lote',
      description: 'Exibe o bot\u00e3o Lote para adicionar v\u00e1rios itens.',
      reloadPrompt: false,
      defaultValue: true,
    },
    // AutoCaixa: NAO faz nenhuma chamada na Zweb. So le o que o proprio ZWeb
    // ja mandou ao salvar o DAV e repassa pro servidor da rede local, que
    // imprime a etiqueta e alimenta o totem. Por isso nao tem chave na
    // ZWEB_OPERATION_POLICY: nao ha operacao contra a Zweb pra liberar.
    // Desligado por padrao: so a loja que tem o totem deve ligar.
    {
      key: 'autoCaixaDavWatcherEnabled',
      group: 'DAV',
      title: 'AutoCaixa (autoatendimento)',
      description: 'Ao salvar um DAV, envia o pedido para o totem de '
        + 'autoatendimento na rede local. N\u00e3o consulta a Zweb.',
      reloadPrompt: true,
      defaultValue: false,
    },
    {
      key: 'xmlDownloadEnabled',
      group: 'Fiscal',
      title: 'Baixar XML',
      description: 'Baixa automaticamente o XML gerado na NF-e.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'nfeBatchDownloadEnabled',
      group: 'Fiscal',
      title: 'Downloads em Lote',
      description: 'Adiciona uma a\u00e7\u00e3o para baixar v\u00e1rios XMLs ou PDFs na tela de NF-e.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'purchaseValueSettingsEnabled',
      group: 'Fiscal',
      title: 'C\u00e1lculo de Valores',
      description: 'Exibe a se\u00e7\u00e3o C\u00e1lculo de Valores em Fiscal > Configura\u00e7\u00f5es > Notas fiscais.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'purchaseValueSyncEnabled',
      group: 'Fiscal',
      title: 'C\u00e1lculo em Compras',
      description: 'Exibe um painel auxiliar na compra para calcular valores sugeridos a partir do XML importado.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'noteAssistantEnabled',
      group: 'Fiscal',
      title: 'Assistente de Nota',
      description: 'Detecta a chave de acesso na Zweb e continua o fluxo no FSIST e no Portal NF-e.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'actionMenuCustomizeEnabled',
      group: 'Fiscal',
      title: 'Personalizar A\u00e7\u00f5es',
      description: 'Exibe o bot\u00e3o Personalizar e filtra op\u00e7\u00f5es do menu A\u00e7\u00f5es da NF-e.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'nfeCloneAssistEnabled',
      group: 'Fiscal',
      title: 'Clonar NF-e',
      description: 'Controla separadamente o fluxo assistido de Clonar na tela de NF-e. Desligado: o clone volta a seguir o comportamento nativo.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'nfeCloneBlockEnabled',
      group: 'Fiscal',
      title: 'Bloquear Clonar NF-e',
      description: 'Bloqueia o Clonar na tela de NF-e, substituindo o fluxo assistido e o comportamento nativo.',
      reloadPrompt: false,
      defaultValue: false,
    },
    {
      key: 'nfceCloneAssistEnabled',
      group: 'Fiscal',
      title: 'Clonar NFC-e',
      description: 'Controla separadamente o fluxo assistido de Clonar na tela de NFC-e. Desligado: o clone volta a seguir o comportamento nativo.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'nfceCloneBlockEnabled',
      group: 'Fiscal',
      title: 'Bloquear Clonar NFC-e',
      description: 'Bloqueia o Clonar na tela de NFC-e, substituindo o fluxo assistido e o comportamento nativo.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'nfeCashSaleBoletoGuardEnabled',
      group: 'Fiscal',
      title: 'Boleto Venda \u00e0 Vista',
      description: 'Ao tentar gerar boleto em NF-e com natureza Venda \u00e0 Vista, mostra um aviso e pede confirma\u00e7\u00e3o antes de continuar.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'nfceCardBrandCleanupEnabled',
      group: 'Fiscal',
      title: 'Bandeiras NFC-e',
      description: 'Oculta na NFC-e as bandeiras duplicadas em caixa alta, como MASTERCARD, ELO e VISA, mantendo apenas as variantes corretas.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'commissionReturnsEnabled',
      group: 'Documentos',
      title: 'Ajustar Comiss\u00f5es',
      description: 'Usa o hist\u00f3rico de devolu\u00e7\u00f5es da NF-e para inverter valores no relat\u00f3rio HTML de comiss\u00f5es.',
      reloadPrompt: false,
      defaultValue: true,
    },
    {
      key: 'commissionReturnCheckPromptEnabled',
      group: 'Documentos',
      title: 'Conferir Devolu\u00e7\u00f5es',
      description: 'Antes de gerar o relat\u00f3rio de comiss\u00f5es, pergunta se as devolu\u00e7\u00f5es j\u00e1 foram conferidas.',
      reloadPrompt: false,
      defaultValue: true,
    }
  ];

  function getDefaults() {
    return FEATURE_DEFINITIONS.reduce((acc, feature) => {
      acc[feature.key] = feature.forceDisabled ? false : feature.defaultValue !== false;
      return acc;
    }, {});
  }

  function normalizeState(rawState) {
    const defaults = getDefaults();
    const nextState = Object.assign({}, defaults, rawState || {});

    FEATURE_DEFINITIONS.forEach((feature) => {
      nextState[feature.key] = feature.forceDisabled ? false : nextState[feature.key] !== false;
    });

    return nextState;
  }

  global.ZWEB_FEATURES = {
    definitions: FEATURE_DEFINITIONS,
    getDefaults,
    normalizeState,
  };
  global.ZWEB_RUNTIME_GUARDS = Object.freeze({
    productionZwebAutomationEnabled: PRODUCTION_ZWEB_AUTOMATION_ENABLED,
    operationPolicy: ZWEB_OPERATION_POLICY,
    canRun(operationId) {
      return PRODUCTION_ZWEB_AUTOMATION_ENABLED === true
        && typeof operationId === 'string'
        && ZWEB_OPERATION_POLICY[operationId] === true;
    }
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
