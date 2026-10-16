// normas/PB/trrf.js — NT 08/2024 CBMPB, Segurança Estrutural contra
// Incêndio, Anexo B (TRRF por divisão × altura da edificação e profundidade
// do subsolo). Fonte do seed da linha ('PB','trrf') do Supabase — o site não
// lê este arquivo. Transcrito das imagens do Anexo B enviadas pelo usuário.
//
// Mesmo formato do MA (normas/MA/trrf.js). "ver item A.2.3.3/A.2.3.4" ocupa
// as colunas P1 e P2 na tabela da PB (F-3/F-4/F-7 e J-1); "-" = null.
//
// ⚠ Notas, divisões de subsolo sem ocupação e metodologias por material: o
// usuário não enviou o texto da NT 08 — textos do MA adaptados (sem número
// de item), a conferir.

export const NORMA = { sigla: 'NT 08/2024 CBMPB', orgaoAnalise: 'CBMPB', itemNaoRegressao: null, terminologia: null }

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

export const CLASSES_SUBSOLO = [
  { classe: 'S1', min: 0,  max: 10 },
  { classe: 'S2', min: 10, max: Infinity },
]

const L = (grupo, divisoes, [s2, s1], [p1, p2, p3, p4, p5, p6, p7, p8], extra = {}) =>
  ({ grupo, divisoes, ...extra, s2, s1, p1, p2, p3, p4, p5, p6, p7, p8 })
const _ = null

export const TABELA_TRRF = [
  L('A', ['A-1', 'A-2', 'A-3'],             [90, 60], [30, 30, 60, 90, 120, 120, 150, 180]),
  L('B', ['B-1', 'B-2'],                    [90, 60], [30, 60, 60, 90, 120, 150, 180, 180]),
  L('C', ['C-1'],                           [90, 60], [60, 60, 60, 90, 120, 150, 150, 180]),
  L('C', ['C-2', 'C-3'],                    [90, 60], [60, 60, 60, 90, 120, 150, 150, 180]),
  L('D', ['D-1', 'D-2', 'D-3', 'D-4'],      [90, 60], [30, 60, 60, 90, 120, 120, 150, 180]),
  L('E', ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6'], [90, 60], [30, 30, 60, 90, 120, 120, 150, 180]),
  L('F', ['F-1', 'F-2', 'F-5', 'F-6', 'F-8', 'F-10', 'F-11'], [90, 60], [60, 60, 60, 90, 120, 150, 180, _]),
  L('F', ['F-3', 'F-4', 'F-7'],             [90, 60], ['A.2.3.3', 'A.2.3.3', 30, 60, 60, 90, 120, _]),
  L('F', ['F-9'],                           [90, 60], [30, 60, 60, 90, 120, _, _, _]),
  L('G', ['G-1', 'G-2', 'G-3', 'G-4', 'G-5'], [90, 60], [30, 60, 60, 90, 120, 120, 150, 180], { nota: 'nao_abertos_lateralmente' }),
  L('G', ['G-1', 'G-2'],                    [90, 60], [30, 30, 30, 30, 60, 120, 120, 150], { nota: 'abertos_lateralmente' }),
  L('H', ['H-1', 'H-4'],                    [90, 60], [30, 60, 60, 90, 120, 150, 180, 180]),
  L('H', ['H-2', 'H-3', 'H-5', 'H-6'],      [90, 60], [30, 60, 60, 90, 120, 150, 180, 180]),
  L('I', ['I-1'],                           [90, 60],  [30, 30, 30, 60, 120, _, _, _]),
  L('I', ['I-2'],                           [120, 90], [30, 30, 60, 90, 120, _, _, _]),
  L('I', ['I-3'],                           [120, 90], [60, 60, 90, 120, 120, _, _, _]),
  L('J', ['J-1'],                           [60, 30],  ['A.2.3.4', 'A.2.3.4', 30, 30, 60, _, _, _]),
  L('J', ['J-2'],                           [90, 60],  [60, 60, 60, 60, 60, _, _, _]),
  L('J', ['J-3'],                           [90, 60],  [60, 60, 60, 120, 120, _, _, _]),
  L('J', ['J-4'],                           [120, 90], [60, 60, 90, 120, 120, _, _, _]),
  L('K', ['K-1'],                           [120, 90], [90, 90, 120, 120, 120, 150, _, _]),
  L('L', ['L-1', 'L-2', 'L-3'],             [120, 120], [120, _, _, _, _, _, _, _]),
  L('M', ['M-1'],                           [150, 150], [150, _, _, _, _, _, _, _]),
  L('M', ['M-2'],                           [_, _],     [120, 120, _, _, _, _, _, _]),
  L('M', ['M-5'],                           [120, 90],  [60, 60, 90, 120, _, _, _, _]),
  L('M', ['M-3'],                           [120, 90],  [90, 90, 120, 120, 120, 150, _, _]),
]

// ⚠ Textos do MA adaptados, a conferir com a NT 08/2024.
export const NOTAS_ANEXO_B = {
  naoEnquadrado:     'Anexo B da NT 08/2024 CBMPB — casos não enquadrados na tabela serão definidos pelo Corpo de Bombeiros.',
  naoRegressao:      'NT 08/2024 CBMPB — o TRRF dos subsolos e sobressolos não pode ser inferior ao TRRF dos pavimentos situados acima do solo.',
  industriaDeposito: 'Anexo B — para indústria ou depósito com inflamáveis, considerar as divisões I-3 e J-4, respectivamente.',
  alturaEdificacao:  'Altura da edificação: do piso de descarga ao piso do último pavimento habitado, excluindo áticos, casas de máquinas, barrilete e reservatórios. Quando o subsolo tiver ocupação diferente de estacionamento de veículos, vestiário ou instalação sanitária sem uso ou permanência humana, a medição passa a partir do piso do subsolo mais baixo ocupado.',
}

// ⚠ Do MA.
export const DIVISOES_SEM_OCUPACAO_SUBSOLO = ['G-1']

export const METODOLOGIA_POR_MATERIAL = {
  'Concreto armado':     { norma: 'ABNT NBR 15200', metodologia: 'método tabular do tempo requerido de resistência ao fogo (TRRF) para estruturas de concreto' },
  'Estrutura metalica':  { norma: 'ABNT NBR 14432 / NBR 15200', metodologia: 'dimensionamento em situação de incêndio com determinação da temperatura crítica dos elementos metálicos, podendo ser adotado revestimento contra fogo (TRF) quando necessário' },
  'Alvenaria estrutural':{ norma: 'ABNT NBR 15575 / NBR 14432', metodologia: 'verificação da resistência ao fogo dos elementos de alvenaria estrutural conforme ensaios ou método tabular aplicável' },
  'Madeira':             { norma: 'ABNT NBR 7190', metodologia: 'método do tempo de carbonização para dimensionamento de elementos estruturais de madeira em situação de incêndio' },
}
