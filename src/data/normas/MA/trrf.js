// normas/MA/trrf.js — NT 01 CBMMA, Anexo B (Tempos Requeridos de Resistência
// ao Fogo — TRRF), para a classificação detalhada das ocupações (grupo e
// divisão) por altura da edificação e profundidade do subsolo.
//
// ATENÇÃO: a tabela abaixo foi transcrita manualmente a partir do Anexo B.
// Por se tratar de dado que alimenta um memorial assinado por RT, confira
// os valores contra o documento original antes de usar em um projeto real —
// especialmente as linhas com "-" (combinação não coberta) ou "ver item X"
// (grupos F e J), que têm colunas irregulares.

// ── Classes de altura da edificação (colunas P1-P8) ─────────────────────────
export const CLASSES_ALTURA = [
  { classe: 'P1', min: 0,   max: 6   },
  { classe: 'P2', min: 6,   max: 12  },
  { classe: 'P3', min: 12,  max: 23  },
  { classe: 'P4', min: 23,  max: 30  },
  { classe: 'P5', min: 30,  max: 80  },
  { classe: 'P6', min: 80,  max: 120 },
  { classe: 'P7', min: 120, max: 150 },
  { classe: 'P8', min: 150, max: 250 },
]

// ── Classes de profundidade do subsolo (colunas S1/S2) ──────────────────────
export const CLASSES_SUBSOLO = [
  { classe: 'S1', min: 0,  max: 10 },
  { classe: 'S2', min: 10, max: Infinity },
]

// Marcadores especiais usados na tabela no lugar de um valor em minutos:
//  - null        → combinação grupo/divisão × classe não coberta pelo Anexo B
//                  (nota 1: casos não enquadrados são definidos pelo SSCI do CBMMA)
//  - 'A.2.3.3'   → grupo F-3/F-4/F-7, classe P1: consultar item A.2.3.3 do Anexo A
//  - 'A.2.3.4'   → divisão J-1, classe P1: consultar item A.2.3.4 do Anexo A

// ── Tabela TRRF (Anexo B) ───────────────────────────────────────────────────
// Cada linha cobre um conjunto de divisões (algumas linhas da tabela oficial
// agrupam mais de uma divisão com os mesmos valores). `s2`/`s1` = subsolo;
// `p1`..`p8` = acima do solo.
export const TABELA_TRRF = [
  { grupo: 'A', divisoes: ['A-1', 'A-2', 'A-3'],
    s2: 90, s1: 60, p1: 30, p2: 30, p3: 60, p4: 90, p5: 120, p6: 120, p7: 150, p8: 180 },

  { grupo: 'B', divisoes: ['B-1', 'B-2'],
    s2: 90, s1: 60, p1: 30, p2: 60, p3: 60, p4: 90, p5: 120, p6: 150, p7: 180, p8: 180 },

  { grupo: 'C', divisoes: ['C-1', 'C-2', 'C-3'],
    s2: 90, s1: 60, p1: 60, p2: 60, p3: 60, p4: 90, p5: 120, p6: 150, p7: 150, p8: 180 },

  { grupo: 'D', divisoes: ['D-1', 'D-2', 'D-3', 'D-4'],
    s2: 90, s1: 60, p1: 30, p2: 60, p3: 60, p4: 90, p5: 120, p6: 120, p7: 150, p8: 180 },

  { grupo: 'E', divisoes: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6'],
    s2: 90, s1: 60, p1: 30, p2: 30, p3: 60, p4: 90, p5: 120, p6: 150, p7: 150, p8: 180 },

  // Grupo F — Locais de reunião de público (3 sub-linhas, ver notas do Anexo B)
  { grupo: 'F', divisoes: ['F-1', 'F-2', 'F-5', 'F-6', 'F-8', 'F-10', 'F-11'],
    s2: 90, s1: 60, p1: 60, p2: 60, p3: 60, p4: 90, p5: 120, p6: 150, p7: 180, p8: null },
  { grupo: 'F', divisoes: ['F-3', 'F-4', 'F-7'],
    s2: 90, s1: 60, p1: 'A.2.3.3', p2: 30, p3: 60, p4: 60, p5: 90, p6: 120, p7: null, p8: null },
  { grupo: 'F', divisoes: ['F-9'],
    s2: 90, s1: 60, p1: 30, p2: 60, p3: 90, p4: 120, p5: null, p6: null, p7: null, p8: null },

  // Grupo G — Serviços automotivos (2 sub-linhas)
  { grupo: 'G', divisoes: ['G-1', 'G-2', 'G-3', 'G-4', 'G-5'],
    nota: 'nao_abertos_lateralmente', // G-1/G-2 não abertos lateralmente + G-3 a G-5
    s2: 90, s1: 60, p1: 30, p2: 60, p3: 60, p4: 90, p5: 120, p6: 120, p7: 150, p8: 180 },
  { grupo: 'G', divisoes: ['G-1', 'G-2'],
    nota: 'abertos_lateralmente',
    s2: 90, s1: 60, p1: 30, p2: 30, p3: 30, p4: 60, p5: 90, p6: 120, p7: null, p8: 150 },

  // Grupo H — Serviços de saúde e institucionais (2 sub-linhas)
  { grupo: 'H', divisoes: ['H-1', 'H-4'],
    s2: 90, s1: 60, p1: 30, p2: 30, p3: 30, p4: 60, p5: 120, p6: 150, p7: 180, p8: 180 },
  { grupo: 'H', divisoes: ['H-2', 'H-3', 'H-5', 'H-6'],
    s2: 90, s1: 60, p1: 30, p2: 60, p3: 60, p4: 90, p5: 120, p6: 150, p7: 180, p8: 180 },

  // Grupo I — Industrial
  { grupo: 'I', divisoes: ['I-1'],
    s2: 90,  s1: 60, p1: 30, p2: 30, p3: 30, p4: 60,  p5: 120, p6: null, p7: null, p8: null },
  { grupo: 'I', divisoes: ['I-2'],
    s2: 120, s1: 90, p1: 30, p2: 30, p3: 60, p4: 90,  p5: 120, p6: null, p7: null, p8: null },
  { grupo: 'I', divisoes: ['I-3'],
    s2: 120, s1: 90, p1: 60, p2: 60, p3: 90, p4: 120, p5: 120, p6: null, p7: null, p8: null },

  // Grupo J — Depósitos
  { grupo: 'J', divisoes: ['J-1'],
    s2: 60,  s1: 30, p1: 'A.2.3.4', p2: 30, p3: 30, p4: 60,  p5: 60,  p6: null, p7: null, p8: null },
  { grupo: 'J', divisoes: ['J-2'],
    s2: 90,  s1: 60, p1: 30,       p2: 30, p3: 60, p4: 60,  p5: null, p6: null, p7: null, p8: null },
  { grupo: 'J', divisoes: ['J-3'],
    s2: 90,  s1: 60, p1: 60,       p2: 60, p3: 60, p4: 120, p5: 120,  p6: null, p7: null, p8: null },
  { grupo: 'J', divisoes: ['J-4'],
    s2: 120, s1: 90, p1: 60,       p2: 60, p3: 90, p4: 120, p5: null, p6: null, p7: null, p8: null },

  // Grupo L — Explosivos
  { grupo: 'L', divisoes: ['L-1', 'L-2', 'L-3'],
    s2: 120, s1: 120, p1: 120, p2: null, p3: null, p4: null, p5: null, p6: null, p7: null, p8: null },

  // Grupo M — Especial
  { grupo: 'M', divisoes: ['M-1'],
    s2: 150, s1: 150,  p1: 150, p2: null, p3: null, p4: null, p5: null,  p6: null, p7: null, p8: null },
  { grupo: 'M', divisoes: ['M-2'],
    s2: 120, s1: null, p1: 120, p2: 120,  p3: null, p4: null, p5: null,  p6: null, p7: null, p8: null },
  { grupo: 'M', divisoes: ['M-5'],
    s2: 120, s1: 90,   p1: 60,  p2: 60,   p3: 90,   p4: 120,  p5: 120,   p6: null, p7: null, p8: null },
  { grupo: 'M', divisoes: ['M-3'],
    s2: 120, s1: 90,   p1: 90,  p2: 90,   p3: 90,   p4: 120,  p5: 120,   p6: 120,  p7: 150,  p8: null },

  // Grupo K — Energia
  { grupo: 'K', divisoes: ['K-1'],
    s2: 120, s1: 90, p1: 90, p2: 90, p3: 90, p4: 120, p5: 120, p6: 120, p7: 150, p8: null },
]

export const NOTAS_ANEXO_B = {
  naoEnquadrado:      'Nota 1, Anexo B da NT 01 CBMMA — casos não enquadrados na tabela serão definidos pelo SSCI do Corpo de Bombeiros.',
  naoRegressao:        'Item 5.12 da NT 01 CBMMA — o TRRF dos subsolos e sobressolos não pode ser inferior ao TRRF dos pavimentos situados acima do solo.',
  industriaDeposito:  'Nota 3, Anexo B — para indústria ou depósito com inflamáveis, considerar as divisões I-3 e J-4, respectivamente.',
  alturaEdificacao:   'Item 4.31, NT 03 CBMMA (Terminologia) — altura da edificação: do piso de descarga ao piso do último pavimento habitado, excluindo áticos, casas de máquinas, barrilete e reservatórios. Quando o subsolo tiver ocupação diferente de estacionamento de veículos, vestiário ou instalação sanitária sem uso ou permanência humana, a medição passa a partir do piso do subsolo mais baixo ocupado.',
}

// ── Exceção de altura por subsolo ocupado (item 4.31, NT 03 CBMMA) ─────────
// Divisões de subsolo que a norma considera "sem aproveitamento para
// quaisquer atividades ou permanência humana" — estacionamento de veículos.
// Qualquer outra divisão num pavimento de subsolo aciona a exceção: a altura
// da edificação usada para classificar o TRRF acima do solo passa a somar a
// profundidade do subsolo (ver `alturaParaClassificacao` em trrf_calc.js).
export const DIVISOES_SEM_OCUPACAO_SUBSOLO = ['G-1']

// ── Metodologia normativa por material estrutural ──────────────────────────
// Usado só para decidir qual metodologia de comprovação citar no memorial —
// não recalcula resistência real, que é responsabilidade do projeto estrutural.
export const METODOLOGIA_POR_MATERIAL = {
  'Concreto armado':     { norma: 'ABNT NBR 15200', metodologia: 'método tabular do tempo requerido de resistência ao fogo (TRRF) para estruturas de concreto' },
  'Estrutura metalica':  { norma: 'ABNT NBR 14432 / NBR 15200', metodologia: 'dimensionamento em situação de incêndio com determinação da temperatura crítica dos elementos metálicos, podendo ser adotado revestimento contra fogo (TRF) quando necessário' },
  'Alvenaria estrutural':{ norma: 'ABNT NBR 15575 / NBR 14432', metodologia: 'verificação da resistência ao fogo dos elementos de alvenaria estrutural conforme ensaios ou método tabular aplicável' },
  'Madeira':             { norma: 'ABNT NBR 7190', metodologia: 'método do tempo de carbonização para dimensionamento de elementos estruturais de madeira em situação de incêndio' },
}
