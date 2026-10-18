// Lances e tipo de mangueira do sistema de hidrantes — informados na página
// de hidrantes (comum aos estados, state.hidrantes) e usados no memorial do
// MA e no item 17.2 do formulário da PB.
export const LANCES_INTERNOS = [['1x30', 'Um lance de 30m'], ['2x15', 'Dois lances de 15m']]
// Externos: "não se aplica" não marca nada no formulário.
export const NAO_SE_APLICA = 'nao_aplica'
export const LANCES_EXTERNOS = [['2x30', 'Dois lances de 30m'], ['4x15', 'Quatro lances de 15m']]
export const TIPOS_MANGUEIRA = [['1', 'Mangueira 1'], ['2', 'Mangueira 2'], ['3', 'Mangueira 3'], ['4', 'Mangueira 4'], ['5', 'Mangueira 5']]

// Tipos de mangueira (NBR 11861) que o tipo de sistema admite — a chave é
// COMPONENTES_POR_TIPO[tipo].mangueiraIncendio (Tabela 4). Sem mangueira de
// incêndio (Tipo 1, mangotinho), nenhum.
const PERMITIDOS = { tipo1_residencial_ou_tipo2: ['1', '2'], tipo2_3_4_ou_5: ['2', '3', '4', '5'] }
export const tiposMangueiraPermitidos = mangueiraIncendio => TIPOS_MANGUEIRA.filter(([k]) => (PERMITIDOS[mangueiraIncendio] || []).includes(k))

const rotulo = (lista, key) => lista.find(([k]) => k === key)?.[1] || ''
export const rotuloLancesInternos = key => rotulo(LANCES_INTERNOS, key)
export const rotuloLancesExternos = key => (key === NAO_SE_APLICA ? 'Não se aplica' : rotulo(LANCES_EXTERNOS, key))
export const rotuloTipoMangueira = key => (key ? `Tipo ${key} (NBR 11861)` : '')

/** Tipo de mangueira adotado, se o tipo de sistema o admite (senão ''). */
export const tipoMangueiraValido = (mangueiraTipo, mangueiraIncendio) =>
  (tiposMangueiraPermitidos(mangueiraIncendio).some(([k]) => k === mangueiraTipo) ? mangueiraTipo : '')
