// ─────────────────────────────────────────────────────────────────────────────
// Dados normativos de Saídas de Emergência — Maranhão
// Fonte: NT 42/2019 CBMMA / NBR 9077
//
// FALLBACK OFFLINE/DEV: a fonte de verdade é a tabela `normas_dados`
// (uf='MA', sistema='saida_emergencia') no Supabase — ver
// supabase/migrations/*normas_dados* e src/lib/normasRemote.js. Este
// arquivo só é usado quando a busca remota ainda não completou ou falha
// (sem rede). Editar a norma? Edite a linha no Supabase, não aqui — este
// arquivo só precisa ser atualizado de vez em quando, pra não ficar
// defasado como fallback.
//
// Funções de cálculo em src/data/se_calc.js
// ─────────────────────────────────────────────────────────────────────────────

// ── Taxa populacional por divisão ─────────────────────────────────────
// A:  m² por pessoa (null = cálculo especial — ver obs / entrada manual)
// AD: capacidade por UP — Acessos e Descargas (pessoas/UP)
// ER: capacidade por UP — Escadas e Rampas (pessoas/UP)
// PT: capacidade por UP — Portas (pessoas/UP)
// notas: chaves de NOTAS_NORMATIVAS
export const TAXA_POPULACIONAL = {
  'A-1': { A: null, AD: 60,  ER: 45, PT: 100, obs: '2 pessoas por dormitório',                          notas: ['C']           },
  'A-2': { A: null, AD: 60,  ER: 45, PT: 100, obs: '2 pessoas por dormitório',                          notas: ['C']           },
  'A-3': { A: 4,    AD: 60,  ER: 45, PT: 100, obs: '2 por dormitório + 1 por 4m² de alojamento',        notas: ['C','D']       },
  'B-1': { A: 15,   AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 15m²',                                 notas: ['E','G']       },
  'B-2': { A: 15,   AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 15m²',                                 notas: ['E','G']       },
  'C-1': { A: 3,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 3m²',                                  notas: ['E','J','M']   },
  'C-2': { A: 3,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 3m²',                                  notas: ['E','J','M']   },
  'C-3': { A: 3,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 3m²',                                  notas: ['E','J','M']   },
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
  'F-4': { A: 3,    AD: 100, ER: 75, PT: 100, obs: '1 pessoa por 3m²',                                  notas: ['E','F','J','N']     },
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
  // M-3/M-4/M-5: valores numéricos adotados do plugin (já em uso real no
  // cálculo Python) no lugar do "consultar norma específica" que só
  // existia aqui. PENDENTE revisar com o CBM-MA — ver "_pendencias" na
  // linha normas_dados no Supabase.
  'M-1': { A: null, AD: 100, ER: 75, PT: 100, obs: 'Consultar NT específica (Túnel)',                   notas: ['I']           },
  'M-2': { A: null, AD: 100, ER: 75, PT: 100, obs: 'Consultar NT específica (Líquido/gás inflamável)',  notas: ['I']           },
  'M-3': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'M-4': { A: 4,    AD: 60,  ER: 45, PT: 100, obs: '1 pessoa por 4m²',                                  notas: []              },
  'M-5': { A: 10,   AD: 100, ER: 60, PT: 100, obs: '1 pessoa por 10m²',                                 notas: []              },
  'M-6': { A: null, AD: 100, ER: 60, PT: 100, obs: 'Consultar NT específica (Floresta)',                notas: ['I']           },
  'M-7': { A: null, AD: 100, ER: 60, PT: 100, obs: 'Consultar NT específica (Pátio de contêineres)',   notas: ['I']           },
  'M-8': { A: null, AD: 100, ER: 60, PT: 100, obs: 'Consultar NT específica (Torres de telefonia)',    notas: ['I']           },
}

// ── Notas normativas ──────────────────────────────────────────────────
export const NOTAS_NORMATIVAS = {
  C: '(C) Em apartamentos de até 2 dormitórios, a sala deve ser considerada como dormitório.',
  D: '(D) Alojamento = dormitório coletivo, com mais de 10m².',
  E: '(E) Por Área entende-se a área do pavimento que abriga a população em foco.',
  F: '(F) Auditórios e assemelhados em escolas são considerados nos grupos F-5, F-6 e outros.',
  G: '(G) As cozinhas nas ocupações B, F-6 e F-8 têm ocupação admitida como grupo D (1 pes/7m²).',
  H: '(H) Em hospitais com ambulatório, acresce-se 1 pessoa por 7m² de área de ambulatório.',
  I: '(I) Necessidade de consultar normas e regulamentos específicos.',
  J: '(J) A parte de atendimento ao público de comércio atacadista deve ser considerada grupo C.',
  L: '(L) Para ocupações tipo Call-center, calcular 1 pessoa por 1,5m² de área.',
  M: '(M) Para área de lojas, adotar 1 pessoa por 7m² de área.',
  N: '(N) Para o cálculo da população, será admitido o leiaute dos assentos permanentes.',
  P: '(P) Para restaurante dançante com pista de dança: 1 pessoa por 0,67m² de área.',
  Q: '(Q) Para locais com banco (assento comprido): 1 pessoa por 0,50m linear.',
}

// ── Larguras mínimas (NBR 9077) ───────────────────────────────────────
// PT (largura mínima de porta) é a largura de fato exigida por faixa de
// UP, não N_UP x LARG_UP — coincide com o cálculo multiplicado pra 2/3/4
// UP (2x0,55=1,10 / 3x0,55=1,65 / 4x0,55=2,20), mas é a tabela quem manda:
// calcPT faz max(N_UP x LARG_UP, largura_da_faixa), então a partir de
// 5 UP (fora da tabela, sem faixa própria) o cálculo passa a multiplicar
// por LARG_UP livremente.
export const LARGURAS_MINIMAS = {
  LARG_UP: 0.55,
  AD: 1.20,
  ER: 1.20,
  PT: [
    { n_up: 1, largura: 0.80, tipo: '1 folha'  },
    { n_up: 2, largura: 1.10, tipo: '1 folha'  },
    { n_up: 3, largura: 1.65, tipo: '2 folhas' },
    { n_up: 4, largura: 2.20, tipo: '2 folhas' },
  ],
}

// ── Distâncias máximas (NBR 9077) ─────────────────────────────────────
// Formato mapa_ocupacao (divisão -> id do grupo) + grupos (id -> dados) —
// igual ao que o plugin já usava, no lugar do array de blocos com
// "divisoes" embutido que existia aqui antes. Mesma informação.
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
    'M-1': 'CDFG', 'M-2': 'CDFG', 'M-3': 'CDFG', 'M-4': 'CDFG',
    'M-5': 'CDFG', 'M-6': 'CDFG', 'M-7': 'CDFG', 'M-8': 'CDFG',
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

// ── Tipos de escada de emergência por ocupação (Anexo C, Tabela 3) ─────
// Faixa de altura (H = altura piso a piso da estrutura) x divisão -> NE / EP
// / PF; '+' = consultar NT/normas específicas, '-' = não se aplica. Notas só
// exibidas (por divisão + gerais). Fonte de verdade: chave `tipos_escada`
// da linha do Supabase (ver migração 20260926140000).
export const TIPOS_ESCADA = {
  "titulo": "Anexo C — Tabela 3: Tipos de escada de emergência por ocupação",
  "faixas_altura": [
    {
      "id": "ate_6",
      "label": "H ≤ 6 m",
      "min": null,
      "max": 6
    },
    {
      "id": "6_12",
      "label": "6 < H ≤ 12 m",
      "min": 6,
      "max": 12
    },
    {
      "id": "12_30",
      "label": "12 < H ≤ 30 m",
      "min": 12,
      "max": 30
    },
    {
      "id": "acima_30",
      "label": "Acima de 30 m",
      "min": 30,
      "max": null
    }
  ],
  "tipos": {
    "NE": {
      "nome": "Escada não enclausurada",
      "detalhe": "escada comum",
      "rank": 1
    },
    "EP": {
      "nome": "Escada enclausurada protegida",
      "detalhe": "escada protegida",
      "rank": 2
    },
    "PF": {
      "nome": "Escada à prova de fumaça",
      "detalhe": null,
      "rank": 3
    },
    "+": {
      "nome": "Consultar NT, normas ou regulamentos específicos",
      "detalhe": "ocupação não coberta por essa NT",
      "rank": null
    },
    "-": {
      "nome": "Não se aplica",
      "detalhe": null,
      "rank": null
    }
  },
  "tabela": {
    "A-1": [
      "NE",
      "NE",
      "-",
      "-"
    ],
    "A-2": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "A-3": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "B-1": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "B-2": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "C-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "C-2": [
      "NE",
      "NE",
      "PF",
      "PF"
    ],
    "C-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "D": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-2": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-3": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-4": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-5": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-6": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "F-3": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-4": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-5": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-6": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "F-7": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-8": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "F-9": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "F-10": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "F-11": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "G-1": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-2": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-3": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-4": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-5": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "H-1": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "H-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "H-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "H-4": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "H-5": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "H-6": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "I-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "I-2": [
      "NE",
      "NE",
      "PF",
      "PF"
    ],
    "I-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "J": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "K": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "L-1": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "L-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "L-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "M-1": [
      "NE",
      "NE",
      "+",
      "+"
    ],
    "M-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "M-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "M-4": [
      "NE",
      "NE",
      "NE",
      "NE"
    ],
    "M-5": [
      "NE",
      "EP",
      "PF",
      "PF"
    ]
  },
  "notas": {
    "1": "Em edificações de ocupação do grupo A - divisão A-2, área de pavimento \"N\" (menor ou igual a 750 m²), altura acima de 30 m, contudo não superior a 50 m, a escada poderá ser do tipo EP (Escada Enclausurada Protegida), sendo que acima desta altura (50 m) permanece a escada do tipo PF (Escada Enclausurada à Prova de fumaça);",
    "a": "para o uso desta Tabela, devem ser consultadas as tabelas anteriores desta NT. Para a classificação das Ocupações (Grupos e Divisões), consultar a Tabela 1 do Regulamento de Segurança contra incêndio em vigor.",
    "b": "para as ocupações de divisão F-3, recintos esportivos ou de espetáculos artístico cultural (exceto ginásios e piscinas com ou sem arquibancadas, academias e pista de patinação), deve ser consultada a NT 12;",
    "c": "para a divisões F-3 e F-7, com população total superior a 2.500 pessoas, deve ser consultada a NT 12;",
    "d": "havendo necessidade de duas ou mais escadas de segurança, uma delas pode ser do tipo Aberta Externa (AE), atendendo ao item 5.7.12 desta NT;",
    "e": "para divisões H-2 e H-3, com altura superior a 12 m, além das saídas de emergências por escadas (Tabela 3) deve possuir elevador de emergência (Figura 17)",
    "f": "para divisões H-2, com altura superior a 12 m e H-3, com altura superior a 6 m, além das saídas de emergências por escadas (Tabela 3) deve possuir áreas de refúgio (Figura 25). As áreas de refúgio quando situadas somente em alguns pavimentos de níveis diferentes, seus acessos devem ser ligados por rampa (item 5.5.1.a desta NT). Para as edificações que possuam área de refúgio em todos os pavimentos (exceto pavimento térreo), não há necessidade de rampa interligando os diferentes níveis em acessos às áreas de refúgio;",
    "g": "o número de escadas depende do dimensionamento das saídas pelo cálculo da população (Tabela 1) e distâncias máximas a serem percorridas (Tabela 2);",
    "h": "nas edificações com altura acima de 36 m, independente da nota anterior, é obrigatória a quantidade mínima de duas escadas, exceto para grupo A-2. Nas edificações do grupo A-2, com altura acima de 80 m, independente da nota anterior, é obrigatória a quantidade mínima de duas escadas;",
    "i": "as condições das saídas de emergência em edificações com altura superior a 150 m devem ser analisadas por meio de Comissão Técnica, devido as suas particularidades e risco;",
    "j": "nas escadas abaixo do pavimento de descarga, em subsolos, onde está prevista a escada NE, conforme Tabela 3, esta deve ser enclausurada, dotada de PCF P-90, sem a necessidade de ventilação. Para os subsolos com altura descendentes com profundidade maior que 12 m, e que tenham sua ocupação diferente de estacionamento (garagens – G1e G2), devem ser projetados sistemas de pressurização para as escadas."
  },
  "notas_por_divisao": {
    "A-2": [
      "1"
    ],
    "F-3": [
      "b",
      "c"
    ],
    "F-7": [
      "c"
    ],
    "H-2": [
      "e",
      "f"
    ],
    "H-3": [
      "e",
      "f"
    ]
  },
  "notas_gerais": [
    "a",
    "d",
    "g",
    "h",
    "i",
    "j"
  ]
}
