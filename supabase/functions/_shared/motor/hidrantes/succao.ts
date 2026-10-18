// Verificação da CONDIÇÃO DE SUCÇÃO pelo método direto de diferença de cotas
// (conservador). Porte de Fire Utils.tab/lib/hidrantes/succao.py.
//
//   ∆H_succao = cota_RTI − cota_succao_bomba
//   ∆H_succao ≥ 0  → sucção POSITIVA (RTI na cota igual ou acima da sucção)
//   ∆H_succao <  0 → sucção NEGATIVA; |Hs| = cota_succao_bomba − cota_RTI
//
// Sucção negativa aciona o cálculo de NPSH disponível (npshd.ts), com a vazão
// nominal do sistema majorada pelo fator normativo.

// Default geral; o perfil do estado ativo (npshd_fator_vazao) tem precedência.
export const FATOR_VAZAO_NPSH = 1.5

export const COND_POSITIVA = 'POSITIVA'
export const COND_NEGATIVA = 'NEGATIVA'

// Folga de 1 mm na comparação de cotas, só para não virar o veredicto por
// ruído de arredondamento quando as duas cotas são, na prática, iguais.
const EPS_M = 0.001

export interface VerifSuccao {
  cota_rti: number
  cota_succao_bomba: number
  dH: number
  hs_abs: number | null
  condicao: string
  justificativa: string
  succao_simples: 'positiva' | 'negativa'
  exige_npsh: boolean
  vazao_npsh_lmin: number | null
  fator_vazao_npsh: number
}

export function succaoSimples(condicao: string): 'positiva' | 'negativa' {
  return condicao === COND_NEGATIVA ? 'negativa' : 'positiva'
}

// Equivalente ao "{:g}" do Python para o fator de majoração (1.5 → "1.5", 2 → "2").
function formatoG(n: number): string {
  return String(Number(n.toPrecision(6)))
}

export function verificarCondicaoSuccao(
  cotaRti: number,
  cotaSuccaoBomba: number,
  qNominalLmin: number | null = null,
  fatorVazaoNpsh = FATOR_VAZAO_NPSH,
): VerifSuccao {
  const dH = cotaRti - cotaSuccaoBomba

  let condicao: string
  let hsAbs: number | null
  let justificativa: string
  if (dH >= -EPS_M) {
    condicao = COND_POSITIVA
    hsAbs = null
    justificativa =
      `Cota da RTI (${cotaRti.toFixed(4)} m) igual ou acima da cota de sucção da ` +
      `bomba (${cotaSuccaoBomba.toFixed(4)} m), com folga de ${dH.toFixed(4)} m — sucção afogada.`
  } else {
    condicao = COND_NEGATIVA
    hsAbs = cotaSuccaoBomba - cotaRti
    justificativa =
      `Cota da RTI (${cotaRti.toFixed(4)} m) abaixo da cota de sucção da bomba ` +
      `(${cotaSuccaoBomba.toFixed(4)} m) — elevação de ${hsAbs.toFixed(4)} m, exige o cálculo do NPSH ` +
      `disponível, com a vazão nominal do sistema majorada em ${formatoG(fatorVazaoNpsh)}×.`
  }

  const exigeNpsh = condicao === COND_NEGATIVA
  const vazaoNpshLmin = exigeNpsh && qNominalLmin !== null ? fatorVazaoNpsh * qNominalLmin : null

  return {
    cota_rti: cotaRti,
    cota_succao_bomba: cotaSuccaoBomba,
    dH,
    hs_abs: hsAbs,
    condicao,
    justificativa,
    succao_simples: succaoSimples(condicao),
    exige_npsh: exigeNpsh,
    vazao_npsh_lmin: vazaoNpshLmin,
    fator_vazao_npsh: fatorVazaoNpsh,
  }
}
