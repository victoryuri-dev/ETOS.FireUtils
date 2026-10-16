// normas/PB/iluminacao.js — NT 18/2024 CBMPB, Iluminação de Emergência
// (Portaria nº 002/2024-GCG). Fonte do seed da linha ('PB','iluminacao') do
// Supabase — o site não lê este arquivo. Transcrito do PDF enviado pelo
// usuário. Mesmo formato do MA (normas/MA/iluminacao.js).
//
// A NT da PB não tem tabelas: remete à NBR 10898 e fixa parâmetros próprios
// (itens 5.4 e 6.2–6.4). Uniformidade e tempo de resposta não constam da
// NT — valores da NBR 10898, os mesmos do MA. Autonomia: 2 h, a que o
// próprio formulário do memorial do CBMPB pede (item 13, NBR 10898/2023).
// Equipamentos e presets são de catálogo de fabricante (iguais ao MA).

export const NORMA = { sigla: 'NT 18/2024 CBMPB' }

// Itens 5.1 a 5.3: GMG, centralizado com baterias e blocos autônomos.
export const TIPOS_SISTEMA = [
  { key: 'bloco_autonomo', label: 'Bloco autônomo',
    descricao: 'Luminária com bateria própria (chumbo-ácido selada ou níquel-cádmio, isenta de manutenção — item 5.3).' },
  { key: 'central', label: 'Sistema centralizado com baterias',
    descricao: 'Fonte e comandos em local não acessível ao público, sem risco de incêndio e ventilado (item 5.2).' },
  { key: 'motogerador', label: 'Grupo motogerador (GMG)',
    descricao: 'Com tempo de comutação acima do da NBR 10898, exige também sistema centralizado por bateria ou bloco autônomo (item 5.1.5).' },
]

// Item 6.2: 3 lux em locais planos e 5 lux em locais com desnível. As chaves
// são as mesmas do MA; ROTULOS_ILUMINANCIA diz o que cada uma significa aqui.
export const ILUMINANCIA_MINIMA = {
  aclaramento_normal: 3,
  aclaramento_risco:  5,
}
export const ROTULOS_ILUMINANCIA = {
  aclaramento_normal: 'Locais planos (corredores, halls, áreas de refúgio)',
  aclaramento_risco:  'Locais com desnível (escadas, passagens com obstáculos)',
}

// NBR 10898 (a NT 18/2024 não altera).
export const RAZAO_UNIFORMIDADE_MAX = 40
// Formulário do memorial do CBMPB, item 13 (NBR 10898/2023).
export const AUTONOMIA_MINIMA_HORAS = 2
export const TEMPO_RESPOSTA_MAX_S = 5

// Item 5.4.1 a): espaçamento máximo entre pontos de aclaramento.
export const DISTANCIA_MAXIMA_PONTOS_M = 15
export const DISTANCIA_MAXIMA_PAREDE_M = 7.5
// Item 6.3: tensão máxima das luminárias em áreas com carga de incêndio.
export const TENSAO_MAXIMA_V = 30

// ── Equipamentos de aclaramento aceitos ─────────────────────────────────────
// Apenas dois tipos de equipamento — os dados técnicos de cada um (lâmpada,
// potência, tensão, fluxo luminoso, ângulo de dispersão, vida útil) variam
// por fabricante/modelo e por isso são preenchidos pelo projetista por
// item de pavimento (categoria 'aclaramento' em state.iluminacao), não
// fixados aqui.
export const EQUIPAMENTOS_ACLARAMENTO = [
  { key: 'luminaria_30leds', label: 'Luminária de Emergência 30 LEDs' },
  { key: 'bloco_emergencia', label: 'Bloco de Iluminação de Emergência' },
]

// ── Dados técnicos exigidos por equipamento (item 5.2, NBR 10898) ──────────
// Usado tanto no formulário de especificação quanto na tabela do memorial —
// nunca duas fontes de verdade para os rótulos.
export const CAMPOS_EQUIPAMENTO = [
  { key: 'tipoLampada',     label: 'Tipo de lâmpada' },
  { key: 'potenciaW',       label: 'Potência',               unidade: 'W'  },
  { key: 'tensaoV',         label: 'Tensão',                 unidade: 'V'  },
  { key: 'fluxoLuminosoLm', label: 'Fluxo luminoso nominal', unidade: 'lm' },
  { key: 'autonomia',       label: 'Autonomia' },
]

// ── Presets de especificação por equipamento ────────────────────────────────
// Valores de catálogo de fabricante, transcritos das fichas técnicas
// informadas pelo usuário — ponto de partida para o formulário; o
// projetista pode editar livremente após escolher um preset. `potenciaW`/
// `tensaoV`/`autonomia` são texto livre (não entram em cálculo); só
// `fluxoLuminosoLm` precisa ser numérico (usado no dimensionamento por área).
export const PRESETS_EQUIPAMENTO = [
  {
    key: 'luminaria_30leds_100lm', tipoBase: 'luminaria_30leds', label: '30 LEDs SMD — 100 lm',
    tipoLampada: '30 LEDs SMD', potenciaW: '6', tensaoV: '100-240',
    fluxoLuminosoLm: '100', autonomia: '3h fluxo máximo / 6h fluxo mínimo',
  },
  {
    key: 'bloco_2200lm', tipoBase: 'bloco_emergencia', label: '2200 lm',
    tipoLampada: '2 × 70 LEDs autobrilho', potenciaW: '2× 7,65', tensaoV: '100-240',
    fluxoLuminosoLm: '2200', autonomia: '>2 horas',
  },
  {
    key: 'bloco_1200lm', tipoBase: 'bloco_emergencia', label: '1200 lm',
    tipoLampada: '2 × 35 LEDs autobrilho', potenciaW: '2× 4,4', tensaoV: '100-240',
    fluxoLuminosoLm: '1200', autonomia: '>2 horas',
  },
  {
    key: 'bloco_600lm', tipoBase: 'bloco_emergencia', label: '600 lm',
    tipoLampada: '2 × 40 LEDs autobrilho', potenciaW: '2× 2', tensaoV: '100-240',
    fluxoLuminosoLm: '600', autonomia: '>2 horas',
  },
  {
    key: 'bloco_400lm', tipoBase: 'bloco_emergencia', label: '400 lm',
    tipoLampada: '2 × 40 LEDs autobrilho', potenciaW: '2× 1,4', tensaoV: '100-240',
    fluxoLuminosoLm: '400', autonomia: '>3 horas',
  },
]

export const NOTAS = {
  aclaramento:   'Item 6.2, NT 18/2024 CBMPB — nível mínimo de iluminamento de 3 lux em locais planos (corredores, halls, áreas de refúgio) e 5 lux em locais com desnível (escadas ou passagens com obstáculos).',
  espacamento:   'Item 5.4.1 a) — a distância máxima entre os pontos de iluminação de aclaramento não deve ultrapassar 15 m, e entre o ponto e a parede, 7,5 m; outro distanciamento pode ser adotado desde que atenda à NBR 10898.',
  isencaoSalas:  'Item 5.4.1 b) — salas com área igual ou inferior a 50 m² e população inferior a 50 pessoas estão isentas, desde que as saídas sejam diretas para o corredor.',
  balizamento:   'Item 5.4.2 — a luminária de balizamento que atenda 3 lux dispensa a de aclaramento no mesmo local; acima das portas de saída em ambientes fechados com lotação superior a 100 pessoas nas ocupações F-3, F-5, F-6, F-7, F-10 e F-11, as luminárias devem ser de balizamento, permanentemente acesas durante a utilização do ambiente.',
  tensao:        'Item 6.3 — tensão máxima de 30 V nas luminárias de aclaramento e balizamento em áreas com carga de incêndio, exceto blocos autônomos; em instalações existentes, sem como reduzir a tensão, admite-se interruptor diferencial de 30 mA com disjuntor termomagnético de 10 A (item 6.4).',
  tubulacao:     'Item 6.1 — em instalação aparente, tubulação e caixas de passagem metálicas ou em PVC rígido antichama (NBR 15465).',
  autonomia:     `Autonomia mínima do sistema de ${AUTONOMIA_MINIMA_HORAS} horas (NBR 10898/2023, conforme o formulário do memorial do CBMPB).`,
  tempoResposta: `O sistema deve entrar em plena operação em no máximo ${TEMPO_RESPOSTA_MAX_S} segundos após a falta de energia da rede normal (NBR 10898).`,
}
