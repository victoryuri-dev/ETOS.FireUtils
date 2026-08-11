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

// ── Método simplificado de dimensionamento do aclaramento ──────────────────
// área coberta (m²) por luminária ≈ fluxo luminoso (lm) × fator de
// utilização ÷ iluminância mínima exigida (lux). Fator de referência —
// ajustar quando houver dado fotométrico do fabricante ou tabela específica
// da NT vigente (Anexo B da NBR 10898).
export const FATOR_UTILIZACAO_ACLARAMENTO = 0.5

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
  { key: 'potenciaW',       label: 'Potência',                          unidade: 'W'  },
  { key: 'tensaoV',         label: 'Tensão',                            unidade: 'V'  },
  { key: 'fluxoLuminosoLm', label: 'Fluxo luminoso nominal',            unidade: 'lm' },
  { key: 'anguloDispersao', label: 'Ângulo de dispersão da luz' },
  { key: 'vidaUtilH',       label: 'Vida útil do elemento gerador de luz' },
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
