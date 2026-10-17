// Acesso de viatura da PB (item 6 do formulário, NT 14/2023): com as
// distâncias e os dados da via informados pelo RT, decide qual linha do
// formulário vale — mesma ideia do gatilho do MA (av_calc.js), com o
// critério da PB: hidrante de recalque e caminhamentos até a via pública.
//
// Casos (linhas do formulário, na ordem):
//   1 sem recalque, edificação ≤ 20 m              → facultativo
//   2 recalque ≤ 20 m e edificação ≤ 50 m          → facultativo
//   3 sem recalque, edificação > 20 m              → obrigatório
//   4 recalque ≤ 20 m e edificação > 50 m          → obrigatório
//   5 recalque > 20 m e edificação > 50 m          → obrigatório
// Recalque > 20 m com edificação ≤ 50 m não tem linha no formulário: o
// acesso é obrigatório (o recalque fica fora do alcance) e nenhuma das cinco
// é marcada — a página avisa.

const num = v => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** `temRecalque`: hidrante de recalque no local (o sistema de hidrantes do
 *  projeto, salvo indicação contrária do RT em `av.temRecalque`). */
export function decidirAcessoViaturaPB(av = {}, temRecalqueProjeto, P) {
  if (!P) return null
  const temRecalque = av.temRecalque === 'sim' ? true : av.temRecalque === 'nao' ? false : !!temRecalqueProjeto
  const edificacao = num(av.distanciaEdificacao)
  const recalque = num(av.distanciaRecalque)
  let caso = null, obrigatorio = null, foraDoFormulario = false
  if (!temRecalque) {
    if (edificacao != null) {
      obrigatorio = edificacao > P.semRecalque.edificacaoMax
      caso = obrigatorio ? 3 : 1
    }
  } else if (edificacao != null && recalque != null) {
    const recalqueOk = recalque <= P.comRecalque.recalqueMax
    const edificacaoOk = edificacao <= P.comRecalque.edificacaoMax
    if (recalqueOk && edificacaoOk) { caso = 2; obrigatorio = false }
    else if (recalqueOk) { caso = 4; obrigatorio = true }
    else if (!edificacaoOk) { caso = 5; obrigatorio = true }
    else { obrigatorio = true; foraDoFormulario = true }
  }

  // Via de acesso (vale quando obrigatória). Campo vazio = ainda não
  // informado (não marca nada).
  const largura = num(av.larguraVia)
  const alturaLivre = num(av.alturaLivre)
  const extensao = num(av.extensaoVia)
  const V = P.via
  const viaPadrao = largura != null && largura >= V.larguraMin
  const viaReduzida = largura != null && largura >= V.larguraReduzidaMin && largura < V.larguraMin
  const exigeRetorno = largura != null && extensao != null && largura < P.retorno.larguraAbaixoDe && extensao > P.retorno.comprimentoAcimaDe
  const portaoOk = !!av.temPortao && (num(av.portaoLargura) ?? 0) >= P.portao.larguraMin && (num(av.portaoAltura) ?? 0) >= P.portao.alturaMin

  return {
    temRecalque, edificacao, recalque, caso, obrigatorio, foraDoFormulario,
    via: {
      // a)–f): largura ≥ 6, altura livre ≥ 4,5, 25.000 kgf e desobstrução
      // confirmados pelo RT, e portão (se houver) nas dimensões mínimas.
      atende: obrigatorio === true && viaPadrao && (alturaLivre ?? 0) >= V.alturaLivreMin && !!av.cargaConfirmada && !!av.desobstruida && (!av.temPortao || portaoOk),
      reduzida: obrigatorio === true && viaReduzida,
      larguraAbaixoDoMinimo: largura != null && largura < V.larguraReduzidaMin,
      exigeRetorno,
      retornoInformado: !!av.retorno,
    },
    portaoOk,
    faixa: obrigatorio === true && !!av.faixaEstacionamento,
  }
}
