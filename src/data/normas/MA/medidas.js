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

  // B, C, D... adicionados progressivamente
}
