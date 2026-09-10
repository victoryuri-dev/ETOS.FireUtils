// PB/saida_emergencia.js — Dados normativos de saída de emergência da
// Paraíba — NT 12/2025 CBMPB (Portaria nº 006/2025-GCG, DOE nº 18.289 de
// 12/02/2024), fonte enviada pelo usuário (PDF).
//
// Referência normativa citada pela própria NT 12/2025 (seção 3): Instrução
// Técnica Nº 11/2019 do CBPMESP — mesma referência de base do Maranhão
// (ver MA/saida_emergencia.js). Conferido campo a campo: a Tabela 1 (Anexo
// A, pág. 42) e a Tabela 2 (Anexo B, pág. 44) da NT-PB batem com os
// valores do Maranhão em TODAS as divisões, com uma única exceção: o
// grupo C (Comercial) usa 5 m²/pessoa aqui, contra 3 m²/pessoa no MA.
//
// LARGURAS_MINIMAS.AD/ER usa a regra geral da NT (item 5.4.2: "1,20 m para
// as ocupações em geral") — a NT tem exceções específicas para o Grupo H,
// Divisões H-2 (1,65 m) e H-3 (1,65 m em escadas/acessos, 2,20 m em
// rampas) que o motor de cálculo atual (se_calc.js) não modela por
// ocupação; teto ainda não implementado, dimensionamento de H-2/H-3 na PB
// fica subestimado até isso ser tratado.
export const TAXA_POPULACIONAL = {
  'A-1': { A: null, AD: 60,  ER: 45, PT: 100, obs: '2 pessoas por dormitório',                          notas: ['C']           },
  'A-2': { A: null, AD: 60,  ER: 45, PT: 100, obs: '2 pessoas por dormitório',                          notas: ['C']           },
  'A-3': { A: 4,    AD: 60,  ER: 45, PT: 100, obs: '2 por dormitório + 1 por 4m² de alojamento',        notas: ['C','D']       },
  'B-1': { A: 15,   AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 15m²',                                 notas: ['E','G']       },
  'B-2': { A: 15,   AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 15m²',                                 notas: ['E','G']       },
  'C-1': { A: 5,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 5m²',                                  notas: ['E','J','M']   },
  'C-2': { A: 5,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 5m²',                                  notas: ['E','J','M']   },
  'C-3': { A: 5,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 5m²',                                  notas: ['E','J','M']   },
  'D-1': { A: 7,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['L','N']       },
  'D-2': { A: 7,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['L','N']       },
  'D-3': { A: 7,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['L','N']       },
  'D-4': { A: 7,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['L','N']       },
  'E-1': { A: 1.5,  AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 1,50m² de sala de aula',               notas: ['F','N']       },
  'E-2': { A: 1.5,  AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 1,50m² de sala de aula',               notas: ['F','N']       },
  'E-3': { A: 1.5,  AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 1,50m² de sala de aula',               notas: ['F','N']       },
  'E-4': { A: 1.5,  AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 1,50m² de sala de aula',               notas: ['F','N']       },
  'E-5': { A: 1.5,  AD: 30,  ER: 22, PT: 30,  obs: '1 pessoa por 1,50m² de sala de aula',               notas: ['F','N']       },
  'E-6': { A: 1.5,  AD: 30,  ER: 22, PT: 30,  obs: '1 pessoa por 1,50m² de sala de aula',               notas: ['F','N']       },
  'F-1': { A: 3,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 3m²',                                  notas: ['N']           },
  'F-2': { A: 1,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por m²',                                   notas: ['E','G','N','P','Q'] },
  'F-3': { A: 0.5,  AD: 100, ER: 75, PT: 100, obs: '2 pessoas por m²',                                  notas: ['G','N','P','Q']     },
  'F-4': { A: 3,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 3m²',                                  notas: ['E','J','F','N']     },
  'F-5': { A: 1,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por m²',                                   notas: ['E','G','N','P','Q'] },
  'F-6': { A: 0.5,  AD: 100, ER: 75, PT: 100, obs: '2 pessoas por m²',                                  notas: ['G','N','P','Q']     },
  'F-7': { A: 0.5,  AD: 100, ER: 75, PT: 100, obs: '2 pessoas por m²',                                  notas: ['G','N','P','Q']     },
  'F-8': { A: 1,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por m²',                                   notas: ['E','G','N','P','Q'] },
  'F-9': { A: 0.5,  AD: 100, ER: 75, PT: 100, obs: '2 pessoas por m²',                                  notas: ['G','N','P','Q']     },
  'F-10':{ A: 3,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 3m²',                                  notas: ['N']           },
  'F-11':{ A: 1/3,  AD: 100, ER: 75, PT: 100, obs: '3 pessoas por m²',                                  notas: ['E']           },
  'G-1': { A: null, AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 40 vagas',                             notas: []              },
  'G-2': { A: null, AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 40 vagas',                             notas: []              },
  'G-3': { A: null, AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 40 vagas',                             notas: []              },
  'G-4': { A: 20,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 20m²',                                 notas: ['E']           },
  'G-5': { A: 20,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 20m²',                                 notas: ['E']           },
  'H-1': { A: 7,    AD: 60,  ER: 45, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['E']           },
  'H-2': { A: 4,    AD: 30,  ER: 22, PT: 30,  obs: '2 por dormitório + 1 por 4m² de alojamento',        notas: ['C','E']       },
  'H-3': { A: null, AD: 30,  ER: 22, PT: 30,  obs: '1,5 por leito + 1 por 7m² de ambulatório',          notas: ['H']           },
  'H-4': { A: 7,    AD: 60,  ER: 45, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['F']           },
  'H-5': { A: 7,    AD: 60,  ER: 45, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['F']           },
  'H-6': { A: 7,    AD: 60,  ER: 45, PT: 100, obs: '1 pessoa por 7m²',                                  notas: ['E']           },
  'I-1': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'I-2': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'I-3': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'J-1': { A: 30,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 30m²',                                 notas: ['J']           },
  'J-2': { A: 30,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 30m²',                                 notas: ['J']           },
  'J-3': { A: 30,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 30m²',                                 notas: ['J']           },
  'J-4': { A: 30,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 30m²',                                 notas: ['J']           },
  'K-1': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'L-1': { A: 3,    AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 3m²',                                  notas: []              },
  'L-2': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'L-3': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'M-1': { A: null, AD: 100, ER: 75, PT: 100, obs: 'Consultar normas e regulamentos específicos',       notas: ['I']           },
  'M-3': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'M-4': { A: 4,    AD: 60,  ER: 45, PT: 100, obs: '1 pessoa por 4m²',                                  notas: []              },
  'M-5': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
}

// ── Notas normativas (Tabela 1, Anexo A) ───────────────────────────────
export const NOTAS_NORMATIVAS = {
  A: '(A) os parâmetros dados nesta tabela são os mínimos aceitáveis para o cálculo da população.',
  B: '(B) as capacidades das unidades de passagem (1 UP = 0,55 m) em escadas e rampas estendem-se para lanços retos e saída descendente.',
  C: '(C) em apartamentos de até 2 dormitórios, a sala deve ser considerada como dormitório; em apartamentos maiores (3 e mais dormitórios), as salas, gabinetes e outras dependências que possam ser usadas como dormitórios (inclusive para empregadas) são consideradas como dormitórios. Em apartamentos mínimos, sem divisões em planta, considera-se uma pessoa para cada 6m² de área de pavimento.',
  D: '(D) alojamento = dormitório coletivo, com mais de 10m².',
  E: '(E) por "Área" entende-se a área do pavimento que abriga a população em foco. Quando discriminado o tipo de área (por ex.: área do alojamento), é a área útil interna da dependência em questão.',
  F: '(F) auditórios e assemelhados em escolas são considerados nos grupos de ocupação F-5, F-6 e outros, conforme o caso.',
  G: '(G) as cozinhas e suas áreas de apoio, nas ocupações B, F-6 e F-8, têm sua ocupação admitida como grupo D, isto é, uma pessoa por 7m² de área.',
  H: '(H) em hospitais e clínicas com internamento (H-3), que tenham pacientes ambulatoriais, acresce-se à área calculada por leito a área de pavimento correspondente ao ambulatório, na base de uma pessoa por 7m².',
  I: '(I) o símbolo "+" indica necessidade de consultar normas e regulamentos específicos (não cobertos por esta NT).',
  J: '(J) a parte de atendimento ao público de comércio atacadista deve ser considerada como do grupo C.',
  K: '(K) esta tabela se aplica a todas as edificações, exceto para os locais destinados às divisões F-3 e F-7 com população total superior a 2.500 pessoas, onde deve ser consultada a norma técnica específica de Centros esportivos e de exibição.',
  L: '(L) para ocupações do tipo Call-center, o cálculo da população é de uma pessoa por 1,5m² de área.',
  M: '(M) para a área de Lojas adota-se no cálculo "uma pessoa por 7m² de área".',
  N: '(N) para o cálculo da população, será admitido o leiaute dos assentos permanentes apresentado em planta.',
  O: '(O) para a classificação das ocupações (grupos e divisões), consultar a tabela 1 da norma técnica específica de Classificação das edificações e áreas de risco e exigências das medidas de segurança contra incêndio e controle de pânico.',
  P: '(P) para a ocupação "restaurante dançante" e "salão de festas" onde há mesas e cadeiras para refeição e pista de dança, o parâmetro para cálculo de população é de 1 pessoa por 0,67m² de área.',
  Q: '(Q) para os locais que possuam assento do tipo banco (assento comprido, para várias pessoas, com ou sem encosto), o parâmetro para cálculo de população é de 1 pessoa por 0,50m linear, mediante apresentação de leiaute.',
}

// ── Larguras mínimas (item 5.4.2 e Anexo A, item III) ──────────────────
export const LARGURAS_MINIMAS = {
  LARG_UP: 0.55,
  AD: 1.20,
  ER: 1.20,
  PT: [
    { n_up: 1, largura: 0.80, tipo: '1 folha'  },
    { n_up: 2, largura: 1.00, tipo: '1 folha'  },
    { n_up: 3, largura: 1.50, tipo: '2 folhas' },
    { n_up: 4, largura: 2.00, tipo: '2 folhas' },
  ],
}

// ── Distâncias máximas (Anexo B, Tabela 2) ─────────────────────────────
// Idêntico ao Maranhão em todas as combinações conferidas — mesma
// referência (IT-11 CBPMESP) — só reagrupado com os códigos I-1..I-3/
// J-1..J-4 (a Tabela 2 da PB diferencia I-1/J-1 de I-2,I-3/J-3,J-4; a
// Tabela 1 só mostra "I" e "J" porque a população não muda entre eles).
const _dist = (sem_su, sem_ms, com_su, com_ms) => ({
  sem_chuveiro: {
    saida_unica: { sem_deteccao: sem_su[0], com_deteccao: sem_su[1] },
    mais_saidas: { sem_deteccao: sem_ms[0], com_deteccao: sem_ms[1] },
  },
  com_chuveiro: {
    saida_unica: { sem_deteccao: com_su[0], com_deteccao: com_su[1] },
    mais_saidas: { sem_deteccao: com_ms[0], com_deteccao: com_ms[1] },
  },
})

export const DISTANCIAS_MAXIMAS = {
  mapa_ocupacao: {
    'A-1': 'AB', 'A-2': 'AB', 'A-3': 'AB',
    'B-1': 'AB', 'B-2': 'AB',
    'C-1': 'CDFG', 'C-2': 'CDFG', 'C-3': 'CDFG',
    'D-1': 'CDFG', 'D-2': 'CDFG', 'D-3': 'CDFG', 'D-4': 'CDFG',
    'E-1': 'CDFG', 'E-2': 'CDFG', 'E-3': 'CDFG', 'E-4': 'CDFG', 'E-5': 'CDFG', 'E-6': 'CDFG',
    'F-1': 'CDFG', 'F-2': 'CDFG', 'F-3': 'CDFG', 'F-4': 'CDFG', 'F-5': 'CDFG',
    'F-6': 'CDFG', 'F-7': 'CDFG', 'F-8': 'CDFG', 'F-9': 'CDFG', 'F-10': 'CDFG', 'F-11': 'CDFG',
    'G-1': 'G1G2J2', 'G-2': 'G1G2J2',
    'G-3': 'CDFG', 'G-4': 'CDFG', 'G-5': 'CDFG',
    'H-1': 'CDFG', 'H-2': 'CDFG', 'H-3': 'CDFG', 'H-4': 'CDFG', 'H-5': 'CDFG', 'H-6': 'CDFG',
    'I-1': 'I1J1',
    'I-2': 'I2I3J3J4', 'I-3': 'I2I3J3J4',
    'J-1': 'G1G2J2',
    'J-2': 'G1G2J2',
    'J-3': 'I2I3J3J4', 'J-4': 'I2I3J3J4',
    'K-1': 'CDFG',
    'L-1': 'CDFG', 'L-2': 'CDFG', 'L-3': 'CDFG',
    'M-1': 'CDFG', 'M-3': 'CDFG', 'M-4': 'CDFG', 'M-5': 'CDFG',
  },
  grupos: {
    AB: {
      descricao: 'A e B',
      terreo: _dist([45,55],[55,65],[60,70],[80,95]),
      demais: _dist([40,45],[50,60],[55,65],[75,90]),
    },
    CDFG: {
      descricao: 'C, D, E, F, G-3, G-4, G-5, H, K, L e M',
      terreo: _dist([40,45],[50,60],[55,65],[75,90]),
      demais: _dist([30,35],[40,45],[45,55],[65,75]),
    },
    I1J1: {
      descricao: 'I-1 e J-1',
      terreo: _dist([80,95],[120,140],[null,null],[null,null]),
      demais: _dist([70,80],[110,130],[null,null],[null,null]),
    },
    G1G2J2: {
      descricao: 'G-1, G-2 e J-2',
      terreo: _dist([50,60],[60,70],[80,95],[120,140]),
      demais: _dist([45,55],[55,65],[70,80],[110,130]),
    },
    I2I3J3J4: {
      descricao: 'I-2, I-3, J-3 e J-4',
      terreo: _dist([40,45],[50,60],[60,70],[100,120]),
      demais: _dist([30,35],[40,45],[50,65],[80,95]),
    },
  },
}
