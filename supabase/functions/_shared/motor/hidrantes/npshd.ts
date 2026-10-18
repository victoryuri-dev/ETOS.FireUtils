// NPSH disponível na tubulação de sucção. Porte de
// Fire Utils.tab/lib/hidrantes/npshd.py.
//
// Só é exigido quando a condição de sucção é NEGATIVA. Com Hs negativo
// (nível de água abaixo da sucção da bomba) a fórmula operacional é:
//
//   NPSHd = Ha − Hvp − |Hs| − Hf,s
//
// Hf,s sai do mesmo Hazen-Williams do resto do cálculo, aplicado ao trecho de
// sucção com a vazão majorada (fator normativo, vem do perfil do estado).
//
// Entrega só o NPSH disponível — o NPSH requerido é dado de catálogo do
// fabricante da bomba, fora do escopo.

// Propriedades físicas da água e da atmosfera (não normativas).
const TABELA_HA: Array<[number, number]> = [
  [0, 10.33],
  [500, 9.72],
  [1000, 9.15],
  [1500, 8.61],
]

const TABELA_HVP: Array<[number, number]> = [
  [10, 0.125],
  [15, 0.174],
  [20, 0.239],
  [25, 0.323],
  [30, 0.433],
  [35, 0.573],
  [40, 0.752],
]

export const ALTITUDE_PADRAO = 0
export const TEMPERATURA_PADRAO = 30

function busca(tabela: Array<[number, number]>, chave: number): number | null {
  for (const [k, v] of tabela) if (k === chave) return v
  return null
}

export interface ResultadoNpshd {
  altitude_m: number
  temperatura_c: number
  Ha: number
  Hvp: number
  Hs_abs: number
  Hf_s: number
  NPSHd: number
}

export function calcularNpshd(
  altitudeM: number,
  temperaturaC: number,
  hsAbsM: number,
  hfSMca: number,
): ResultadoNpshd {
  const ha = busca(TABELA_HA, altitudeM)
  const hvp = busca(TABELA_HVP, temperaturaC)

  if (ha === null) throw new Error(`Altitude ${altitudeM} m não está na tabela de pressão atmosférica.`)
  if (hvp === null) throw new Error(`Temperatura ${temperaturaC} °C não está na tabela de pressão de vapor.`)

  const hsAbs = Math.abs(hsAbsM)
  const hfS = hfSMca
  const npshd = ha - hvp - hsAbs - hfS

  return {
    altitude_m: altitudeM,
    temperatura_c: temperaturaC,
    Ha: ha,
    Hvp: hvp,
    Hs_abs: hsAbs,
    Hf_s: hfS,
    NPSHd: npshd,
  }
}
