// normas/PB/controle_acabamento.js — NT 09/2024 CBMPB (Controle de Materiais
// de Acabamento e Revestimento — CMAR), Tabela B.1. Fonte do seed da linha
// ('PB','controle_acabamento') do Supabase.
//
// Transcrito do item 9 do formulário do Memorial Descritivo do CBMPB, que
// reproduz as três linhas da Tabela B.1 (memorial_formulario.js,
// CMAR_LINHAS). Mesmo formato do MA: conjunto explícito de classes por
// elemento; chave = divisão exata ou letra do grupo. Notas da tabela ainda
// não transcritas.

const FACHADA = ['I', 'II-A', 'II-B']   // "Classe I a II-B"

// Ocupação A e condomínio residencial.
const LINHA_A = {
  piso:    ['I', 'II-A', 'III-A', 'IV-A'],
  parede:  ['I', 'II-A', 'III-A'],
  teto:    ['I', 'II-A', 'III-A'],
  fachada: FACHADA,
}
// B, D, E, G, H, I-1, J-1, J-2 — e C, F, I-2, I-3, J-3, J-4, L-1, M-2, M-3
// (as duas linhas têm as mesmas classes no formulário).
const LINHA_DEMAIS = {
  piso:    ['I', 'II-A', 'III-A', 'IV-A'],
  parede:  ['I', 'II-A'],
  teto:    ['I', 'II-A'],
  fachada: FACHADA,
}

export const TABELA_B1 = {
  'A': LINHA_A,
  'B': LINHA_DEMAIS, 'D': LINHA_DEMAIS, 'E': LINHA_DEMAIS, 'G': LINHA_DEMAIS, 'H': LINHA_DEMAIS,
  'I-1': LINHA_DEMAIS, 'J-1': LINHA_DEMAIS, 'J-2': LINHA_DEMAIS,
  'C': LINHA_DEMAIS, 'F': LINHA_DEMAIS,
  'I-2': LINHA_DEMAIS, 'I-3': LINHA_DEMAIS, 'J-3': LINHA_DEMAIS, 'J-4': LINHA_DEMAIS,
  'L-1': LINHA_DEMAIS, 'M-2': LINHA_DEMAIS, 'M-3': LINHA_DEMAIS,
}

export const NOTAS = {}

export const NORMA = { numero: 'NT 09/2024', nome: 'Controle de Materiais de Acabamento e Revestimento — CBMPB' }
