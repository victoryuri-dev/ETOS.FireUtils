// PB/ocupacoes.js — Classificação de ocupações (grupos e divisões).
//
// A NT 12/2025 CBMPB (Saída de Emergência) não define ela mesma essa
// classificação — remete a uma norma técnica específica de Classificação
// das Edificações e Áreas de Risco (nota (O) da Tabela 1 do Anexo A), que
// ainda não está nesta base. Os códigos/descrições abaixo são os do
// esquema nacional (grupos A–M) compartilhado com o Maranhão — ambos os
// estados citam a mesma referência (Instrução Técnica Nº 11/2019 CBPMESP,
// seção 3 da NT 12/2025) — reaproveitados daqui até a norma de
// Classificação da PB entrar na base. CARGADEINCENDIO fica vazio de
// propósito: mapeamento de CNAE é outro levantamento, fora do escopo do
// dimensionamento de saída de emergência.
export const NORMA = {
  estado: 'PB',
  nome:   'NT 12/2025 CBMPB',
  desc:   'Norma Tecnica de Saida de Emergencia — CBMPB',
}

export const OCUPACOES = {
  'A': {
    descricao: 'Residencial',
    divisoes: {
      'A-1': 'Habitacao unifamiliar',
      'A-2': 'Habitacao multifamiliar',
      'A-3': 'Habitacao coletiva',
    },
  },
  'B': {
    descricao: 'Servico de Hospedagem',
    divisoes: {
      'B-1': 'Hotel e assemelhado',
      'B-2': 'Hotel residencial',
    },
  },
  'C': {
    descricao: 'Comercial',
    divisoes: {
      'C-1': 'Comercio com baixa carga de incendio',
      'C-2': 'Comercio com media e alta carga de incendio',
      'C-3': 'Shopping centers',
    },
  },
  'D': {
    descricao: 'Servico profissional',
    divisoes: {
      'D-1': 'Local para prestacao de servico profissional ou conducao de negocios e administracao publica em geral',
      'D-2': 'Agencia bancaria',
      'D-3': 'Servico de reparacao (exceto os classificados em G-4)',
      'D-4': 'Laboratorio',
    },
  },
  'E': {
    descricao: 'Educacional e cultura fisica',
    divisoes: {
      'E-1': 'Escola em geral',
      'E-2': 'Escola especial',
      'E-3': 'Espaco para cultura fisica',
      'E-4': 'Centro de treinamento profissional',
      'E-5': 'Pre-escola',
      'E-6': 'Escola para portadores de deficiencias',
    },
  },
  'F': {
    descricao: 'Local de Reuniao de Publico',
    divisoes: {
      'F-1':  'Local onde ha objeto de valor inestimavel',
      'F-2':  'Local religioso e velorio',
      'F-3':  'Centro esportivo e de exibicao',
      'F-4':  'Estacao e terminal de passageiro',
      'F-5':  'Arte cenica e auditorio',
      'F-6':  'Clubes sociais e Salao de Festas',
      'F-7':  'Eventos temporarios',
      'F-8':  'Local para refeicao',
      'F-9':  'Recreacao publica',
      'F-10': 'Exposicao de objetos ou animais',
      'F-11': 'Boates',
    },
  },
  'G': {
    descricao: 'Servico automotivo e assemelhados',
    divisoes: {
      'G-1': 'Garagem sem acesso de publico e sem abastecimento',
      'G-2': 'Garagem com acesso de publico e sem abastecimento',
      'G-3': 'Local dotado de abastecimento de combustivel',
      'G-4': 'Servico de conservacao, manutencao e reparos',
      'G-5': 'Hangares',
    },
  },
  'H': {
    descricao: 'Servico de saude e institucional',
    divisoes: {
      'H-1': 'Hospital veterinario e assemelhados',
      'H-2': 'Local onde pessoas requerem cuidados especiais por limitacoes fisicas ou mentais',
      'H-3': 'Hospital e assemelhado',
      'H-4': 'Edificacoes das forcas armadas e policiais',
      'H-5': 'Local onde a liberdade das pessoas sofre restricoes',
      'H-6': 'Clinica e consultorio medico e odontologico',
    },
  },
  'I': {
    descricao: 'Industria',
    divisoes: {
      'I-1': 'Industria com carga de incendio ate 300 MJ/m²',
      'I-2': 'Industria com carga de incendio acima de 300 MJ/m² ate 1.200 MJ/m²',
      'I-3': 'Industria com carga de incendio superior a 1.200 MJ/m²',
    },
  },
  'J': {
    descricao: 'Deposito',
    divisoes: {
      'J-1': 'Deposito de material incombustivel',
      'J-2': 'Deposito com carga de incendio ate 300 MJ/m²',
      'J-3': 'Deposito com carga de incendio acima de 300 MJ/m² ate 1.200 MJ/m²',
      'J-4': 'Deposito com carga de incendio superior a 1.200 MJ/m²',
    },
  },
  'K': {
    descricao: 'Energia',
    divisoes: {
      'K-1': 'Central de transmissao e distribuicao de energia',
    },
  },
  'L': {
    descricao: 'Explosivo',
    divisoes: {
      'L-1': 'Comercio',
      'L-2': 'Industria',
      'L-3': 'Deposito',
    },
  },
  'M': {
    descricao: 'Especial',
    divisoes: {
      'M-1': 'Tunel',
      'M-3': 'Central de comunicacao',
      'M-4': 'Canteiro de obras',
      'M-5': 'Silos',
    },
  },
}

export const CARGADEINCENDIO = {}
