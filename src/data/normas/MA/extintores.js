// normas/MA/extintores.js — NT 21 CBMMA, Sistema de Proteção por Extintores de
// Incêndio. Texto normativo transcrito a partir do modelo adotado em comum
// por vários Corpos de Bombeiros estaduais (a própria NT cita como referência
// a IT 21 do CB-PMESP e a NBR 12693) — confira contra a NT 21 CBMMA vigente
// antes de aplicar em projeto real.

// ── Limiares de carga de incêndio (MJ/m²) usados para classificar o risco —
// mesma tabela usada na Etapa 5 (Carga de Incêndio): baixo <=300, médio
// <=1200, alto >1200.
export const LIMIARES_RISCO = { baixo: 300, medio: 1200 }

// ── Distância máxima a percorrer até o extintor (itens 5.1.2, 5.1.3.1 e 5.1.5) ──
export const DISTANCIA_MAXIMA = {
  portatil:   { baixo: 25, medio: 20, alto: 15 },
  sobreRodas: { baixo: 35, medio: 30, alto: 20 },
  classeD: 20,
}

// ── Extintores portáteis — capacidade extintora mínima para constituir uma
// unidade extintora (item 5.1.1) ──
export const TIPOS_PORTATIL = [
  { key: 'agua',       label: 'Água',                     capacidadeMinima: '2-A',        classes: ['A'] },
  { key: 'espuma',     label: 'Espuma mecânica',           capacidadeMinima: '2-A:10-B',   classes: ['A', 'B'] },
  { key: 'co2',        label: 'Dióxido de carbono (CO₂)',  capacidadeMinima: '5-B:C',      classes: ['B', 'C'] },
  { key: 'po_bc',      label: 'Pó químico BC',             capacidadeMinima: '20-B:C',     classes: ['B', 'C'] },
  { key: 'po_abc',     label: 'Pó químico ABC',            capacidadeMinima: '2-A:20-B:C', classes: ['A', 'B', 'C'] },
  { key: 'halogenado', label: 'Compostos halogenados',     capacidadeMinima: '5-B:C',      classes: ['B', 'C'] },
]

// ── Extintores sobre rodas / carretas — capacidade extintora mínima (item 5.1.4) ──
export const TIPOS_SOBRE_RODAS = [
  { key: 'agua',   label: 'Água',                    capacidadeMinima: '10-A',        classes: ['A'] },
  { key: 'espuma', label: 'Espuma mecânica',          capacidadeMinima: '6-A:40-B',    classes: ['A', 'B'] },
  { key: 'co2',    label: 'Dióxido de carbono (CO₂)', capacidadeMinima: '10-B:C',      classes: ['B', 'C'] },
  { key: 'po_bc',  label: 'Pó químico BC',            capacidadeMinima: '80-B:C',      classes: ['B', 'C'] },
  { key: 'po_abc', label: 'Pó químico ABC',           capacidadeMinima: '6-A:80-B:C',  classes: ['A', 'B', 'C'] },
]

// ── Altura de instalação (itens 5.2.1.1 e 5.2.1.3) ──
export const ALTURA_INSTALACAO = {
  suporteParede: { alturaMaxima: 1.6, alturaMinimaBase: 0.2 },
  apoiadoPiso:   { min: 0.10, max: 0.20 },
}

// ── Área máxima do pavimento para admitir unidade extintora única de classe
// específica, conforme risco predominante (item 5.2.1.4.2) ──
export const AREA_LIMITE_UNIDADE_UNICA = { alto: 150, demais: 250 }

// ── Proporção entre risco predominante e risco secundário (item 5.2.1.5) ──
export const PROPORCAO_RISCO_SECUNDARIO = { predominante: 2, secundario: 1 }

// ── Locais de risco especial que exigem extintor próprio, independente da
// proteção geral da edificação (item 5.2.1.9) ──
export const LOCAIS_RISCO_ESPECIAL = [
  'Casa de caldeira', 'Casa de bombas', 'Casa de força elétrica', 'Casa de máquinas',
  'Galeria de transmissão', 'Incinerador', 'Elevador (casa de máquinas)', 'Ponte rolante',
  'Escada rolante (casa de máquinas)', 'Quadro de redução para baixa tensão', 'Transformadores',
  'Contêineres de telefonia',
]

export const DISTANCIA_ENTRADA_ESCADA = 5 // item 5.2.1.9.2

export const NOTAS = {
  minimoPorPavimento:  'Item 5.2.1.4, NT 21 CBMMA — cada pavimento deve possuir no mínimo duas unidades extintoras: uma para incêndio classe A e outra para incêndio classes B e C.',
  substituicaoABC:     'Item 5.2.1.4.1, NT 21 CBMMA — o extintor de pó ABC pode substituir qualquer tipo de extintor de classes específicas (A, B ou C).',
  unidadeUnica:        'Item 5.2.1.4.2, NT 21 CBMMA — permitida uma única unidade extintora de classe específica por pavimento conforme o risco predominante, dentro do limite de área.',
  proporcaoSecundario: 'Item 5.2.1.5, NT 21 CBMMA — os extintores devem ser intercalados na proporção de dois para o risco predominante e um para o risco secundário.',
  combinacaoUnidades:  'Item 5.2.1.8, NT 21 CBMMA — as unidades extintoras devem corresponder a um só extintor; não são aceitas combinações de dois ou mais extintores, exceto espuma mecânica, onde é permitido somar até dois extintores.',
  classeD:             'Item 5.1.3, NT 21 CBMMA — o dimensionamento para classe D deve ser baseado no metal combustível, no tamanho de suas partículas e na área a proteger, conforme recomendação do fabricante do agente extintor.',
  entradaEscada:       'Item 5.2.1.9.2, NT 21 CBMMA — deve ser instalado pelo menos um extintor a não mais de 5 m da entrada principal da edificação e das escadas nos demais pavimentos.',
}
