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
