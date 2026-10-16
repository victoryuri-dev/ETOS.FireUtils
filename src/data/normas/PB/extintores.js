// normas/PB/extintores.js — NT 21/2024 CBMPB, Sistema de Proteção por
// Extintores. Fonte do seed da linha ('PB','extintores') do Supabase.
//
// Transcrito da NT 21/2024 (tabelas enviadas pelo usuário): Tabela 1
// (portáteis), Tabela 2 (sobre rodas), Tabela 3 (níveis de carga) e Tabelas
// 4 e 5 (unidade extintora e distância por nível, classes A e B).
//
// ⚠ Itens que NÃO vieram da NT da PB — copiados do MA (normas/MA/extintores.js),
// por decisão do usuário, até serem conferidos com a NT 21/2024: distância
// para sobre rodas e classe D, altura de instalação, área-limite da unidade
// única, proporção predominante/secundário, locais de risco especial,
// distância da entrada/escadas, notas (sem número de item) e os extintores
// classe K (não estão na Tabela 1; mantidos pelas famílias do plugin Revit).

export const NORMA = { sigla: 'NT 21/2024 CBMPB', nome: 'Sistema de Proteção por Extintores' }

// Tabela 3: nível I até 300 MJ/m², II até 1200, III acima (= baixo/médio/alto).
export const LIMIARES_RISCO = { baixo: 300, medio: 1200 }

// Tabelas 4 e 5: por nível, a(s) combinação(ões) de capacidade mínima e
// distância máxima para as classes A e B. O nível III tem duas opções —
// a escolhida pelo RT (memorialPB.extintorNivelIII = key) define a
// distância; sem escolha, vale a primeira (a mais restritiva em distância).
export const CAPACIDADE_POR_NIVEL = {
  baixo: [{ key: 'nivel_I',  A: { capacidade: '2-A', distanciaMaxima: 20 }, B: { capacidade: '20-B', distanciaMaxima: 15 } }],
  medio: [{ key: 'nivel_II', A: { capacidade: '3-A', distanciaMaxima: 20 }, B: { capacidade: '40-B', distanciaMaxima: 15 } }],
  alto: [
    { key: 'nivel_III_3A', A: { capacidade: '3-A', distanciaMaxima: 15 }, B: { capacidade: '40-B', distanciaMaxima: 10 } },
    { key: 'nivel_III_4A', A: { capacidade: '4-A', distanciaMaxima: 20 }, B: { capacidade: '80-B', distanciaMaxima: 15 } },
  ],
}

// Portátil = classe A da Tabela 4 (nível III pela primeira opção); sobre
// rodas e classe D: valores do MA (⚠).
export const DISTANCIA_MAXIMA = {
  portatil:   { baixo: 20, medio: 20, alto: 15 },
  sobreRodas: { baixo: 35, medio: 30, alto: 20 },
  classeD: 20,
}

// Tabela 1 (+ classe K do MA, ⚠).
export const TIPOS_PORTATIL = [
  { key: 'agua',       label: 'Água',                     capacidadeMinima: '2-A',        classes: ['A'] },
  { key: 'espuma',     label: 'Espuma mecânica',           capacidadeMinima: '2-A:10-B',   classes: ['A', 'B'] },
  { key: 'co2',        label: 'Dióxido de carbono (CO₂)',  capacidadeMinima: '5-B:C',      classes: ['B', 'C'] },
  { key: 'po_bc',      label: 'Pó químico BC',             capacidadeMinima: '20-B:C',     classes: ['B', 'C'] },
  { key: 'po_abc',     label: 'Pó químico ABC',            capacidadeMinima: '2-A:20-B:C', classes: ['A', 'B', 'C'] },
  { key: 'halogenado', label: 'Compostos halogenados',     capacidadeMinima: '5-B:C',      classes: ['B', 'C'] },
  { key: 'k_1a',       label: 'Classe K — 1-A:K',          capacidadeMinima: '1-A:K - 6L', classes: ['A', 'K'] },
  { key: 'k_2a',       label: 'Classe K — 2-A:K',          capacidadeMinima: '2-A:K - 6L', classes: ['A', 'K'] },
]

// Tabela 2 (item 5.1.2).
export const TIPOS_SOBRE_RODAS = [
  { key: 'agua',   label: 'Água',                    capacidadeMinima: '10-A',        classes: ['A'] },
  { key: 'espuma', label: 'Espuma mecânica',          capacidadeMinima: '6-A:40-B',    classes: ['A', 'B'] },
  { key: 'co2',    label: 'Dióxido de carbono (CO₂)', capacidadeMinima: '10-B:C',      classes: ['B', 'C'] },
  { key: 'po_bc',  label: 'Pó químico BC',            capacidadeMinima: '80-B:C',      classes: ['B', 'C'] },
  { key: 'po_abc', label: 'Pó químico ABC',           capacidadeMinima: '6-A:80-B:C',  classes: ['A', 'B', 'C'] },
]

// ⚠ Daqui em diante: valores do MA, a conferir com a NT 21/2024.
export const ALTURA_INSTALACAO = {
  suporteParede: { alturaMaxima: 1.6, alturaMinimaBase: 0.2 },
  apoiadoPiso:   { min: 0.10, max: 0.20 },
}

export const AREA_LIMITE_UNIDADE_UNICA = { alto: 150, demais: 250 }

export const PROPORCAO_RISCO_SECUNDARIO = { predominante: 2, secundario: 1 }

export const LOCAIS_RISCO_ESPECIAL = [
  'Casa de caldeira', 'Casa de bombas', 'Casa de força elétrica', 'Casa de máquinas',
  'Galeria de transmissão', 'Incinerador', 'Elevador (casa de máquinas)', 'Ponte rolante',
  'Escada rolante (casa de máquinas)', 'Quadro de redução para baixa tensão', 'Transformadores',
  'Contêineres de telefonia',
]

export const DISTANCIA_ENTRADA_ESCADA = 5

export const NOTAS = {
  minimoPorPavimento:  'NT 21/2024 CBMPB — cada pavimento deve possuir no mínimo duas unidades extintoras: uma para incêndio classe A e outra para incêndio classes B e C.',
  substituicaoABC:     'NT 21/2024 CBMPB — o extintor de pó ABC pode substituir qualquer tipo de extintor de classes específicas (A, B ou C).',
  unidadeUnica:        'NT 21/2024 CBMPB — permitida uma única unidade extintora de classe específica por pavimento conforme o risco predominante, dentro do limite de área.',
  proporcaoSecundario: 'NT 21/2024 CBMPB — os extintores devem ser intercalados na proporção de dois para o risco predominante e um para o risco secundário.',
  combinacaoUnidades:  'NT 21/2024 CBMPB — as unidades extintoras devem corresponder a um só extintor; não são aceitas combinações de dois ou mais extintores, exceto espuma mecânica, onde é permitido somar até dois extintores.',
  classeD:             'NT 21/2024 CBMPB — o dimensionamento para classe D deve ser baseado no metal combustível, no tamanho de suas partículas e na área a proteger, conforme recomendação do fabricante do agente extintor.',
  entradaEscada:       'NT 21/2024 CBMPB — deve ser instalado pelo menos um extintor a não mais de 5 m da entrada principal da edificação e das escadas nos demais pavimentos.',
}
