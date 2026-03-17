(function(global) {
  'use strict';

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
      description: 'Permite usar mais de um termo no Filtrar, como LAMP 12V, exigindo todos os termos na mesma coluna.',
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
      key: 'lowStockHighlightEnabled',
      group: 'Produtos',
      title: 'Estoque M\u00ednimo',
      description: 'Destaca em vermelho produtos cuja Quantidade esteja menor ou igual \u00e0 Qtd. m\u00ednima.',
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
      key: 'stockPriceSimulationEnabled',
      group: 'Fiscal',
      title: 'Simular Pre\u00e7o',
      description: 'No popup da compra, usa o l\u00e1pis do cadastro para preencher o Pre\u00e7o sem salvar; fora dele, usa o estoque.',
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
      key: 'commissionReturnsEnabled',
      group: 'Documentos',
      title: 'Ajustar Comiss\u00f5es',
      description: 'Usa o hist\u00f3rico de devolu\u00e7\u00f5es da NF-e para inverter valores no relat\u00f3rio HTML de comiss\u00f5es.',
      reloadPrompt: false,
      defaultValue: true,
    }
  ];

  function getDefaults() {
    return FEATURE_DEFINITIONS.reduce((acc, feature) => {
      acc[feature.key] = feature.defaultValue !== false;
      return acc;
    }, {});
  }

  function normalizeState(rawState) {
    const defaults = getDefaults();
    const nextState = Object.assign({}, defaults, rawState || {});

    FEATURE_DEFINITIONS.forEach((feature) => {
      nextState[feature.key] = nextState[feature.key] !== false;
    });

    return nextState;
  }

  global.ZWEB_FEATURES = {
    definitions: FEATURE_DEFINITIONS,
    getDefaults,
    normalizeState,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
