// ─────────────────────────────────────────────────────────────────────────────
// av_calc.js — Funções universais de dimensionamento de Acesso de Viatura
// Recebem os dados normativos (GATILHO/VIA_ACESSO) como parâmetro; não importam
// nenhum arquivo de estado diretamente. Mesmas funções alimentam a tela (chips/
// tabelas) e o texto do memorial — nunca duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0

/** Anexo A — a via de acesso dedicada é exigida, ou a via pública já resolve? */
export function calcGatilho(altura, afastamento, isCondominio, gatilho) {
  const h = num(altura)
  const a = num(afastamento)
  if (isCondominio && gatilho.condominioSempreExige) {
    return { exigido: true, motivo: 'condominio' }
  }
  const faixa = h <= gatilho.alturaLimite ? 'baixa' : 'alta'
  const afastamentoMax = gatilho.afastamentoMax[faixa]
  return { exigido: a > afastamentoMax, motivo: 'afastamento', faixa, afastamentoMax }
}

/** Dimensionamento completo da via de acesso (item 5.1.1) */
export function calcAcessoViatura(inputs, params, ctx) {
  const { larguraMin, alturaLivreMin, cargaMinKg, cargaEixos, desnivelMaxPct, portao, retorno, distancia } = params
  const { temHidrantes } = ctx

  const larguraAdotada    = num(inputs.larguraAdotada)
  const alturaLivreAdotada = num(inputs.alturaLivreAdotada)
  const desnivelLong      = num(inputs.desnivelLongAdotado)
  const desnivelTransv    = num(inputs.desnivelTransvAdotado)
  const extensaoVia       = num(inputs.extensaoVia)
  const distanciaAdotada  = num(inputs.distanciaAdotada)

  const exigeRetorno = extensaoVia > retorno.extensaoGatilho
  const distanciaMaxima = temHidrantes ? distancia.comHidrante : distancia.semHidrante

  const portaoRes = inputs.temPortao ? {
    largura: { adotada: num(inputs.portaoLargura), minima: portao.larguraMin, atende: num(inputs.portaoLargura) >= portao.larguraMin },
    altura:  { adotada: num(inputs.portaoAltura),  minima: portao.alturaMin,  atende: num(inputs.portaoAltura)  >= portao.alturaMin },
  } : null

  const saidaIndepRes = inputs.semManobraRetorno ? {
    largura: { adotada: num(inputs.saidaIndepLargura), minima: portao.larguraMin, atende: num(inputs.saidaIndepLargura) >= portao.larguraMin },
    altura:  { adotada: num(inputs.saidaIndepAltura),  minima: portao.alturaMin,  atende: num(inputs.saidaIndepAltura)  >= portao.alturaMin },
  } : null

  const resultado = {
    largura:     { adotada: larguraAdotada, minima: larguraMin, atende: larguraAdotada >= larguraMin },
    alturaLivre: { adotada: alturaLivreAdotada, minima: alturaLivreMin, atende: alturaLivreAdotada >= alturaLivreMin },
    carga:       { minimaKg: cargaMinKg, eixos: cargaEixos, confirmado: !!inputs.cargaConfirmada },
    desnivel:    {
      longAdotado: desnivelLong, transvAdotado: desnivelTransv, maximo: desnivelMaxPct,
      atendeLong: desnivelLong <= desnivelMaxPct, atendeTransv: desnivelTransv <= desnivelMaxPct,
    },
    portao: portaoRes,
    retorno: {
      extensaoVia, gatilho: retorno.extensaoGatilho, exigeRetorno,
      tipoRetorno: inputs.tipoRetorno || '', tipos: retorno.tipos,
      semManobra: !!inputs.semManobraRetorno,
      saidaIndependente: saidaIndepRes,
    },
    distancia: {
      adotada: distanciaAdotada, maxima: distanciaMaxima,
      baseadoEm: temHidrantes ? 'hidrante' : 'edificacao',
      atende: distanciaAdotada <= distanciaMaxima,
    },
  }

  const checagens = [
    resultado.largura.atende,
    resultado.alturaLivre.atende,
    resultado.carga.confirmado,
    resultado.desnivel.atendeLong,
    resultado.desnivel.atendeTransv,
    portaoRes ? (portaoRes.largura.atende && portaoRes.altura.atende) : true,
    exigeRetorno ? !!resultado.retorno.tipoRetorno : true,
    saidaIndepRes ? (saidaIndepRes.largura.atende && saidaIndepRes.altura.atende) : true,
    resultado.distancia.atende,
  ]
  resultado.atendeGeral = checagens.every(Boolean)

  return resultado
}
