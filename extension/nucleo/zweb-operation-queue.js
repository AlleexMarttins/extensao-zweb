// Fila serial para qualquer operacao que toque a API do ZWeb.
//
// O ZWeb ja apontou milhares de chamadas em um mesmo segundo vindas daqui, e
// avisou que um novo pico pode bloquear a conta. Entao nada de paralelismo,
// varredura ou repeticao rapida: um item por vez, com intervalo minimo entre
// chamadas, teto por execucao, prazo de resposta e bloqueio apos falha.
//
// O relogio e a espera sao injetaveis para o teste nao depender de tempo real
// nem de rede.
(function () {
  'use strict';

  const PADROES = {
    intervaloMinimoMs: 1500,
    timeoutMs: 15000,
    limitePorExecucao: 25,
    bloqueioAposFalhaMs: 15 * 60 * 1000
  };

  function createZwebOperationQueue(options) {
    const config = { ...PADROES, ...(options || {}) };
    const nome = String(config.nome || 'zweb');
    const agora = config.agora || (() => Date.now());
    const esperar = config.esperar || (ms => new Promise(resolve => setTimeout(resolve, ms)));
    const registrar = config.registrar || (evento => console.info(`[${nome}]`, evento));

    // null, e nao 0: com o relogio comecando em zero, 0 seria confundido com
    // "ja chamou agora" e o intervalo minimo nunca seria aplicado.
    let ultimaChamadaEm = null;
    let bloqueadoAte = 0;
    let emAndamento = false;

    function bloqueado() {
      return agora() < bloqueadoAte;
    }

    async function comPrazo(promessa) {
      let temporizador;
      const prazo = new Promise((resolve, reject) => {
        temporizador = setTimeout(() => reject(new Error(`A ZWeb nao respondeu em ${config.timeoutMs} ms.`)), config.timeoutMs);
      });
      try {
        return await Promise.race([promessa, prazo]);
      } finally {
        clearTimeout(temporizador);
      }
    }

    async function respeitarIntervalo() {
      const desde = ultimaChamadaEm === null ? Infinity : agora() - ultimaChamadaEm;
      if (desde < config.intervaloMinimoMs) {
        await esperar(config.intervaloMinimoMs - desde);
      }
      ultimaChamadaEm = agora();
    }

    /// Uma chamada ao ZWeb: espera o intervalo minimo desde a anterior e
    /// desiste se passar do prazo. Um item pode precisar de varias chamadas
    /// (buscar, salvar, conferir), e o intervalo vale para cada uma delas.
    async function chamar(acao) {
      await respeitarIntervalo();
      return comPrazo(Promise.resolve().then(acao));
    }

    /// Processa os itens em serie. Para na primeira falha e entra em bloqueio,
    /// em vez de insistir: se o ZWeb recusou uma vez, repetir agora so piora.
    async function executar(itens, trabalho) {
      const lista = Array.isArray(itens) ? itens : [];
      if (emAndamento) {
        return { estado: 'em_andamento', processados: 0, falhas: 0, restantes: lista.length };
      }
      if (bloqueado()) {
        const resumo = { estado: 'bloqueado', processados: 0, falhas: 0, restantes: lista.length, proximaTentativaEm: bloqueadoAte };
        registrar({ ...resumo, em: agora() });
        return resumo;
      }
      if (!lista.length) return { estado: 'vazio', processados: 0, falhas: 0, restantes: 0 };

      emAndamento = true;
      const alvo = lista.slice(0, config.limitePorExecucao);
      const iniciadoEm = agora();
      let processados = 0;
      let falhas = 0;
      let motivo = null;

      try {
        for (const item of alvo) {
          try {
            await trabalho(item, chamar);
            processados += 1;
          } catch (error) {
            falhas += 1;
            motivo = error && error.message || 'Falha desconhecida.';
            bloqueadoAte = agora() + config.bloqueioAposFalhaMs;
            break;
          }
        }
      } finally {
        emAndamento = false;
      }

      const resumo = {
        estado: falhas ? 'falhou' : 'concluido',
        processados,
        falhas,
        motivo,
        restantes: lista.length - processados - falhas,
        limitePorExecucao: config.limitePorExecucao,
        duracaoMs: agora() - iniciadoEm,
        proximaTentativaEm: bloqueadoAte || null
      };
      registrar({ ...resumo, em: iniciadoEm });
      return resumo;
    }

    return { executar, chamar, bloqueado, get bloqueadoAte() { return bloqueadoAte; } };
  }

  globalThis.ZWEB_OPERATION_QUEUE = { createZwebOperationQueue, PADROES };
})();
