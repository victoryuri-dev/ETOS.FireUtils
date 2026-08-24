// normas/MA/controle_acabamento.js — NT 10/2021 CBMMA (Controle de Material
// de Acabamento e Revestimento — CMAR), Anexo B, Tabela B.1 ("Classe dos
// materiais a serem utilizados considerando o Grupo/Divisão da
// ocupação/uso em função da finalidade do material").
//
// Cada entrada é o CONJUNTO EXPLÍCITO de classes admitidas por elemento —
// não um limiar único: a tabela às vezes aceita a variante A de uma classe
// mais restritiva (ex.: III-A) sem aceitar a variante B de uma classe menos
// restritiva (ex.: II-B), por causa do critério de produção de fumaça. Ver
// resultadoLinha em cmar_calc.js — a comparação é sempre "a classe do
// material está nesta lista?", nunca "é numericamente menor ou igual".
//
// Chaves de TABELA_B1: divisão exata (ex.: 'C-1') quando a tabela distingue
// divisões dentro do grupo, ou só a letra do grupo (ex.: 'B') quando a
// tabela trata o grupo inteiro igual — ver linhaDivisao em cmar_calc.js
// (mesma convenção de busca "divisão exata → grupo" de normas/index.js).

// Fachada: "Classe I a II-B" — mesma faixa para todas as divisões desta
// tabela (não varia por grupo).
const FACHADA_PADRAO = ['I', 'II-A', 'II-B']

// Linha 1 da Tabela B.1 — A-3 e Condomínios Residenciais (nota 5).
// PENDENTE: "Condomínios Residenciais" não tem código de divisão próprio
// no classificador deste app — confirmar com qual(is) divisão(ões) essa
// linha deve ser associada além de A-3 antes de aplicar automaticamente.
const LINHA_A3_CONDOMINIOS = {
  piso:    ['I', 'II-A', 'III-A', 'IV-A', 'V-A'], // nota 7
  parede:  ['I', 'II-A', 'III-A', 'IV-A'],        // nota 8
  teto:    ['I', 'II-A', 'III-A'],                // nota 6
  fachada: FACHADA_PADRAO,
}

// Linha 2 da Tabela B.1 — B, D, E, G, H, I-1, J-1 (nota 4), J-2, C-1,
// F-1, F-2, F-3, F-4, F-6, F-8, F-9, F-10.
const LINHA_INTERMEDIARIA = {
  piso:    ['I', 'II-A', 'III-A', 'IV-A'],
  parede:  ['I', 'II-A', 'III-A'], // nota 9
  teto:    ['I', 'II-A'],
  fachada: FACHADA_PADRAO,
}

// Linha 3 da Tabela B.1 — C-2, C-3, F-5, F-7, F-11, I-2, I-3, J-3, J-4,
// L-1, M-2 (nota 3), M-3.
const LINHA_RESTRITIVA = {
  piso:    ['I', 'II-A', 'III-A', 'IV-A'],
  parede:  ['I', 'II-A'],
  teto:    ['I', 'II-A'],
  fachada: FACHADA_PADRAO,
}

// PENDENTE: a Tabela B.1 não traz colunas de "cobertura" nem "isolamento
// térmico acústico" — não há, por ora, tabela normativa equivalente para
// esses dois elementos do Quadro Resumo (memorial). Nenhuma linha abaixo
// define `cobertura`/`isolamento` — ficam "sem dado normativo" até uma
// referência normativa ser informada.
export const TABELA_B1 = {
  'A-3': LINHA_A3_CONDOMINIOS,

  'B': LINHA_INTERMEDIARIA,
  'D': LINHA_INTERMEDIARIA,
  'E': LINHA_INTERMEDIARIA,
  'G': LINHA_INTERMEDIARIA,
  'H': LINHA_INTERMEDIARIA,
  'I-1':  LINHA_INTERMEDIARIA,
  'J-1':  LINHA_INTERMEDIARIA, // nota 4
  'J-2':  LINHA_INTERMEDIARIA,
  'C-1':  LINHA_INTERMEDIARIA,
  'F-1':  LINHA_INTERMEDIARIA,
  'F-2':  LINHA_INTERMEDIARIA,
  'F-3':  LINHA_INTERMEDIARIA,
  'F-4':  LINHA_INTERMEDIARIA,
  'F-6':  LINHA_INTERMEDIARIA,
  'F-8':  LINHA_INTERMEDIARIA,
  'F-9':  LINHA_INTERMEDIARIA,
  'F-10': LINHA_INTERMEDIARIA,

  'C-2':  LINHA_RESTRITIVA,
  'C-3':  LINHA_RESTRITIVA,
  'F-5':  LINHA_RESTRITIVA,
  'F-7':  LINHA_RESTRITIVA,
  'F-11': LINHA_RESTRITIVA,
  'I-2':  LINHA_RESTRITIVA,
  'I-3':  LINHA_RESTRITIVA,
  'J-3':  LINHA_RESTRITIVA,
  'J-4':  LINHA_RESTRITIVA,
  'L-1':  LINHA_RESTRITIVA,
  'M-2':  LINHA_RESTRITIVA, // nota 3
  'M-3':  LINHA_RESTRITIVA,
}

// PENDENTE: texto das "Notas específicas" da Tabela B.1 (marcadas ¹ a ⁹ no
// Anexo B) ainda não recebido — os comentários acima já indicam a qual
// célula cada número se refere. Preencher aqui assim que o texto das notas
// for informado, para o memorial poder citá-las junto do resultado.
export const NOTAS = {
  1: null, // cabeçalho da coluna "Piso (Acabamento¹/Revestimento)"
  2: null, // cabeçalho da coluna "Parede e Divisória (Acabamento²/Revestimento)"
  3: null, // divisão M-2
  4: null, // divisão J-1
  5: null, // "A-3 e Condomínios Residenciais"
  6: null, // Linha 1 (A-3/Condomínios), Teto
  7: null, // Linha 1 (A-3/Condomínios), Piso
  8: null, // Linha 1 (A-3/Condomínios), Parede
  9: null, // Linha 2 (intermediária), Parede
}

export const NORMA = { numero: 'NT 10/2021', nome: 'Controle de Material de Acabamento e Revestimento — CBMMA' }
