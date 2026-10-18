// normas/PB/validade_inspecao.js — NT 02/2023 CBMPB, Anexo B (Tabela de
// prazos de validade das inspeções realizadas pelo CBMPB). Fonte do seed da
// linha ('PB','validade_inspecao') do Supabase.
//
// Risco e validade (anos) por divisão. F-3 é a única divisão com dois casos:
// estádio de futebol (alto, 1 ano) e demais centros esportivos (médio, 2 anos).

export const NORMA = {
  numero: 'NT 02/2023',
  nome: 'Classificação das Edificações e Áreas de Riscos — Anexo B: prazos de validade das inspeções do CBMPB',
}

const BAIXO = { risco: 'baixo', validadeAnos: 5 }
const MEDIO = { risco: 'medio', validadeAnos: 2 }
const ALTO  = { risco: 'alto',  validadeAnos: 1 }

const grupo = (divisoes, valor) => Object.fromEntries(divisoes.map(d => [d, valor]))

export const TABELA_ANEXO_B = {
  ...grupo(['A-1', 'A-2', 'A-3'], BAIXO),
  ...grupo(['B-1', 'B-2'], MEDIO),
  'C-1': BAIXO, 'C-2': MEDIO, 'C-3': ALTO,
  ...grupo(['D-1', 'D-2', 'D-3', 'D-4'], MEDIO),
  ...grupo(['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6'], MEDIO),
  ...grupo(['F-1', 'F-2'], MEDIO),
  'F-3': { ...MEDIO, estadioFutebol: ALTO },
  ...grupo(['F-4', 'F-5', 'F-6'], MEDIO),
  'F-7': ALTO, 'F-8': MEDIO,
  ...grupo(['F-9', 'F-10'], MEDIO),
  'F-11': ALTO,
  ...grupo(['G-1', 'G-2', 'G-3', 'G-4', 'G-5'], MEDIO),
  ...grupo(['H-1', 'H-2'], MEDIO), 'H-3': ALTO, ...grupo(['H-4', 'H-5', 'H-6'], MEDIO),
  'I-1': BAIXO, 'I-2': MEDIO, 'I-3': ALTO,
  ...grupo(['J-1', 'J-2'], BAIXO), 'J-3': MEDIO, 'J-4': ALTO,
  'K-1': MEDIO,
  'L-1': MEDIO, ...grupo(['L-2', 'L-3', 'L-4'], ALTO),
  ...grupo(['M-1', 'M-2', 'M-3', 'M-4', 'M-5', 'M-6', 'M-7'], MEDIO),
}
