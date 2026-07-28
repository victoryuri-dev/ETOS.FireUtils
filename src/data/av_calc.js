// ─────────────────────────────────────────────────────────────────────────────
// av_calc.js — Funções universais de dimensionamento de Acesso de Viatura
// Recebem os dados normativos (GATILHO/VIA_ACESSO) como parâmetro; não importam
// nenhum arquivo de estado diretamente. Mesmas funções alimentam a tela (chips/
// tabelas) e o texto do memorial — nunca duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0
// Campo vazio (ainda não editado pelo usuário) assume o valor mínimo/limite
// normativo — o usuário só precisa digitar algo se o projeto for diferente.
const numOr = (v, def) => {
  if (v === '' || v == null) return def
  const n = parseFloat(v)
  return isNaN(n) ? def : n
}

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

  const larguraAdotada     = numOr(inputs.larguraAdotada, larguraMin)
  const alturaLivreAdotada = numOr(inputs.alturaLivreAdotada, alturaLivreMin)
  const desnivelLong       = numOr(inputs.desnivelLongAdotado, desnivelMaxPct)
  const desnivelTransv     = numOr(inputs.desnivelTransvAdotado, desnivelMaxPct)
  const extensaoVia        = num(inputs.extensaoVia)
  const distanciaAdotada   = num(inputs.distanciaAdotada)

  const exigeRetorno = extensaoVia > retorno.extensaoGatilho
  const distanciaMaxima = temHidrantes ? distancia.comHidrante : distancia.semHidrante
  const exigeSaidaIndependente = !inputs.manobraRetornoOk

  const portaoRes = inputs.temPortao ? {
    largura: { adotada: numOr(inputs.portaoLargura, portao.larguraMin), minima: portao.larguraMin, atende: numOr(inputs.portaoLargura, portao.larguraMin) >= portao.larguraMin },
    altura:  { adotada: numOr(inputs.portaoAltura, portao.alturaMin),   minima: portao.alturaMin,  atende: numOr(inputs.portaoAltura, portao.alturaMin) >= portao.alturaMin },
  } : null

  const saidaIndepRes = exigeSaidaIndependente ? {
    largura: { adotada: numOr(inputs.saidaIndepLargura, portao.larguraMin), minima: portao.larguraMin, atende: numOr(inputs.saidaIndepLargura, portao.larguraMin) >= portao.larguraMin },
    altura:  { adotada: numOr(inputs.saidaIndepAltura, portao.alturaMin),   minima: portao.alturaMin,  atende: numOr(inputs.saidaIndepAltura, portao.alturaMin) >= portao.alturaMin },
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
      tipoRetorno: inputs.tipoRetorno || '', outroDesc: inputs.tipoRetornoOutroDesc || '', tipos: retorno.tipos,
      manobraOk: !!inputs.manobraRetornoOk,
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
    exigeRetorno ? (!!resultado.retorno.tipoRetorno && (resultado.retorno.tipoRetorno !== 'outro' || !!resultado.retorno.outroDesc)) : true,
    saidaIndepRes ? (saidaIndepRes.largura.atende && saidaIndepRes.altura.atende) : true,
    resultado.distancia.atende,
  ]
  resultado.atendeGeral = checagens.every(Boolean)

  return resultado
}
