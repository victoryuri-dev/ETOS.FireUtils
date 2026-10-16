// PB/ocupacoes.js — Classificação das edificações quanto à natureza da
// ocupação (grupos e divisões) — NT 04/2023 CBMPB.
//
// Fonte de verdade: a linha ('PB', 'ocupacoes') de normas_dados no Supabase
// (cadastrada direto no banco). Este arquivo é só o fallback offline/dev —
// cópia fiel daquela linha; ao corrigir um rótulo, corrigir lá primeiro.
//
// CARGADEINCENDIO fica vazio: o mapa de CNAEs da NT 02/2023 CBMPB vem da
// base central quando cadastrado (sistema 'carga_incendio').
export const NORMA = {
  estado: 'PB',
  nome:   'NT 04/2023 CBMPB',
  desc:   'Classificação das Edificações e Áreas de Risco e Exigências das Medidas de Segurança contra Incêndio, Explosão e Controle de Pânico — CBMPB',
}

export const OCUPACOES = {
  'A': {
    descricao: 'Residencial',
    divisoes: {
      'A-1': 'Habitação unifamiliar',
      'A-2': 'Habitação multifamiliar',
      'A-3': 'Habitação coletiva',
    },
  },
  'B': {
    descricao: 'Serviço de Hospedagem',
    divisoes: {
      'B-1': 'Hotel e assemelhado',
      'B-2': 'Hotel residencial',
    },
  },
  'C': {
    descricao: 'Comercial',
    divisoes: {
      'C-1': 'Comércio com carga de incêndio Nível I',
      'C-2': 'Comércio com carga de incêndio Nível II e Nível III',
      'C-3': 'Centro de Compras',
    },
  },
  'D': {
    descricao: 'Serviço Profissional',
    divisoes: {
      'D-1': 'Local para prestação de serviço profissional ou condução de negócios',
      'D-2': 'Agência bancária',
      'D-3': 'Serviço de reparação (exceto os classificados em G-4)',
      'D-4': 'Laboratório',
    },
  },
  'E': {
    descricao: 'Escolar e Cultura Física',
    divisoes: {
      'E-1': 'Escola em geral',
      'E-2': 'Escola especial',
      'E-3': 'Espaço para cultura física',
      'E-4': 'Centro de treinamento profissional',
      'E-5': 'Pré-escola',
      'E-6': 'Escola para portadores de deficiências',
    },
  },
  'F': {
    descricao: 'Local de Reunião de Público',
    divisoes: {
      'F-1':  'Local onde há objeto de valor inestimável',
      'F-2':  'Local religioso e velório',
      'F-3':  'Centro esportivo e de exibição',
      'F-4':  'Estação e terminal de passageiros',
      'F-5':  'Arte cênica e auditório',
      'F-6':  'Clube Social e Salão de Festas',
      'F-7':  'Instalação temporária',
      'F-8':  'Local para refeição',
      'F-9':  'Recreação pública',
      'F-10': 'Exposição de objetos e animais',
      'F-11': 'Boate',
    },
  },
  'G': {
    descricao: 'Serviços Automotivos e Assemelhados',
    divisoes: {
      'G-1': 'Garagem sem acesso de público e sem abastecimento',
      'G-2': 'Garagem com acesso de público e sem abastecimento',
      'G-3': 'Local dotado de abastecimento de combustível',
      'G-4': 'Serviços de conservação, manutenção e reparos',
      'G-5': 'Hangar',
    },
  },
  'H': {
    descricao: 'Serviço de Saúde e Institucional',
    divisoes: {
      'H-1': 'Hospital veterinário e assemelhados',
      'H-2': 'Local onde pessoas requerem cuidados especiais por limitações físicas ou mentais',
      'H-3': 'Hospitais e assemelhado',
      'H-4': 'Repartição pública, edificações das forças armadas e policiais',
      'H-5': 'Local onde a liberdade das pessoas sofre restrições',
      'H-6': 'Clínicas e consutório médico e odontológico',
    },
  },
  'I': {
    descricao: 'Indústria',
    divisoes: {
      'I-1': 'Indústria com carga de incêndio Nível I',
      'I-2': 'Indústria com carga de incêndio Nível II',
      'I-3': 'Indústria com carga de incêndio Nível III',
    },
  },
  'J': {
    descricao: 'Depósito',
    divisoes: {
      'J-1': 'Depósitos de material incombustível',
      'J-2': 'Depósitos com carga de incêndio Nível I',
      'J-3': 'Depósitos com carga de incêndio Nível II',
      'J-4': 'Depósitos com carga de incêndio Nível III',
    },
  },
  'K': {
    descricao: 'Energia',
    divisoes: {
      'K-1': 'Central de transmissão e distribuição de energia',
    },
  },
  'L': {
    descricao: 'Explosivo',
    divisoes: {
      'L-1': 'Comércio',
      'L-2': 'Indústria',
      'L-3': 'Depósito',
      'L-4': 'Show Pirotécnico',
    },
  },
  'M': {
    descricao: 'Especial',
    divisoes: {
      'M-1': 'Túnel',
      'M-2': 'Tanques ou Parques de Tanques',
      'M-3': 'Central de comunicação',
      'M-4': 'Canteiro de obras',
      'M-5': 'Silos',
      'M-6': 'Floresta nativa ou cultivada',
      'M-7': 'Pátio de Contêineres',
    },
  },
}

export const CARGADEINCENDIO = {}
