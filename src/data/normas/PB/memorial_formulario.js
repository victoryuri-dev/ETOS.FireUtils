// PB/memorial_formulario.js — Parâmetros normativos do formulário "Memorial
// Descritivo do Projeto de Segurança Contra Incêndio" do CBMPB (DSPCI —
// Seção de Análise de Projeto), modelo enviado pelo usuário (PDF).
//
// A Paraíba não aceita memorial em texto corrido como o do Maranhão: o
// memorial é um formulário fixo, de marcar X e preencher campos curtos. O
// layout do formulário (ordem das seções, rótulos das linhas) fica no código
// (data/memorial/PB/formulario.js); aqui ficam só os PARÂMETROS que decidem o
// que é marcado — faixas de altura, de carga de incêndio, classes de GLP,
// linhas do CMAR, capacidade extintora por nível e a lista de riscos
// especiais. Todos transcritos do próprio formulário (que por sua vez remete
// às NTs CBMPB citadas em cada seção), não de outra norma.
//
// Fonte do seed (e fixture de teste) da linha ('PB', 'memorial_formulario') de
// normas_dados — ver supabase/migrations/*seed_normas_memorial_formulario_pb*.

export const NORMA = {
  estado: 'PB',
  nome:   'Memorial Descritivo do Projeto de Segurança Contra Incêndio — CBMPB',
  orgao:  'Corpo de Bombeiros Militar da Paraíba — CBMPB',
  diretoria: 'Diretoria de Segurança e Prevenção Contra Incêndio – DSPCI',
  secao:  'Seção de Análise de Projeto',
}

// 2. Forma de apresentação.
export const FORMAS_APRESENTACAO = [
  { key: 'pci',    label: 'Projeto de Segurança contra Incêndio - PCI' },
  { key: 'ptiot',  label: 'Projeto Técnico para Instalação e Ocupação Temporária (PTIOT)' },
  { key: 'ptotep', label: 'Projeto Técnico para Ocupação Temporária em Edificação Permanente (PTOTEP)' },
]

// 3.1 — divisões da classificação que o formulário NÃO lista (a NT 04/2023
// tem, o formulário não tem linha pra marcar). Ficam citadas na observação
// livre da seção em vez de sumirem do documento.
export const DIVISOES_FORA_DO_FORMULARIO = ['A-1']

// 3.2 Altura entre o nível de descarga e o piso do último pavimento
// habitável (item 4.1 da NT CBMPB 04). `max` em metros, inclusivo; o Tipo I
// é a edificação térrea. Acima de 30 m o formulário não tem linha.
export const CLASSES_ALTURA = [
  { classe: 'I',   nome: 'Edificação térrea',                               max: 0  },
  { classe: 'II',  nome: 'Edificação baixa (H ≤ 6m)',                       max: 6  },
  { classe: 'III', nome: 'Edificação baixa –média altura (6m < H ≤ 12m)',   max: 12 },
  { classe: 'IV',  nome: 'Edificação de média altura (12m < H ≤ 23m)',      max: 23 },
  { classe: 'V',   nome: 'Edificação medianamente alta (23m < H ≤ 30m)',    max: 30 },
]

// 3.4 Risco da edificação e validade de inspeção (Anexo B da NT CBMPB
// 02/2023) e 3.5 Carga de incêndio (Anexos A e C da mesma NT). `max` em
// MJ/m², inclusivo; null = sem teto.
export const RISCOS_VALIDADE = [
  { risco: 'baixo', label: 'Baixo', validade: 'Validade 5 (cinco) anos para nova vistoria', max: 300  },
  { risco: 'medio', label: 'Médio', validade: 'Validade 2 (dois) anos para nova vistoria',  max: 1200 },
  { risco: 'alto',  label: 'Alto',  validade: 'Validade 1 (um) ano para nova vistoria',     max: null },
]
export const NIVEIS_CARGA = [
  { nivel: 'I',   label: 'Carga incêndio total da edificação até 300 MJ/m²',               max: 300  },
  { nivel: 'II',  label: 'Carga incêndio total da edificação de 301 MJ/m² até 1200MJ/m²',  max: 1200 },
  { nivel: 'III', label: 'Carga incêndio total da edificação acima de 1200 MJ/m²',         max: null },
]

// 3.4.1 Classes de risco para revenda de GLP (Tabela 1 da ABNT NBR 15514).
// O formulário divide as classes em duas colunas (EXIGÍVEL / NÃO EXIGÍVEL);
// `coluna` só reproduz essa posição. A 4ª linha da coluna da esquerda vem
// impressa como "CLASSE VI" no modelo do CBMPB — é a Classe IV da NBR
// 15514 (até 12.480 kg), corrigido aqui.
export const CLASSES_GLP = [
  { key: 'I',        label: 'CLASSE I – Até 520 kg',          coluna: 'exigivel'     },
  { key: 'II',       label: 'CLASSE II – Até 1.560 kg',       coluna: 'exigivel'     },
  { key: 'III',      label: 'CLASSE III – Até 6.240 kg',      coluna: 'exigivel'     },
  { key: 'IV',       label: 'CLASSE IV – Até 12.480 kg',      coluna: 'exigivel'     },
  { key: 'V',        label: 'CLASSE V – Até 24.960 kg',       coluna: 'nao_exigivel' },
  { key: 'VI',       label: 'CLASSE VI – Até 49.920 kg',      coluna: 'nao_exigivel' },
  { key: 'VII',      label: 'CLASSE VII – Até 99.840 kg',     coluna: 'nao_exigivel' },
  { key: 'especial', label: 'ESPECIAL – Acima de 99.840 kg',  coluna: 'nao_exigivel' },
]

// 3.6 Estágio de construção da edificação.
export const ESTAGIOS_CONSTRUCAO = [
  { key: 'a_construir',     label: 'A edificação ainda será construída' },
  { key: 'existente_nt16',  label: 'A edificação já é existente (as built) e terá adaptações descritas na NT 16/2018 CBMPB' },
  { key: 'existente_atual', label: 'A edificação já é existente (as built) e seguirá a segurança contra incêndio atual' },
  { key: 'existente_rt',    label: 'A edificação já é existente (as built) e utilizará as Resoluções Técnicas do CBMPB' },
  { key: 'ptiot',           label: 'Projeto Técnico para Instalação e Ocupação Técnica (PTIOT)' },
  { key: 'ptotep',          label: 'Projeto Técnico para Ocupação Temporária em Edificação Permanente (PTOTEP)' },
]

// 5. Riscos especiais — chaves compartilhadas com o MA quando o risco é o
// mesmo (liquidos_inflamaveis, glp...), pra um projeto que troca de UF não
// perder o que já foi marcado; as quatro últimas só existem na PB.
export const RISCOS_ESPECIAIS = [
  { key: 'liquidos_inflamaveis',        label: 'Armazenamento de líquidos inflamáveis' },
  { key: 'fogos_artificio',             label: 'Fogos de artifício' },
  { key: 'produtos_perigosos',          label: 'Armazenamento de produtos perigosos' },
  { key: 'vasos_pressao',               label: 'Vaso sob pressão (caldeira, O₂,)' },
  { key: 'glp',                         label: 'Gás Liquefeito de Petróleo - GLP' },
  { key: 'outros',                      label: 'Outros (especificar):' },
  { key: 'tendas_inflamaveis',          label: 'Tendas ou coberturas inflamáveis' },
  { key: 'geradores_eletricos',         label: 'Geradores elétricos' },
  { key: 'estrutura_montada',           label: 'Sistemas de estrutura montada' },
  { key: 'sistemas_eletricos_montados', label: 'Sistemas elétricos montados (som,iluminação, etc...)' },
]

// 9. CMAR (Tabela B.1 da NT CBMPB nº 09/2024) — uma linha por conjunto de
// ocupações. `ocupacoes` aceita grupo ("A") ou divisão ("I-1").
export const CMAR_LINHAS = [
  { key: 'a', ocupacoes: ['A'],
    texto: 'Natureza da ocupação A e Cond. Residencial (Classe I, II-A, III-A ou IV-A no Piso; ClasseI, II-A ou III-A na Parede, Classe I, II-A ou III-A no Teto e Fachada Classe I a II-B)' },
  { key: 'b', ocupacoes: ['B', 'D', 'E', 'G', 'H', 'I-1', 'J-1', 'J-2'],
    texto: 'Natureza da ocupação B, D, E, G, H, I1, J1 e J2 (Classe I, II-A, III-A ou IV-A no Piso;Classe I ou II-A na Parede, Classe I ou II-A no Teto e Fachada Classe I a II-B)' },
  { key: 'c', ocupacoes: ['C', 'F', 'I-2', 'I-3', 'J-3', 'J-4', 'L-1', 'M-2', 'M-3'],
    texto: 'Natureza da ocupação C, F, I2, I3, J3, J4, L1, M2 e M3 (Classe I, II-A, III-A ou IV-A no Piso;Classe I ou II-A na Parede, Classe I ou II-A no Teto e Fachada Classe I a II-B)' },
]

// 11.1 Plano de emergência (NT CBMPB 13/2023).
export const MODELOS_PLANO = [
  { key: 'item6',  label: 'Foi elaborado conforme determina as prescrições do item 6 NT 13/2023' },
  { key: 'anexoB', label: 'Foi utilizado como modelo do anexo B da NT 13/2023' },
]

// 16. Extintores (NT CBMPB 21/2024) — capacidade extintora mínima pelo
// nível de carga de incêndio (3.5). O nível III tem duas opções no
// formulário; o RT escolhe qual adotou (memorialPB.extintorNivelIII).
export const EXTINTORES_NIVEL = [
  { key: 'nivel_I',      nivel: 'I',   texto: 'Edificação de nível I com capacidade extintora mínima de 2A e 20BC' },
  { key: 'nivel_II',     nivel: 'II',  texto: 'Edificação de nível II com capacidade extintora mínima de 3A e 40BC' },
  { key: 'nivel_III_3A', nivel: 'III', texto: 'Edificação de nível III com capacidade extintora mínima de 3A e 40BC', detalhe: '(diminuindo distância máxima a ser percorrido, observar a NT 21)' },
  { key: 'nivel_III_4A', nivel: 'III', texto: 'Edificação de nível III com capacidade extintora mínima de 4A e 80BC' },
]
