// normas/MA/iluminacao.js — NT 18 CBMMA, Sistema de Iluminação de Emergência.
// Parâmetros técnicos baseados na NBR 10898 (Sistema de iluminação de
// emergência) — a norma estadual adota os mesmos critérios técnicos da NBR,
// variando principalmente os tipos de sistema aceitos pelo Corpo de
// Bombeiros. Confira contra a NT 18 CBMMA vigente antes de aplicar em
// projeto real.

// ── Tipos de sistema aceitos pelo CBMMA ─────────────────────────────────────
export const TIPOS_SISTEMA = [
  { key: 'bloco_autonomo', label: 'Bloco autônomo',
    descricao: 'Luminária com bateria e circuito de acionamento próprios — não depende de central.' },
  { key: 'central', label: 'Sistema centralizado',
    descricao: 'Central de baterias alimentando luminárias por circuito elétrico dedicado e exclusivo.' },
  { key: 'motogerador', label: 'Grupo motogerador',
    descricao: 'Gerador a combustão — sistema complementar; não substitui a autonomia de bateria da iluminação de emergência.' },
]

// ── Iluminância mínima (lux) — NBR 10898 ────────────────────────────────────
export const ILUMINANCIA_MINIMA = {
  balizamento:        3,  // no eixo do percurso de saída (piso)
  aclaramento_normal: 5,  // ambientes em geral
  aclaramento_risco:  10, // áreas de risco elevado / grande concentração de público
}

// Relação máxima entre o ponto mais e o menos iluminado do ambiente
export const RAZAO_UNIFORMIDADE_MAX = 40 // 40:1

// ── Autonomia mínima da bateria (horas) — NBR 10898 ─────────────────────────
export const AUTONOMIA_MINIMA_HORAS = 1

// Tempo máximo para o sistema entrar em plena operação após a falta de energia
export const TEMPO_RESPOSTA_MAX_S = 5

// ── Equipamentos de aclaramento aceitos ─────────────────────────────────────
// Apenas dois tipos de equipamento — os dados técnicos de cada um (lâmpada,
// potência, tensão, fluxo luminoso, ângulo de dispersão, vida útil) variam
// por fabricante/modelo e por isso são preenchidos pelo projetista por
// projeto (state.iluminacaoSistema.equipamentos), não fixados aqui.
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

// ── Pontos de balizamento obrigatórios (checklist por pavimento) ───────────
// Cada ponto existente no pavimento deve ter luminária de balizamento própria.
export const PONTOS_BALIZAMENTO = [
  { key: 'mudanca_direcao', label: 'Mudança de direção' },
  { key: 'escada',          label: 'Escada / mudança de nível' },
  { key: 'porta_saida',     label: 'Porta de saída' },
  { key: 'equipamento',     label: 'Equipamento de combate a incêndio (extintor, hidrante, alarme)' },
  { key: 'intersecao',      label: 'Interseção de corredores' },
  { key: 'outro',           label: 'Outro ponto de risco' },
]

export const NOTAS = {
  aclaramento:  'NBR 10898 — a iluminação de aclaramento deve garantir o reconhecimento de obstáculos e o trajeto até a saída, com iluminância mínima de 5 lux nos ambientes em geral e 10 lux em áreas de risco elevado ou grande concentração de público, respeitada a uniformidade máxima de 40:1.',
  balizamento:  'NBR 10898 — todo ponto de mudança de direção, mudança de nível, porta de saída, equipamento de combate a incêndio e interseção de corredores deve possuir luminária de balizamento própria, com iluminância mínima de 3 lux no eixo do percurso.',
  autonomia:    `Autonomia mínima da bateria de ${AUTONOMIA_MINIMA_HORAS} hora, conforme NBR 10898. Ocupações específicas podem exigir autonomia estendida — confirmar contra a NT 18 CBMMA vigente.`,
  tempoResposta: `O sistema deve entrar em plena operação em no máximo ${TEMPO_RESPOSTA_MAX_S} segundos após a falta de energia da rede normal.`,
}
