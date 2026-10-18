// normas/PB/compartimentacao.js — NT 36/2024 CBMPB (Compartimentação
// Horizontal e Compartimentação Vertical), Anexo B (Tabela de área máxima de
// compartimentação). Fonte do seed da linha ('PB','compartimentacao').
//
// Transcrito das imagens do Anexo B enviadas pelo usuário (tabela, nota
// específica 1 e notas genéricas a–c). Diferenças em relação ao MA (NT 09
// CBMMA): I-1 no Tipo V = 1.500 m² (MA: 2.000); M-2 no Tipo I = 1.000 m²
// (MA: 11.000); linhas novas L-1, L-2/L-3, M-1 e M-4 a M-7, com "CTD"
// (área definida pela Comissão Técnica).
//
// ⚠ Daqui para baixo da tabela (TRRF mínimos dos elementos, elementos de
// compartimentação, condições especiais e substituições por sistema): valores
// do MA (normas/MA/compartimentacao.js), por decisão do usuário, até serem
// conferidos com o texto da NT 36/2024.

// ── Tipos de edificação (Anexo B) — mesmas faixas do MA ─────────────────────
export const CLASSES_TIPO_EDIFICACAO = [
  { classe: 'I',   nome: 'Edificação térrea',                  min: 0,  max: 0   },
  { classe: 'II',  nome: 'Edificação baixa',                   min: 0,  max: 6   },
  { classe: 'III', nome: 'Edificação de baixa-média altura',   min: 6,  max: 12  },
  { classe: 'IV',  nome: 'Edificação de média altura',         min: 12, max: 23  },
  { classe: 'V',   nome: 'Edificação medianamente alta',       min: 23, max: 30  },
  { classe: 'VI',  nome: 'Edificação alta',                    min: 30, max: Infinity },
]

// ── Tabela de área máxima de compartimentação (m²) — Anexo B ────────────────
// `t1`..`t6` = Tipo I a VI. null = "–" (dispensado de área máxima, mantendo a
// compartimentação vertical — nota b). 'CTD' = área definida pela Comissão
// Técnica (sem limite tabelado: o cálculo não conclui dispensa).
const CTD = 'CTD'
export const TABELA_AREA_MAXIMA = [
  { divisoes: ['A-1', 'A-2', 'A-3'],                     t1: null,  t2: null,  t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['B-1', 'B-2'],                            t1: null,  t2: 5000,  t3: 4000, t4: 3000, t5: 2000, t6: 1500 },
  { divisoes: ['C-1', 'C-2'],                            t1: 5000,  t2: 3000,  t3: 2000, t4: 2000, t5: 1500, t6: 1500 },
  { divisoes: ['C-3'],                                   t1: 5000,  t2: 2500,  t3: 1500, t4: 1000, t5: 2000, t6: 2000 },
  { divisoes: ['D-1', 'D-2', 'D-3', 'D-4'],              t1: 5000,  t2: 2500,  t3: 1500, t4: 1000, t5: 800,  t6: 2000 },
  { divisoes: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6'], t1: null, t2: null,  t3: null, t4: null, t5: 1500, t6: 2000 },
  { divisoes: ['F-1', 'F-2', 'F-3', 'F-4', 'F-7', 'F-9'], t1: null, t2: null,  t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['F-5', 'F-6'],                            t1: 5000,  t2: 4000,  t3: 3000, t4: 2000, t5: 1000, t6: 1500 },
  { divisoes: ['F-8'],                                   t1: null,  t2: null,  t3: null, t4: 2000, t5: 1000, t6: 1500 },
  { divisoes: ['F-10', 'F-11'],                          t1: 5000,  t2: 2500,  t3: 1500, t4: 1000, t5: 1000, t6: 1000 },
  { divisoes: ['G-1', 'G-2', 'G-3', 'G-5'],              t1: null,  t2: null,  t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['G-4'],                                   t1: 10000, t2: 5000,  t3: 3000, t4: 2000, t5: 1000, t6: 1000 },
  { divisoes: ['H-1', 'H-2', 'H-4', 'H-5'],              t1: null,  t2: null,  t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['H-3'],                                   t1: null,  t2: 5000,  t3: 3000, t4: 2000, t5: 1500, t6: 1000 },
  { divisoes: ['H-6'],                                   t1: 5000,  t2: 2500,  t3: 1500, t4: 1000, t5: 800,  t6: 2000 },
  { divisoes: ['I-1'],                                   t1: null,  t2: 10000, t3: 5000, t4: 3000, t5: 1500, t6: 2000 },
  { divisoes: ['I-2'],                                   t1: null,  t2: 10000, t3: 5000, t4: 3000, t5: 2000, t6: 2000 },
  { divisoes: ['I-3'],                                   t1: 7500,  t2: 5000,  t3: 3000, t4: 2000, t5: 1500, t6: 1500 },
  { divisoes: ['J-1'],                                   t1: null,  t2: null,  t3: null, t4: null, t5: null, t6: null },
  { divisoes: ['J-2'],                                   t1: 10000, t2: 5000,  t3: 3000, t4: 1500, t5: 2000, t6: 1500 },
  { divisoes: ['J-3', 'J-4'],                            t1: 4000,  t2: 3000,  t3: 2000, t4: 2500, t5: 1500, t6: 1000 },
  { divisoes: ['L-1'],                                   t1: 100,   t2: CTD,   t3: CTD,  t4: CTD,  t5: CTD,  t6: CTD },
  { divisoes: ['L-2', 'L-3'],                            t1: CTD,   t2: CTD,   t3: CTD,  t4: CTD,  t5: CTD,  t6: CTD },
  { divisoes: ['K-1'],                                   t1: 5000,  t2: 3000,  t3: 2000, t4: 1000, t5: 500,  t6: 500 },
  { divisoes: ['M-1'],                                   t1: CTD,   t2: CTD,   t3: CTD,  t4: CTD,  t5: CTD,  t6: CTD },
  { divisoes: ['M-2'],                                   t1: 1000,  t2: 500,   t3: 500,  t4: 300,  t5: 300,  t6: 200 },
  { divisoes: ['M-3'],                                   t1: 5000,  t2: 3000,  t3: 2000, t4: 1000, t5: 500,  t6: 500 },
  { divisoes: ['M-4', 'M-5', 'M-6', 'M-7'],              t1: 750,   t2: CTD,   t3: CTD,  t4: CTD,  t5: CTD,  t6: CTD },
]

// Nota específica 1 do Anexo B (M-2).
export const NOTA_AREA_MAXIMA_M2 = 'A área máxima de compartimentação para edificações do grupo M-2 pode ser substituída quando a edificação for protegida por sistema de chuveiro automático de água ou de espuma, conforme norma específica de Segurança contra Incêndio para líquidos combustíveis e inflamáveis.'

// Notas genéricas do Anexo B.
export const NOTAS_GERAIS_AREA_MAXIMA = {
  a: 'Observar os casos permitidos de substituição da compartimentação de áreas por sistema de chuveiros automáticos, acrescidos, em alguns casos, do sistema de detecção de incêndio, conforme tabelas de exigências da norma técnica específica de Classificação das edificações e áreas de risco e exigências das medidas de segurança contra incêndio, explosão e controle de pânico.',
  b: 'Os locais assinalados com traço ( – ) estão dispensados de áreas máximas de compartimentação, mantendo a compartimentação vertical, de acordo com as tabelas de exigências da norma técnica específica de Classificação das edificações e áreas de risco e exigências das medidas de segurança contra incêndio, explosão e controle de pânico.',
  c: 'A inexistência de compartimentação vertical implica na somatória das áreas dos pavimentos para fins de cálculo da área máxima compartimentada.',
}

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
// Chave usada no checklist da tela — `label` é o texto curto mostrado ao lado
// do checkbox; `texto` é a redação completa da NT, mostrada só sob demanda
// (InfoTip) pra não poluir a lista com parágrafos inteiros.
export const CONDICOES_ESPECIAIS_HORIZONTAL = [
  { key: 'estacionamento_exclusivo', ref: '5.5.1', label: 'Área exclusiva de estacionamento de veículos', texto: 'Área destinada exclusivamente a estacionamento de veículos — compartimentação horizontal dispensada.' },
  { key: 'unidades_autonomas_ei60',  ref: '5.5.2', label: 'Unidades autônomas com parede EI-60', texto: 'Grupos A (A-2/A-3), B e H (H-2/H-3): paredes entre unidades autônomas e áreas comuns com TRRF mínimo de 60 min (EI-60), independente do TRRF da edificação — dispensável se houver chuveiros automáticos (item 5.5.4).' },
  { key: 'subsolo_pcf_p90',          ref: '5.5.7', label: 'Subsolo com PCF P-90', texto: 'Escadas/rampas de circulação vindas de subsolo compartimentadas com PCF P-90 (EI-90) em relação aos demais pisos, independente da área máxima.' },
  { key: 'drywall_acima_6_5m',       ref: '5.5.10', label: 'Drywall acima de 6,5 m', texto: 'Parede de drywall com altura acima de 6,5 m — exige atestado do fabricante e ART/documento de responsabilidade técnica da instalação.' },
]

export const CONDICOES_ESPECIAIS_VERTICAL = [
  { key: 'interligacao_ate_3_pavimentos', ref: '6.5.1', label: 'Interligação de até 3 pavimentos', texto: 'Interligação de até 3 pavimentos consecutivos acima do térreo por átrios, escadas, rampas ou escadas rolantes, desde que a soma das áreas desses pavimentos não ultrapasse a área máxima de compartimentação.' },
  { key: 'subsolo_dutos_shafts',          ref: '6.5.2', label: 'Dutos/shafts do subsolo compartimentados', texto: 'Dutos e shafts de instalações dos subsolos compartimentados integralmente em relação ao térreo, piso de descarga e demais pisos elevados, independente da área máxima.' },
  { key: 'subsolo_pcf_p90',               ref: '6.5.3', label: 'Subsolo com PCF P-90', texto: 'Escadas/rampas de circulação vindas de subsolo compartimentadas com PCF P-90 (EI-90) em relação aos demais pisos, independente da área máxima.' },
  { key: 'dispositivo_enrolar_sprinklers',ref: '7.1',   label: 'Dispositivo de enrolar + chuveiros automáticos', texto: 'Dispositivos automatizados de enrolar corta-fogo só podem substituir portas/vedadores em edificações protegidas por chuveiros automáticos, nas situações do item 7.1 (interligação de até 2 pavimentos, pavimento de estacionamento, ou ampliação de edificação existente).' },
]

// ── Substituição por sistemas alternativos (notas de rodapé da Tabela 6, NT 01 CBMMA) ──
// A NT 01 permite, em várias ocupações/alturas, substituir a exigência de
// compartimentação (horizontal e/ou vertical) por sistemas de proteção
// ativa — texto e combinação exata da nota variam por grupo (ver
// `notasEspecificas` em normas/MA/medidas.js, notas em geral numeradas 2 a 6
// conforme o grupo), mas as três combinações abaixo cobrem a redação mais
// comum encontrada nas tabelas 6B a 6F. `sistemas` = chaves de
// state.sistemas a habilitar (SET_SISTEMA_ESTRUTURA) quando o RT escolhe a
// substituição — a tela não sabe automaticamente qual nota exata (número)
// se aplica ao grupo/altura desta estrutura; cabe ao RT confirmar contra a
// Tabela 6 aplicável antes de marcar.
export const SUBSTITUICOES_COMPARTIMENTACAO = [
  {
    key: 'sprinklers',
    label: 'Chuveiros automáticos',
    sistemas: ['sprinklers'],
    texto: 'Sistema de chuveiros automáticos',
  },
  {
    key: 'deteccao_sprinklers',
    label: 'Detecção de incêndio + Chuveiros automáticos',
    sistemas: ['deteccao', 'sprinklers'],
    texto: 'Sistema de detecção de incêndio e chuveiros automáticos',
  },
  {
    key: 'fumaca_deteccao_sprinklers',
    label: 'Controle de fumaça + Detecção + Chuveiros automáticos',
    sistemas: ['controle_fumaca', 'deteccao', 'sprinklers'],
    texto: 'Sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos',
  },
]
