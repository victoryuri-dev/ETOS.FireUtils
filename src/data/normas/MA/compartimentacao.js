// normas/MA/compartimentacao.js — NT 09/2021 CBMMA (Compartimentação
// Horizontal e Vertical), Anexo B (Tabela de Área Máxima de Compartimentação).
//
// ATENÇÃO: a tabela abaixo foi transcrita manualmente a partir de um PDF sem
// camada de texto íntegra (extração best-effort). Por se tratar de dado que
// alimenta um memorial assinado por RT, confira os valores contra o
// documento original antes de usar em um projeto real — em especial:
//  - As faixas de altura de cada "Tipo de edificação" (I a VI) não puderam
//    ser lidas diretamente da tabela (a coluna ALTURA do PDF só preservou os
//    rótulos extremos "Um pavimento" e "Acima de 30 m"). As faixas abaixo
//    foram assumidas por correspondência com as classes de altura do Anexo B
//    da NT 01 CBMMA (mesma lógica de P1–P4, aqui renomeadas conforme a
//    denominação de cada tipo) — CONFIRMAR contra o texto da NT 09 original.
//  - H-3 (Tipo VI) e H-6 (Tipo IV): o dígito das centenas ficou truncado na
//    extração ("1.00" em vez de "1.000") — assumido 1.000 m² por consistência
//    com o padrão de arredondamento das demais linhas. CONFIRMAR.
//  - M-1 não aparece na tabela do Anexo B (nem L-1/L-2/L-3, que a própria
//    NT 01 já reserva para avaliação por Comissão Técnica/NT específica).

// ── Tipos de edificação (Anexo B, NT 09 CBMMA) ──────────────────────────────
export const CLASSES_TIPO_EDIFICACAO = [
  { classe: 'I',   nome: 'Edificação térrea',                  min: 0,  max: 0   },
  { classe: 'II',  nome: 'Edificação baixa',                   min: 0,  max: 6   },
  { classe: 'III', nome: 'Edificação de baixa-média altura',   min: 6,  max: 12  },
  { classe: 'IV',  nome: 'Edificação de média altura',         min: 12, max: 23  },
  { classe: 'V',   nome: 'Edificação medianamente alta',       min: 23, max: 30  },
  { classe: 'VI',  nome: 'Edificação alta',                    min: 30, max: Infinity },
]

// ── Tabela de Área Máxima de Compartimentação (m²) — Anexo B ────────────────
// Cada linha cobre um conjunto de divisões. `t1`..`t6` = Tipo I a Tipo VI.
// null = "-" na tabela original (compartimentação horizontal não regida por
// limite de área nessa combinação — outras regras desta NT se aplicam, ex.:
// regras específicas entre unidades autônomas do Grupo A, ou a divisão está
// dispensada de compartimentação horizontal por área).
export const TABELA_AREA_MAXIMA = [
  { divisoes: ['A-1', 'A-2', 'A-3'],
    t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },

  { divisoes: ['B-1', 'B-2'],
    t1: null, t2: 5000, t3: 4000, t4: 3000, t5: 2000, t6: 1500 },

  { divisoes: ['C-1', 'C-2'],
    t1: 5000, t2: 3000, t3: 2000, t4: 2000, t5: 1500, t6: 1500 },
  { divisoes: ['C-3'],
    t1: 5000, t2: 2500, t3: 1500, t4: 1000, t5: 2000, t6: 2000 },

  { divisoes: ['D-1', 'D-2', 'D-3', 'D-4'],
    t1: 5000, t2: 2500, t3: 1500, t4: 1000, t5: 800, t6: 2000 },

  { divisoes: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6'],
    t1: null, t2: null, t3: null, t4: null, t5: 1500, t6: 2000 },

  // Grupo F — F-1/F-2/F-3/F-4/F-7/F-9 não têm linha própria no Anexo B
  // (compartimentação horizontal não se aplica a essas divisões — mesma
  // convenção usada em normas/MA/medidas.js, `divisoes: []`).
  { divisoes: ['F-1', 'F-2', 'F-3', 'F-4', 'F-7', 'F-9'],
    t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['F-5', 'F-6'],
    t1: 5000, t2: 4000, t3: 3000, t4: 2000, t5: 1000, t6: 1500 },
  { divisoes: ['F-8'],
    t1: null, t2: null, t3: null, t4: 2000, t5: 1000, t6: 1500 },
  { divisoes: ['F-10', 'F-11'],
    t1: 5000, t2: 2500, t3: 1500, t4: 1000, t5: 1000, t6: 1000 },

  { divisoes: ['G-1', 'G-2', 'G-3', 'G-5'],
    t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['G-4'],
    t1: 10000, t2: 5000, t3: 3000, t4: 2000, t5: 1000, t6: 1000 },

  { divisoes: ['H-1', 'H-2', 'H-4', 'H-5'],
    t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['H-3'],
    t1: null, t2: 5000, t3: 3000, t4: 2000, t5: 1500, t6: 1000 },
  { divisoes: ['H-6'],
    t1: 5000, t2: 2500, t3: 1500, t4: 1000, t5: 800, t6: 2000 },

  { divisoes: ['I-1'],
    t1: null, t2: 10000, t3: 5000, t4: 3000, t5: 2000, t6: 2000 },
  { divisoes: ['I-2'],
    t1: null, t2: 10000, t3: 5000, t4: 3000, t5: 2000, t6: 2000 },
  { divisoes: ['I-3'],
    t1: 7500, t2: 5000, t3: 3000, t4: 2000, t5: 1500, t6: 1500 },

  { divisoes: ['J-1'],
    t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['J-2'],
    t1: 10000, t2: 5000, t3: 3000, t4: 1500, t5: 2000, t6: 1500 },
  { divisoes: ['J-3', 'J-4'],
    t1: 4000, t2: 3000, t3: 2000, t4: 2500, t5: 1500, t6: 1000 },

  { divisoes: ['K-1'],
    t1: 5000, t2: 3000, t3: 2000, t4: 1000, t5: 500, t6: 500 },

  { divisoes: ['M-2'],
    t1: 11000, t2: 500, t3: 500, t4: 300, t5: 300, t6: 200 },
  { divisoes: ['M-3'],
    t1: 5000, t2: 3000, t3: 2000, t4: 1000, t5: 500, t6: 500 },
]

// Nota específica do Anexo B (rodapé da tabela de área máxima).
export const NOTA_AREA_MAXIMA_M2 = 'A área máxima de compartimentação para edificações do grupo M-2 pode ser substituída quando a edificação for protegida por sistema de chuveiro automático de água ou de espuma, conforme NT 25 — Segurança contra Incêndio para líquidos combustíveis e inflamáveis.'

// ── TRRF mínimo dos elementos de compartimentação (itens 5.4 e 6.4) ────────
export const TRRF_MINIMO_PAREDE_COMPARTIMENTACAO = 60 // min (EI-60) — itens 5.4.1 e 6.4.1
export const TRRF_REDUCAO_MAXIMA_ABERTURAS = 30        // min a menos que a parede, itens 5.4.2 e 6.4.2.1 — nunca abaixo de 60 min
export const TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR = 120 // min (EI-120) — item 6.4.2.2
export const TRRF_MINIMO_SELAGEM_PRUMADAS = 60          // min — item 6.4.2.3
export const TRRF_MINIMO_DUTO_SEM_REGISTRO = 120        // min — item 6.4.2.5
export const TRRF_PORTA_ESCADA_SEM_ANTECAMARA = 90      // min (EI-90) — item 6.4.2.4
export const TRRF_PORTA_ESCADA_COM_ANTECAMARA = 60      // min (EI-60) — item 6.4.2.4
export const TRRF_ESCADA_RAMPA_SUBSOLO = 90             // min (PCF P-90/EI-90) — itens 5.5.7 e 6.5.3

// ── Elementos construtivos / medidas de proteção (itens 5.1.3 e 6.1.2) ─────
// Usados como checklist "solução adotada" na tela e no memorial — a NT exige
// que a solução conste no Memorial Descritivo (itens 5.1.5 e 6.1.5).
export const ELEMENTOS_COMPART_HORIZONTAL = [
  { key: 'parede_corta_fogo',  label: 'Parede corta-fogo (EI)' },
  { key: 'porta_corta_fogo',   label: 'Porta corta-fogo (EI)' },
  { key: 'vedador_corta_fogo', label: 'Vedador corta-fogo (EI)' },
  { key: 'registro_corta_fogo',label: 'Registro corta-fogo — damper (EI)' },
  { key: 'selo_corta_fogo',    label: 'Selo corta-fogo (EI)' },
  { key: 'dispositivo_enrolar',label: 'Dispositivo automatizado de enrolar corta-fogo (EI)' },
  { key: 'afastamento_horizontal', label: 'Afastamento horizontal entre aberturas' },
]

export const ELEMENTOS_COMPART_VERTICAL = [
  { key: 'entrepiso_corta_fogo',      label: 'Entrepiso corta-fogo (EI)' },
  { key: 'enclausuramento_escada',    label: 'Enclausuramento de escadas (parede e porta corta-fogo)' },
  { key: 'enclausuramento_elevador',  label: 'Enclausuramento de poços de elevador/monta-carga' },
  { key: 'selo_corta_fogo',           label: 'Selo corta-fogo (EI) — prumadas de instalações' },
  { key: 'registro_corta_fogo',       label: 'Registro corta-fogo — damper (EI)' },
  { key: 'vedador_corta_fogo',        label: 'Vedador corta-fogo (EI)' },
  { key: 'separacao_fachada',         label: 'Separação de fachada entre pavimentos (antepara vertical/horizontal)' },
  { key: 'selagem_perimetral',        label: 'Selagem perimetral corta-fogo (EI)' },
  { key: 'dispositivo_enrolar',       label: 'Dispositivo automatizado de enrolar corta-fogo (EI)' },
]

// ── Condições especiais (dispensas e regras específicas) ────────────────────
// Chave usada no checklist da tela — texto e referência ao item da NT 09.
export const CONDICOES_ESPECIAIS_HORIZONTAL = [
  { key: 'estacionamento_exclusivo', ref: '5.5.1', texto: 'Área destinada exclusivamente a estacionamento de veículos — compartimentação horizontal dispensada.' },
  { key: 'unidades_autonomas_ei60',  ref: '5.5.2', texto: 'Grupos A (A-2/A-3), B e H (H-2/H-3): paredes entre unidades autônomas e áreas comuns com TRRF mínimo de 60 min (EI-60), independente do TRRF da edificação — dispensável se houver chuveiros automáticos (item 5.5.4).' },
  { key: 'subsolo_pcf_p90',          ref: '5.5.7', texto: 'Escadas/rampas de circulação vindas de subsolo compartimentadas com PCF P-90 (EI-90) em relação aos demais pisos, independente da área máxima.' },
  { key: 'drywall_acima_6_5m',       ref: '5.5.10', texto: 'Parede de drywall com altura acima de 6,5 m — exige atestado do fabricante e ART/documento de responsabilidade técnica da instalação.' },
]

export const CONDICOES_ESPECIAIS_VERTICAL = [
  { key: 'interligacao_ate_3_pavimentos', ref: '6.5.1', texto: 'Interligação de até 3 pavimentos consecutivos acima do térreo por átrios, escadas, rampas ou escadas rolantes, desde que a soma das áreas desses pavimentos não ultrapasse a área máxima de compartimentação.' },
  { key: 'subsolo_dutos_shafts',          ref: '6.5.2', texto: 'Dutos e shafts de instalações dos subsolos compartimentados integralmente em relação ao térreo, piso de descarga e demais pisos elevados, independente da área máxima.' },
  { key: 'subsolo_pcf_p90',               ref: '6.5.3', texto: 'Escadas/rampas de circulação vindas de subsolo compartimentadas com PCF P-90 (EI-90) em relação aos demais pisos, independente da área máxima.' },
  { key: 'dispositivo_enrolar_sprinklers',ref: '7.1',   texto: 'Dispositivos automatizados de enrolar corta-fogo só podem substituir portas/vedadores em edificações protegidas por chuveiros automáticos, nas situações do item 7.1 (interligação de até 2 pavimentos, pavimento de estacionamento, ou ampliação de edificação existente).' },
]
