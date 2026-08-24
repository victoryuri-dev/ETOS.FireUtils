// normas/MA/controle_acabamento.js — NT 10/2021 CBMMA (Controle de Material
// de Acabamento e Revestimento — CMAR).
//
// PENDENTE: os valores de TABELA_B1 e ROTAS_FUGA abaixo ainda não foram
// preenchidos com os dados reais do Anexo B da NT 10/2021 CBMMA — só a
// ESTRUTURA do arquivo está pronta. Nunca preencha uma classe aqui "de
// memória" ou por estimativa: transcreva exatamente o que a tabela vigente
// da norma indicar para cada divisão/elemento, citando o item/tabela em
// NOTAS. Enquanto uma chave não tiver valor, o cálculo (cmar_calc.js) trata
// a exigência como "sem dado normativo" e a tela/memorial sinalizam a
// pendência em vez de assumir qualquer classe.
//
// Formato de TABELA_B1 (mesma convenção usada em normas/MA/trrf.js para o
// Anexo B da NT 01): chave = código da divisão (ex: 'D-1', 'E-1', 'J-3');
// valor = classe máxima admitida por elemento construtivo. Uma divisão sem
// entrada aqui é tratada como "sem dado normativo cadastrado" — não como
// "sem exigência".
//
// Exemplo de como preencher (NÃO é dado real — apagar ao inserir a tabela
// vigente):
//   'D-1': { piso: 'IV-A', parede: 'III-A', teto: 'II-A', fachada: 'III-A', cobertura: 'II-A' },
export const TABELA_B1 = {
  // 'D-1': { piso: null, parede: null, teto: null, fachada: null, cobertura: null },
}

// Classes máximas admitidas para as rotas de fuga (item 10 da NT 10/2021
// CBMMA) — mais restritivas que as de um ambiente comum, aplicam-se a
// corredores protegidos/acessos às saídas enclausuradas e a escadas/rampas,
// independente da divisão dos ambientes que elas atendem.
export const ROTAS_FUGA = {
  corredorProtegido: null, // PENDENTE — preencher com a classe do item 10
  escadaRampa:        null, // PENDENTE — preencher com a classe do item 10
}

// Citação (item/tabela da NT) de cada entrada de TABELA_B1/ROTAS_FUGA, para
// o memorial referenciar a fonte normativa junto do resultado. Chave = mesma
// chave usada em TABELA_B1 (ex: 'D-1.piso') ou 'rotaFuga.corredorProtegido'.
export const NOTAS = {}

export const NORMA = { numero: 'NT 10/2021', nome: 'Controle de Material de Acabamento e Revestimento — CBMMA' }
