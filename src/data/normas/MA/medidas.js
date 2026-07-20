// normas/MA/medidas.js — NT 01/2024 Parte 2

// ── Limiares ─────────────────────────────────────────────────────────────────
// Simplificado quando: area < areaMin E altura < alturaMin
export const LIMIARES = {
  areaMin:   750,
  alturaMin:  12,
}

// ── Notas específicas ─────────────────────────────────────────────────────────
// Chave: letra do grupo (ou código da divisão para grupos com sub-tabelas, ex: 'F-1').
// Dentro: chave = nome da medida de segurança. Valor = texto da nota.
// Exibidas nas janelas de dimensionamento quando a medida for obrigatória.
export const NOTAS_ESPECIFICAS = {
  'A': {
    compart_horizontal: 'Devem ser atendidas somente as regras específicas de compartimentação entre unidades autônomas.',
    compart_vertical:   'Pode ser substituída por sistema de controle de fumaça somente nos átrios.',
    saida_emergencia:   'Deve haver elevador de emergência para altura maior que 80 metros.',
    alarme:             'O sistema de alarme pode ser setorizado na central junto à portaria, desde que tenha vigilância 24h.',
    central_gas:        'Para as divisões A-1 e A-3, é permitido o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos desde que o recipiente esteja localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Para a divisão A-2, deverão ser atendidas as normas brasileiras oficiais de distribuição interna não sendo permitido o uso de recipientes dentro das unidades autônomas.',
  },
  // B, C, D... adicionados progressivamente
}

// ── Tabela 5 — Processo Simplificado ─────────────────────────────────────────
// Aplica quando: area < areaMin E altura < alturaMin
//
// Resolução:
//   1. Procura em `divisoes` pelo código exato (ex: 'F-9')
//   2. Se não encontrar, procura em `grupos` pela letra do grupo (ex: 'F')
//
// Valor de cada medida: true = exigido sem nota | { notaSimp: N } = exigido com nota da Tabela 5
export const TABELA_SIMPLIFICADA = {
  notasEspecificas: {
    1: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
    2: 'Somente com lotação superior a 250 pessoas conforme item 5.4 da NT 10.',
    3: 'Será exigido Controle de Fumaça para edificações superioras a 500 pessoas nos termos da edificação sem janela da NT 15, podendo ser substituído por chuveiros automáticos de resposta rápida com reserva de incêndio para 30 min.',
    4: 'Apenas para as ocupações do grupo E.',
  },
  notasGerais: {
    'a': 'Para o Grupo K (Energia) e M (especiais) ver tabelas específicas.',
    'b': 'Para a Divisão G-5 (hangares): prever sistema de drenagem de líquidos nos pisos para bacias de contenção à distância. Não é permitido o armazenamento de líquidos combustíveis ou inflamáveis dentro dos hangares.',
    'c': 'Para a Divisão L-1 (Explosivos, Fogos de Artifício), atender a NT-30.',
    'd': 'As Divisões L-2 e L-3 somente serão avaliadas pelo Corpo de Bombeiros mediante Comissão Técnica.',
    'e': 'Os subsolos das edificações devem ser compartimentados com PCF P-90 em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7 da NT 01.',
    'f': 'Observar ainda as exigências para os riscos específicos das respectivas Normas Técnicas.',
    'g': 'Depósitos em áreas descobertas, observar as exigências da Tabela 6J.',
    'h': 'No cômputo de pavimentos, desconsiderar os pavimentos de subsolo quando destinados a estacionamento de veículos, vestiários e instalações sanitárias, áreas técnicas sem aproveitamento para quaisquer atividades ou permanência humana.',
    'i': 'Os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça, dimensionados conforme o disposto na NT-15.',
    'j': 'Para edificações existentes, as adaptações de controle de material de acabamento e revestimento, de saídas de emergência e de controle de fumaça, devem atender a NT-43.',
  },
  grupos: {
    'A': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    'B': {
      controle_acabamento: true,
      saida_emergencia:    true,
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
    'C': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    'D': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    // E recebe gerenciamento/brigada com nota 4 (apenas grupo E)
    'E': {
      saida_emergencia:    true,
      gerenciamento_risco: { notaSimp: 4 },
      brigada:             { notaSimp: 4 },
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
    // F-1 a F-8 e F-10 (padrão do grupo; F-9 e F-11 em `divisoes`)
    'F': {
      controle_acabamento: { notaSimp: 2 },
      saida_emergencia:    true,
      brigada:             true,
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
    'G': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    // H-1, H-4, H-6 (padrão do grupo; H-2, H-3, H-5 em `divisoes`)
    'H': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    'I': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    'J': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    'L': {
      controle_acabamento: true,
      saida_emergencia:    true,
      brigada:             true,
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
  },
  divisoes: {
    'F-9': {
      saida_emergencia: true,
      brigada:          true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
    'F-11': {
      controle_acabamento: { notaSimp: 2 },
      saida_emergencia:    true,
      gerenciamento_risco: true,
      brigada:             true,
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
    'H-2': {
      controle_acabamento: true,
      saida_emergencia:    true,
      gerenciamento_risco: true,
      brigada:             true,
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
    'H-3': {
      controle_acabamento: true,
      saida_emergencia:    true,
      gerenciamento_risco: true,
      brigada:             true,
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
    'H-5': {
      controle_acabamento: true,
      saida_emergencia:    true,
      gerenciamento_risco: true,
      brigada:             true,
      iluminacao:          true,
      sinalizacao:         true,
      extintores:          true,
      central_gas:         { notaSimp: 1 },
    },
    'M-3': {
      saida_emergencia: true,
      iluminacao:       true,
      sinalizacao:      true,
      extintores:       true,
      central_gas:      { notaSimp: 1 },
    },
  },
}

// ── Tabela 6 — Processo Normal ────────────────────────────────────────────────
// Aplica quando: area >= areaMin OU altura >= alturaMin
//
// Cada medida: condição única ou array de condições.
//   { divisoes, alturaMin, alturaMax?, notaGeral? }
//
//   divisoes:  'todas' | ['A-1','A-2'] | []   ([] = nunca exigido)
//   alturaMin: null = qualquer altura | N = somente quando altura > N
//   alturaMax: omitido = sem teto    | N = somente quando altura <= N
//   notaGeral: letra da nota geral do grupo (situacional — varia por divisão/altura)
//
// notaEspecifica não entra nas condições — o texto é buscado via NOTAS_ESPECIFICAS[grupo][medida].
// Array de condições: a medida é exigida se QUALQUER condição for satisfeita.

export const MEDIDAS = {

  // ── Grupo A — Residencial (Tabela 6A) ───────────────────────────────────────
  'A': {
    notasGerais: {
      'a': 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
      'b': 'Observar ainda as exigências das respectivas Normas Técnicas.',
      'c': 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
      'd': 'Medidas de segurança obrigatórias somente para áreas comuns e guarita.',
    },
    medidas: {
      acesso_viatura:      { divisoes: 'todas',       alturaMin: null },
      seg_estrutural:      { divisoes: 'todas',       alturaMin: null },
      compart_horizontal:  { divisoes: 'todas',       alturaMin: null },
      compart_vertical:    { divisoes: ['A-2','A-3'], alturaMin: 23 },
      controle_acabamento: { divisoes: ['A-2','A-3'], alturaMin: 12 },
      saida_emergencia: [
        { divisoes: ['A-1'],       alturaMin: null, notaGeral: 'd' },
        { divisoes: ['A-2','A-3'], alturaMin: null },
      ],
      gerenciamento_risco: { divisoes: [],            alturaMin: null },
      brigada:             { divisoes: ['A-2','A-3'], alturaMin: null },
      iluminacao: [
        { divisoes: ['A-1'],       alturaMin: null, notaGeral: 'd' },
        { divisoes: ['A-2','A-3'], alturaMin: null },
      ],
      sinalizacao: [
        { divisoes: ['A-1'],       alturaMin: null, notaGeral: 'd' },
        { divisoes: ['A-2','A-3'], alturaMin: null },
      ],
      extintores: [
        { divisoes: ['A-1'],       alturaMin: null, notaGeral: 'd' },
        { divisoes: ['A-2','A-3'], alturaMin: null },
      ],
      hidrantes:       { divisoes: ['A-2','A-3'], alturaMin: null },
      alarme: [
        { divisoes: ['A-2','A-3'], alturaMin: null, alturaMax: 30 },
        { divisoes: ['A-2','A-3'], alturaMin: 30 },
      ],
      deteccao:        { divisoes: [],            alturaMin: null },
      sprinklers:      { divisoes: [],            alturaMin: null },
      controle_fumaca: { divisoes: [],            alturaMin: null },
      central_gas:     { divisoes: 'todas',       alturaMin: null },
      spda:            { divisoes: [],            alturaMin: null },
    },
  },
  'B': {
  notasEspecificas: {
    1: 'A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.',
    2: 'Devem ser atendidas somente as regras específicas de compartimentação entre unidades autônomas.',
    3: 'Pode ser substituída por sistemas de chuveiros automáticos.',
    4: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.',
    5: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
    6: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos até 90 metros de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica de compartimentação.',
    7: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
    8: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
    9: 'Os acionadores manuais devem ser instalados nas áreas de circulação.',
    10: 'Estão isentos os motéis que não possuam corredores internos de serviço.',
    11: 'Os detectores de incêndio devem ser instalados em todos os quartos.',
    12: 'Acima de 90 metros de altura conforme critérios de norma específica.',
    13: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais.',
  },
  notasGerais: {
    a: 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
    b: 'Observar ainda as exigências das respectivas Normas Técnicas.',
    c: 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.), ou controle de fumaça dimensionados conforme o disposto em NT específica.',
  },
  medidas: {
    acesso_viatura:      { divisoes: 'todas', alturaMin: null },
    seg_estrutural:      { divisoes: 'todas', alturaMin: null },
    // Térrea = nota2 | H≤6 e 6<H≤12 = nota3 | 12<H≤23 e 23<H≤30 = nota4 | H>30 sem nota
    compart_horizontal:  { divisoes: 'todas', alturaMin: null, notaEspecifica: [2, 3, 4] },
    // 12<H≤23 e 23<H≤30 = nota5 | H>30 = nota6
    compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [5, 6] },
    controle_acabamento: { divisoes: 'todas', alturaMin: null },
    saida_emergencia:    { divisoes: 'todas', alturaMin: null },
    gerenciamento_risco: { divisoes: 'todas', alturaMin: 23 },
    brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 8 },
    iluminacao:          { divisoes: 'todas', alturaMin: null },
    sinalizacao:         { divisoes: 'todas', alturaMin: null },
    extintores:          { divisoes: 'todas', alturaMin: null },
    hidrantes:           { divisoes: 'todas', alturaMin: null },
    alarme:              { divisoes: 'todas', alturaMin: null, notaEspecifica: 9 },
    // H≤6 = nota10+11 | 6<H≤12 em diante = nota11
    deteccao:            { divisoes: 'todas', alturaMin: null, notaEspecifica: [10, 11] },
    sprinklers:          { divisoes: 'todas', alturaMin: 23 },
    controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 12 }, // nota12 = "acima de 90m"
    espuma:              { divisoes: [], alturaMin: null },
    central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 13 },
    spda:                { divisoes: [], alturaMin: null },
  },
},
'C': {
  notasEspecificas: {
    1: 'A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.',
    2: 'Pode ser substituída por sistemas de chuveiros automáticos.',
    3: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.',
    4: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
    5: 'Deve haver controle de fumaça nos átrios, podendo ser dimensionados como sendo padronizados conforme NT específica.',
    6: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos até 90 metros de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica de compartimentação.',
    7: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
    8: 'Para edificações de divisão C-3 (Shopping Centers).',
    9: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
    10: 'Somente para áreas de depósitos superiores a 750 m², ou para as edificações com área superiores a 3.000 m².',
    11: 'Acima de 90 metros de altura conforme critérios de NT específica.',
    12: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
  },
  notasGerais: {
    a: 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
    b: 'Observar ainda as exigências das respectivas Normas Técnicas.',
    c: 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
  },
  medidas: {
    acesso_viatura:      { divisoes: 'todas', alturaMin: null },
    seg_estrutural:      { divisoes: 'todas', alturaMin: null },
    // Térrea e H≤6 = nota2 | 6<H≤12 em diante = nota3
    compart_horizontal:  { divisoes: 'todas', alturaMin: null, notaEspecifica: [2, 3] },
    // 12<H≤23 = nota4+5 | 23<H≤30 = nota4 | H>30 = nota6
    compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [4, 5, 6] },
    controle_acabamento: { divisoes: 'todas', alturaMin: null },
    saida_emergencia:    { divisoes: 'todas', alturaMin: null },
    // Térrea a 12<H≤23 = nota8 (somente C-3/Shopping) | 23<H≤30 em diante = exigido p/ todas as divisões, sem nota
    gerenciamento_risco: [
      { divisoes: ['C-3'], alturaMin: null, alturaMax: 12, notaEspecifica: 8 },
      { divisoes: 'todas', alturaMin: 23 },
    ],
    brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 9 },
    iluminacao:          { divisoes: 'todas', alturaMin: null },
    sinalizacao:         { divisoes: 'todas', alturaMin: null },
    extintores:          { divisoes: 'todas', alturaMin: null },
    hidrantes:           { divisoes: 'todas', alturaMin: null },
    alarme:              { divisoes: 'todas', alturaMin: null },
    // Térrea, H≤6, 6<H≤12 = nota10 (área de depósito) | demais sem condicionante
    deteccao:            { divisoes: 'todas', alturaMin: null, notaEspecifica: 10 },
    sprinklers:          { divisoes: 'todas', alturaMin: 23 },
    controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 11 }, // nota11 = "acima de 90m"
    espuma:              { divisoes: [], alturaMin: null },
    central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 12 },
    spda:                { divisoes: [], alturaMin: null },
  },
},
'D': {
  notasEspecificas: {
    1: 'A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.',
    2: 'Pode ser substituída por sistemas de chuveiros automáticos.',
    3: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.',
    4: 'Pode ser substituída por sistema detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
    5: 'Deve haver controle de fumaça nos átrios, podendo ser dimensionados como sendo padronizados conforme NT específica.',
    6: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
    7: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
    8: 'Acima de 90 m de altura conforme critério da NT específica.',
    9: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
    10: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
  },
  notasGerais: {
    a: 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
    b: 'Observar ainda as exigências das respectivas Normas Técnicas.',
    c: 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
  },
  medidas: {
    acesso_viatura:      { divisoes: 'todas', alturaMin: null },
    seg_estrutural:      { divisoes: 'todas', alturaMin: null },
    // Térrea, H≤6, 6<H≤12 = nota2 | 12<H≤23 e 23<H≤30 = nota3 | H>30 sem nota
    compart_horizontal:  { divisoes: 'todas', alturaMin: null, notaEspecifica: [2, 3] },
    // 12<H≤23 = nota4+5 | 23<H≤30 = nota6 | H>30 = nota4
    compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [4, 5, 6] },
    controle_acabamento: { divisoes: 'todas', alturaMin: null },
    saida_emergencia:    { divisoes: 'todas', alturaMin: null },
    gerenciamento_risco: { divisoes: 'todas', alturaMin: 90, notaEspecifica: 8 }, // nota8 = "acima de 90m"
    brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 9 },
    iluminacao:          { divisoes: 'todas', alturaMin: null },
    sinalizacao:         { divisoes: 'todas', alturaMin: null },
    extintores:          { divisoes: 'todas', alturaMin: null },
    hidrantes:           { divisoes: 'todas', alturaMin: null },
    alarme:              { divisoes: 'todas', alturaMin: null },
    deteccao:            { divisoes: 'todas', alturaMin: 12 },
    sprinklers:          { divisoes: 'todas', alturaMin: 30 },
    controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 8 }, // nota8 = "acima de 90m" (mesma nota da linha de gerenciamento de risco)
    espuma:              { divisoes: [], alturaMin: null },
    central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 10 },
    spda:                { divisoes: [], alturaMin: null },
  },
},
'E': {
  notasEspecificas: {
    1: 'A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.',
    2: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.',
    3: 'A compartimentação vertical será considerada para as fachadas e selagens dos shafts e dutos de instalações.',
    4: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, até 90 m de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica.',
    5: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
    6: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
    7: 'Acima de 90 m de altura conforme critério da NT específica.',
    8: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
  },
  notasGerais: {
    a: 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
    b: 'Observar ainda as exigências das respectivas Normas Técnicas.',
    c: 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
    d: 'Os locais destinados a laboratórios devem ter proteção em função dos produtos utilizados.',
  },
  medidas: {
    acesso_viatura:      { divisoes: 'todas', alturaMin: null },
    seg_estrutural:      { divisoes: 'todas', alturaMin: null },
    // só 23<H≤30 tem nota2; H>30 já não tem nota (substituição não se aplica)
    compart_horizontal:  { divisoes: 'todas', alturaMin: 23, notaEspecifica: 2 },
    // 12<H≤23 e 23<H≤30 = nota3 | H>30 = nota4
    compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [3, 4] },
    controle_acabamento: { divisoes: 'todas', alturaMin: null },
    saida_emergencia:    { divisoes: 'todas', alturaMin: null },
    gerenciamento_risco: { divisoes: 'todas', alturaMin: null }, // exigido em todas as alturas, sem condicionante
    brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
    iluminacao:          { divisoes: 'todas', alturaMin: null },
    sinalizacao:         { divisoes: 'todas', alturaMin: null },
    extintores:          { divisoes: 'todas', alturaMin: null },
    hidrantes:           { divisoes: 'todas', alturaMin: null },
    alarme:              { divisoes: 'todas', alturaMin: null },
    deteccao:            { divisoes: 'todas', alturaMin: 12 },
    sprinklers:          { divisoes: 'todas', alturaMin: 30 },
    controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 7 }, // nota7 = "acima de 90m"
    espuma:              { divisoes: [], alturaMin: null },
    central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 8 },
    spda:                { divisoes: [], alturaMin: null },
  },
},
'F': {

  // ── F-1 e F-2 (Tabela 6F.1) ──────────────────────────────────────────
  'F1_F2': {
    notasEspecificas: {
      1: 'Pode ser substituída por sistema detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
      2: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
      3: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, até 90 m de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica.',
      4: 'A compartimentação vertical será considerada para as fachadas e selagens dos shafts e dutos de instalações.',
      5: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
      6: 'Somente para locais com público acima de 1.000 pessoas.',
      7: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
      8: 'Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.',
      9: 'Acima de 90 m de altura conforme critério da NT específica.',
      10: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
    },
    notasGerais: {
      'a': 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
      'b': 'Observar ainda as exigências das respectivas Normas Técnicas.',
      'c': 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
    },
    medidas: {
      'F-1': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        compart_horizontal:  { divisoes: [], alturaMin: null }, // linha não existe nesta tabela
        // 12<H≤23=nota1 | 23<H≤30=nota2 | H>30=nota3
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [1, 2, 3] },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        gerenciamento_risco: { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 7 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        deteccao:            { divisoes: 'todas', alturaMin: null },
        sprinklers:          { divisoes: 'todas', alturaMin: 30 },
        controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 9 },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 10 },
        spda:                { divisoes: [], alturaMin: null },
      },
      'F-2': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        compart_horizontal:  { divisoes: [], alturaMin: null },
        // 12<H≤23=nota4 | 23<H≤30=nota2 | H>30=nota3
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [4, 2, 3] },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        gerenciamento_risco: { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 7 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        // só 12<H≤23 tem nota8; 23<H≤30 e H>30 já exigidos sem condicionante
        deteccao:            { divisoes: 'todas', alturaMin: 12, notaEspecifica: 8 },
        sprinklers:          { divisoes: 'todas', alturaMin: 30 },
        controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 9 },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 10 },
        spda:                { divisoes: [], alturaMin: null },
      },
    },
  },

  // ── F-3, F-9 e F-4 (Tabela 6F.2) ─────────────────────────────────────
  'F3_F4_F9': {
    notasEspecificas: {
      1: 'A compartimentação vertical será considerada para as fachadas e selagens dos shafts e dutos de instalações.',
      2: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações. Para estação metroferroviária fica dispensado o sistema de chuveiros automáticos.',
      3: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
      4: 'Somente para a divisão F-3.',
      5: 'Somente para locais com público acima de 1.000 pessoas.',
      6: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
      7: 'Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.',
      8: 'Não exigido nas arquibancadas. Nas áreas internas, verificar exigências conforme o uso ou ocupação específica. Para a divisão F-3, verificar também NT específica de centro de eventos e exibição.',
      9: 'Exigido para áreas edificadas superiores a 10.000 m², exceto para estação metroferroviária. Nas áreas internas, verificar exigências conforme o uso ou ocupação específica. Para estação metroferroviária, onde houver áreas internas ocupadas por uso distinto de F-4, devem ser protegidas por sistemas de chuveiros automáticos de resposta rápida, podendo ser interligado à rede de hidrantes pressurizada.',
      10: 'Acima de 90 m de altura conforme critério da NT específica.',
      11: 'Será exigido para todas as estações metroferroviárias subterrâneas, conforme critério da NT específica.',
      12: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
    },
    notasGerais: {
      'a': 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
      'b': 'Observar ainda as exigências das respectivas Normas Técnicas.',
      'c': 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
      'd': 'A altura das edificações subterrâneas da divisão F-4 será medida do piso mais baixo ao piso mais alto ocupado.',
      'e': 'Os locais de comércio ou atividades distintas das divisões F-3, F-4 e F-9 terão as medidas de proteção conforme suas respectivas ocupações.',
    },
    medidas: {
      'F-3_F-9': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        compart_horizontal:  { divisoes: [], alturaMin: null },
        // 12<H≤23 e 23<H≤30 = nota1 | H>30 = nota2
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [1, 2] },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        // nota4: "somente para a divisão F-3" — F-9 não entra aqui
        gerenciamento_risco: { divisoes: ['F-3'], alturaMin: null, notaEspecifica: 4 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        deteccao:            { divisoes: 'todas', alturaMin: 12, notaEspecifica: 7 },
        sprinklers:          { divisoes: 'todas', alturaMin: 12, notaEspecifica: 8 },
        controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 10 },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 12 },
        spda:                { divisoes: [], alturaMin: null },
      },
      'F-4': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        compart_horizontal:  { divisoes: [], alturaMin: null },
        // 12<H≤23 = nota1 | 23<H≤30 e H>30 = nota2
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: [1, 2] },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        // térrea..23<H≤30 = nota5 (público>1000) | H>30 = exigido sem condicionante
        gerenciamento_risco: [
          { divisoes: 'todas', alturaMin: null, alturaMax: 30, notaEspecifica: 5 },
          { divisoes: 'todas', alturaMin: 30 },
        ],
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        deteccao:            { divisoes: 'todas', alturaMin: null, notaEspecifica: 7 },
        // térrea a 12<H≤23 = nota9 (área>10.000m²) | 23<H≤30 e H>30 = exigido sem condicionante
        sprinklers: [
          { divisoes: 'todas', alturaMin: null, alturaMax: 12, notaEspecifica: 9 },
          { divisoes: 'todas', alturaMin: 23 },
        ],
        // térrea=- | H≤6 a 23<H≤30 = nota11 (estações subterrâneas) | H>30 = nota10+11
        controle_fumaca:     { divisoes: 'todas', alturaMin: 0, notaEspecifica: [11, 10] },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 12 },
        spda:                { divisoes: [], alturaMin: null },
      },
    },
  },

  // ── F-5, F-6 e F-8 (Tabela 6F.3) ─────────────────────────────────────
  'F5_F6_F8': {
    notasEspecificas: {
      1: 'A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.',
      2: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.',
      3: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
      4: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
      5: 'Somente para locais com público acima de 1.000 pessoas.',
      6: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
      7: 'Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.',
      8: 'Acima de 90 m de altura conforme critério da NT específica.',
      9: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
    },
    notasGerais: {
      'a': 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
      'b': 'Observar ainda as exigências das respectivas Normas Técnicas.',
      'c': 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
      'd': 'Nos locais de concentração de público, antes do início de cada evento, é obrigatória a explanação ao público da localização das saídas de emergência bem como dos sistemas de segurança existentes no local.',
    },
    medidas: {
      'F-5_F-6': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        // térrea a 12<H≤23 = nota1 | 23<H≤30 e H>30 = sem nota
        compart_horizontal:  { divisoes: 'todas', alturaMin: null, notaEspecifica: 1 },
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: 3 },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        gerenciamento_risco: { divisoes: 'todas', alturaMin: null, notaEspecifica: 5 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        // térrea a 6<H≤12 = nota7 | 12<H≤23 em diante = sem nota
        deteccao:            { divisoes: 'todas', alturaMin: null, notaEspecifica: 7 },
        sprinklers:          { divisoes: 'todas', alturaMin: 30 },
        controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 8 },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 9 },
        spda:                { divisoes: [], alturaMin: null },
      },
      'F-8': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        // só 12<H≤23 tem nota1; 23<H≤30 e H>30 sem nota
        compart_horizontal:  { divisoes: 'todas', alturaMin: 12, notaEspecifica: 1 },
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: 3 },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        gerenciamento_risco: { divisoes: 'todas', alturaMin: null, notaEspecifica: 5 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        deteccao:            { divisoes: 'todas', alturaMin: 12 },
        sprinklers:          { divisoes: 'todas', alturaMin: 30 },
        controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 8 },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 9 },
        spda:                { divisoes: [], alturaMin: null },
      },
    },
  },

  // ── F-7 e F-10 (Tabela 6F.4) ─────────────────────────────────────────
  'F7_F10': {
    notasEspecificas: {
      1: 'A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.',
      2: 'Pode ser substituída por sistema e chuveiros automáticos.',
      3: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
      4: 'Deve haver elevador de emergência para alturas acima de 60 metros.',
      5: 'Somente para locais com público acima de 1.000 pessoas.',
      6: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
      7: 'Acima de 90 m de altura conforme critério da NT específica.',
      8: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
    },
    notasGerais: {
      'a': 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
      'b': 'Observar ainda as exigências das respectivas Normas Técnicas.',
      'c': 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
      'd': 'A divisão F-7 com altura superior a 6 metros será submetida à Comissão Técnica para definição das medidas de segurança contra incêndio.',
    },
    medidas: {
      'F-7': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: [], alturaMin: null },
        compart_horizontal:  { divisoes: [], alturaMin: null },
        compart_vertical:    { divisoes: [], alturaMin: null },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        gerenciamento_risco: { divisoes: 'todas', alturaMin: null, notaEspecifica: 5 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: [], alturaMin: null },
        alarme:              { divisoes: [], alturaMin: null },
        deteccao:            { divisoes: [], alturaMin: null },
        sprinklers:          { divisoes: [], alturaMin: null },
        controle_fumaca:     { divisoes: [], alturaMin: null },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: [], alturaMin: null },
        spda:                { divisoes: [], alturaMin: null },
      },
      'F-10': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        // térrea a 12<H≤23 = nota2 | 23<H≤30 e H>30 = sem nota
        compart_horizontal:  { divisoes: 'todas', alturaMin: null, notaEspecifica: 2 },
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: 3 },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        gerenciamento_risco: { divisoes: 'todas', alturaMin: null, notaEspecifica: 5 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        deteccao:            { divisoes: 'todas', alturaMin: 6 },
        sprinklers:          { divisoes: 'todas', alturaMin: 23 },
        controle_fumaca:     { divisoes: 'todas', alturaMin: 90, notaEspecifica: 7 },
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 8 },
        spda:                { divisoes: [], alturaMin: null },
      },
    },
  },

  // ── F-11 (Tabela 6F.5) ───────────────────────────────────────────────
  'F11': {
    notasEspecificas: {
      1: 'A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.',
      2: 'Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.',
      3: 'Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.',
      4: 'Somente para locais com público acima de 1.000 pessoas.',
      5: 'Inclui Bombeiro Profissional Civil conforme NT específica.',
      6: 'Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.',
      7: 'Para lotação superior a 3.000 pessoas.',
      8: 'Somente para lotação superior a 500 pessoas, nos termos da edificação sem janelas de NT específica, podendo ser substituído por chuveiros automáticos de resposta rápida com reserva de incêndio para 30 minutos.',
      9: 'Acima de 90 m de altura conforme critério da NT específica.',
      10: 'Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.',
    },
    notasGerais: {
      'a': 'Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.',
      'b': 'Observar ainda as exigências das respectivas Normas Técnicas.',
      'c': 'Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.',
      'd': 'Nos locais de concentração de público, antes do início de cada evento, é obrigatória a explanação ao público da localização das saídas de emergência bem como dos sistemas de segurança existentes no local.',
    },
    medidas: {
      'F-11': {
        acesso_viatura:      { divisoes: 'todas', alturaMin: null },
        seg_estrutural:      { divisoes: 'todas', alturaMin: null },
        // térrea, H≤6, 6<H≤12 = nota2 | 12<H≤23 = nota3 | 23<H≤30 e H>30 sem nota
        compart_horizontal:  { divisoes: 'todas', alturaMin: null, notaEspecifica: [2, 3] },
        compart_vertical:    { divisoes: 'todas', alturaMin: 12, notaEspecifica: 3 },
        controle_acabamento: { divisoes: 'todas', alturaMin: null },
        saida_emergencia:    { divisoes: 'todas', alturaMin: null },
        gerenciamento_risco: { divisoes: 'todas', alturaMin: null, notaEspecifica: 4 },
        brigada:             { divisoes: 'todas', alturaMin: null, notaEspecifica: 5 },
        iluminacao:          { divisoes: 'todas', alturaMin: null },
        sinalizacao:         { divisoes: 'todas', alturaMin: null },
        extintores:          { divisoes: 'todas', alturaMin: null },
        hidrantes:           { divisoes: 'todas', alturaMin: null },
        alarme:              { divisoes: 'todas', alturaMin: null },
        // só térrea tem nota6 (a condição é sobre carga de incêndio/uso, não altura)
        deteccao:            { divisoes: 'todas', alturaMin: null, notaEspecifica: 6 },
        // térrea, H≤6, 6<H≤12 = nota7 (lotação>3000) | 12<H≤23 em diante sem nota
        sprinklers:          { divisoes: 'todas', alturaMin: null, notaEspecifica: 7 },
        controle_fumaca: [
          { divisoes: 'todas', alturaMin: null, notaEspecifica: 8 },
          { divisoes: 'todas', alturaMin: 90, notaEspecifica: 9 },
        ],
        espuma:              { divisoes: [], alturaMin: null },
        central_gas:         { divisoes: 'todas', alturaMin: null, notaEspecifica: 10 },
        spda:                { divisoes: [], alturaMin: null },
      },
    },
  },

},
}
