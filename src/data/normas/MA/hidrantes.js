// normas/MA/hidrantes.js — dados normativos da NT 22/2021 CBMMA (Sistema de
// Proteção por Hidrantes e Mangotinhos). Segue o mesmo padrão dos demais
// arquivos desta pasta: só dados/tabelas, nenhuma lógica — quem cruza esses
// dados com o projeto é hidrantes_calc.js (recebe a norma como parâmetro).
//
// COMO ADICIONAR OUTRO ESTADO: crie normas/<UF>/hidrantes.js com a mesma
// forma (TIPOS_SISTEMA, COMPONENTES_POR_TIPO, FAIXAS_AREA, DIVISOES_COLUNA,
// DIVISOES_POR_CARGA, TABELA3, REFERENCIA_PRESSAO_VAZAO, MATERIAIS_TUBULACAO)
// com os valores daquele estado, e registre em normas/index.js — nada no
// formulário ou no motor de sugestão (hidrantes_calc.js) muda.

export const NORMA = {
  estado: 'MA',
  nome:   'NT 22/2021 CBMMA',
  desc:   'Sistema de Proteção por Hidrantes e Mangotinhos',
}

// Onde a norma exige que a vazão/pressão mínima do sistema seja verificada:
// 'valvula' (na saída da válvula do hidrante — caso do MA, Tabela 2 NT 22) ou
// 'esguicho' (na saída do esguicho, após a mangueira — outros estados). O
// plugin usa este campo pra decidir o método de cálculo (parar na válvula ou
// somar também a perda de carga na mangueira até o esguicho).
export const REFERENCIA_PRESSAO_VAZAO = 'valvula'

// ── Tabela 2 — Tipos de sistema ─────────────────────────────────────────
// Tipo 4 tem duas variantes válidas (mesma vazão mínima, esguicho/mangueira/
// pressão diferentes) — o projetista escolhe qual adotar.
export const TIPOS_SISTEMA = {
  1: {
    label: 'Tipo 1 — Mangotinho',
    expedicoes: 'simples',
    vazaoMin: 100, pressaoMin: 80,
    variantes: [{ esguicho: 25, mangueiraDn: 25, mangueiraComprimento: 30, pressaoMin: 80 }],
  },
  2: {
    label: 'Tipo 2',
    expedicoes: 'simples',
    vazaoMin: 150, pressaoMin: 30,
    variantes: [{ esguicho: 40, mangueiraDn: 40, mangueiraComprimento: 30, pressaoMin: 30 }],
  },
  3: {
    label: 'Tipo 3',
    expedicoes: 'simples',
    vazaoMin: 200, pressaoMin: 40,
    variantes: [{ esguicho: 40, mangueiraDn: 40, mangueiraComprimento: 30, pressaoMin: 40 }],
  },
  4: {
    label: 'Tipo 4',
    expedicoes: 'simples',
    vazaoMin: 300, pressaoMin: 65, // pressaoMin "padrao" = da 1a variante; cada variante tem a sua
    variantes: [
      { esguicho: 40, mangueiraDn: 40, mangueiraComprimento: 30, pressaoMin: 65 },
      { esguicho: 60, mangueiraDn: 65, mangueiraComprimento: 30, pressaoMin: 30 },
    ],
  },
  5: {
    label: 'Tipo 5',
    expedicoes: 'duplo',
    vazaoMin: 600, pressaoMin: 60,
    variantes: [{ esguicho: 65, mangueiraDn: 65, mangueiraComprimento: 30, pressaoMin: 60 }],
  },
}

// ── Tabela 4 — Componentes obrigatórios por tipo ────────────────────────
export const COMPONENTES_POR_TIPO = {
  1: { abrigo: 'opcional',    mangueiraIncendio: null,                          chaveEngate: false, esguichoAvulso: false, mangueiraSemirrigida: true  },
  2: { abrigo: 'obrigatorio', mangueiraIncendio: 'tipo1_residencial_ou_tipo2',  chaveEngate: true,  esguichoAvulso: true,  mangueiraSemirrigida: false },
  3: { abrigo: 'obrigatorio', mangueiraIncendio: 'tipo2_3_4_ou_5',              chaveEngate: true,  esguichoAvulso: true,  mangueiraSemirrigida: false },
  4: { abrigo: 'obrigatorio', mangueiraIncendio: 'tipo2_3_4_ou_5',              chaveEngate: true,  esguichoAvulso: true,  mangueiraSemirrigida: false },
  5: { abrigo: 'obrigatorio', mangueiraIncendio: 'tipo2_3_4_ou_5',              chaveEngate: true,  esguichoAvulso: true,  mangueiraSemirrigida: false },
}

export const LABEL_MANGUEIRA_INCENDIO = {
  tipo1_residencial_ou_tipo2: 'Tipo 1 (residencial) ou Tipo 2 (demais ocupações)',
  tipo2_3_4_ou_5: 'Tipo 2, 3, 4 ou 5',
}

// ── Tabela 3 — Faixas de área construída (m²) ───────────────────────────
export const FAIXAS_AREA = [
  { max: 2500,                     label: 'Até 2.500 m²' },
  { min: 2500,  max: 5000,         label: 'Acima de 2.500 até 5.000 m²' },
  { min: 5000,  max: 10000,        label: 'Acima de 5.000 até 10.000 m²' },
  { min: 10000, max: 20000,        label: 'Acima de 10.000 até 20.000 m²' },
  { min: 20000, max: 50000,        label: 'Acima de 20.000 até 50.000 m²' },
  { min: 50000,                    label: 'Acima de 50.000 m²' },
]

// ── Tabela 3 — Colunas de risco (por linha/faixa de área) ───────────────
// col1: Tipo 1 OU Tipo 2 (projetista escolhe — mesma ocupação admite os
// dois). col2: Tipo 3 fixo, sem escolha. col3: Tipo 4 fixo. col4: Tipo 4
// ou 5, já definido pela própria tabela conforme a faixa de área (não é
// escolha do projetista).
export const TABELA3 = [
  { col1: { tipo1: { rti: 6  }, tipo2: { rti: 8  } }, col2: { tipo: 3, rti: 12  }, col3: { tipo: 4, rti: 28  }, col4: { tipo: 4, rti: 32  } },
  { col1: { tipo1: { rti: 8  }, tipo2: { rti: 12 } }, col2: { tipo: 3, rti: 18  }, col3: { tipo: 4, rti: 32  }, col4: { tipo: 4, rti: 48  } },
  { col1: { tipo1: { rti: 12 }, tipo2: { rti: 18 } }, col2: { tipo: 3, rti: 25  }, col3: { tipo: 4, rti: 48  }, col4: { tipo: 5, rti: 64  } },
  { col1: { tipo1: { rti: 18 }, tipo2: { rti: 25 } }, col2: { tipo: 3, rti: 35  }, col3: { tipo: 4, rti: 64  }, col4: { tipo: 5, rti: 96  } },
  { col1: { tipo1: { rti: 25 }, tipo2: { rti: 35 } }, col2: { tipo: 3, rti: 48  }, col3: { tipo: 4, rti: 96  }, col4: { tipo: 5, rti: 120 } },
  { col1: { tipo1: { rti: 35 }, tipo2: { rti: 48 } }, col2: { tipo: 3, rti: 70  }, col3: { tipo: 4, rti: 120 }, col4: { tipo: 5, rti: 180 } },
]

// Divisões com coluna fixa (não dependem da carga de incêndio)
export const DIVISOES_COLUNA = {
  'A-2': 1, 'A-3': 1, 'C-1': 1, 'D-2': 1,
  'E-1': 1, 'E-2': 1, 'E-3': 1, 'E-4': 1, 'E-5': 1, 'E-6': 1,
  'F-2': 1, 'F-3': 1, 'F-4': 1, 'F-8': 1,
  'G-1': 1, 'G-2': 1, 'G-3': 1, 'G-4': 1,
  'H-1': 1, 'H-2': 1, 'H-3': 1, 'H-5': 1, 'H-6': 1,
  'I-1': 1, 'J-1': 1, 'M-3': 1,

  'B-1': 2, 'B-2': 2, 'C-3': 2,
  'F-5': 2, 'F-6': 2, 'F-7': 2, 'F-9': 2, 'F-10': 2, 'F-11': 2,
  'H-4': 2, 'K-1': 2,

  'L-1': 3, 'M-1': 3,

  'G-5': 4, 'I-3': 4, 'J-4': 4, 'L-2': 4, 'L-3': 4, 'M-7': 4,
}

// Divisões cuja coluna depende da carga de incêndio (MJ/m²) do pavimento —
// faixas avaliadas em ordem, a primeira que bater vence.
export const DIVISOES_POR_CARGA = {
  'D-1': [{ max: 300, coluna: 1 }, { min: 300, coluna: 2 }],
  'D-3': [{ max: 300, coluna: 1 }, { min: 300, coluna: 2 }],
  'D-4': [{ max: 300, coluna: 1 }, { min: 300, coluna: 2 }],
  'F-1': [{ max: 300, coluna: 1 }, { min: 300, coluna: 2 }],
  'J-2': [{ max: 300, coluna: 1 }, { min: 300, coluna: 2 }],
  'C-2': [{ max: 1000, coluna: 2 }, { min: 1000, coluna: 3 }],
  'I-2': [{ max: 800,  coluna: 2 }, { min: 800,  coluna: 3 }],
  'J-3': [{ max: 300, coluna: 1 }, { min: 300, max: 800, coluna: 2 }, { min: 800, coluna: 3 }],
}

// ── Materiais de tubulação — Tabela 1 (fator C de Hazen-Williams) ───────
export const MATERIAIS_TUBULACAO = [
  { key: 'ferro_fundido_sem_revest', label: 'Ferro fundido ou dúctil sem revestimento interno', fatorC: 100 },
  { key: 'aco_preto_seco',           label: 'Aço preto (sistema de tubo seco)',                  fatorC: 100 },
  { key: 'aco_preto_molhado',        label: 'Aço preto (sistema de tubo molhado)',                fatorC: 120 },
  { key: 'galvanizado',              label: 'Galvanizado',                                        fatorC: 120 },
  { key: 'plastico',                 label: 'Plástico (PVC/PEAD)',                                fatorC: 150 },
  { key: 'ferro_fundido_com_cimento',label: 'Ferro fundido ou dúctil com revestimento interno de cimento', fatorC: 140 },
  { key: 'cobre',                    label: 'Cobre',                                              fatorC: 150 },
]

// Posição do reservatório (elevado/nível do solo/etc.) não é perguntada
// aqui — vem do modelo Revit (plugin). O site só pergunta o material, que é
// uma decisão de projeto sem correspondência geométrica no modelo.
export const MATERIAIS_RESERVATORIO = [
  { key: 'concreto_armado', label: 'Concreto armado' },
  { key: 'alvenaria',       label: 'Alvenaria' },
  { key: 'fibra_vidro',     label: 'Fibra de vidro' },
  { key: 'aco',             label: 'Aço (metálico)' },
  { key: 'polietileno',     label: 'Polietileno' },
  { key: 'outro',           label: 'Outro' },
]

export const TIPOS_RECALQUE = [
  { key: 'coluna_fachada', label: 'Coluna na fachada' },
  { key: 'embutido_muro',  label: 'Embutido em abrigo no muro' },
  { key: 'passeio',        label: 'Passeio público (exige justificativa técnica de impossibilidade)' },
]

export const CONFIGURACOES_REDE = [
  { key: 'ramal',  label: 'Ramal único' },
  { key: 'malha',  label: 'Malha (anel) fechado' },
]

export const ACIONAMENTOS_BOMBA = [
  { key: 'eletrico',   label: 'Motor elétrico' },
  { key: 'combustao',  label: 'Motor de combustão interna' },
]

// Bomba reserva obrigatória por risco (item C.3.12 do Anexo C)
export const BOMBA_RESERVA_POR_RISCO = {
  medio: { obrigatoria: true,  tipo: 'Bomba elétrica acoplada a motor elétrico' },
  alto:  { obrigatoria: true,  tipo: 'Bomba elétrica ligada a gerador de emergência, ou bomba acoplada a motor de combustão interna' },
}

// Vazão acima da qual o dispositivo de recalque precisa de 2 entradas (5.3.3)
export const VAZAO_LIMITE_RECALQUE_DUPLO = 1000

// ── NPSH disponível — entradas de sucção (Anexo C) ──────────────────────
// Ha (pressão atmosférica local, por altitude) e Hvp (pressão de vapor da
// água, por temperatura) são propriedades físicas — não normativas — mas
// ficam aqui, no arquivo por UF, no mesmo padrão dos demais dados desta
// pasta (o plugin usa a cópia equivalente em hidrantes/npshd.py; os
// valores são os mesmos, reaproveitados nas duas pontas).
export const ALTITUDES_SUCCAO = [
  { altitude: 0,    ha: 10.33 },
  { altitude: 500,  ha: 9.72 },
  { altitude: 1000, ha: 9.15 },
  { altitude: 1500, ha: 8.61 },
]

export const TEMPERATURAS_SUCCAO = [
  { temperatura: 10, hvp: 0.125 },
  { temperatura: 15, hvp: 0.174 },
  { temperatura: 20, hvp: 0.239 },
  { temperatura: 25, hvp: 0.323 },
  { temperatura: 30, hvp: 0.433 },
  { temperatura: 35, hvp: 0.573 },
  { temperatura: 40, hvp: 0.752 },
]

export const ALTITUDE_SUCCAO_PADRAO    = 0
export const TEMPERATURA_SUCCAO_PADRAO = 30

// ── Parâmetros do memorial de cálculo (marcha hidráulica) ───────────────
// Espelham o perfil normativo do plugin (Fire Utils.tab/lib/normas/MA/
// hidrantes.py) — mesmos valores/citações, usados só pra narrar o
// dimensionamento já calculado pelo Revit (memorial/hidrantesCalculo.js),
// nunca para recalcular nada aqui.
export const HIDRANTES_SIMULTANEOS     = 2
export const HIDRANTES_SIMULTANEOS_REF = 'NT 22 itens 5.8.3 / 5.8.8'

export const V_MAX_TUBULACAO     = 5.0
export const V_MAX_TUBULACAO_REF = 'NT 22 item 5.8.13'

export const V_MAX_SUCCAO_POSITIVA = 3.0
export const V_MAX_SUCCAO_NEGATIVA = 2.0
export const V_MAX_SUCCAO_REF      = 'NT 22 item 5.8.12'

export const TOLERANCIA_EQUILIBRIO_MCA     = 0.50
export const TOLERANCIA_EQUILIBRIO_MCA_REF = 'NT 22/2021 - CBMMA'

export const NPSHD_FATOR_VAZAO = 1.5
export const NPSHD_REF         = 'NT 22 item 5.8.16'
