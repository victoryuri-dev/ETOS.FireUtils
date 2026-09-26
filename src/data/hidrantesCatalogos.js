// Catálogos globais do sistema de hidrantes — opções de projeto que NÃO variam
// por UF/norma (por isso ficam no código, não em normas_dados no Supabase).
// getHidrantes() (normas/index.js) os injeta em toda norma de hidrantes.

// Materiais de tubulação — Tabela 1 (fator C de Hazen-Williams)
export const MATERIAIS_TUBULACAO = [
  { key: 'ferro_fundido_sem_revest', label: 'Ferro fundido ou dúctil sem revestimento interno', fatorC: 100 },
  { key: 'aco_preto_seco',           label: 'Aço preto (sistema de tubo seco)',                  fatorC: 100 },
  { key: 'aco_preto_molhado',        label: 'Aço preto (sistema de tubo molhado)',                fatorC: 120 },
  { key: 'galvanizado',              label: 'Galvanizado',                                        fatorC: 120 },
  { key: 'plastico',                 label: 'Plástico (PVC/PEAD)',                                fatorC: 150 },
  { key: 'ferro_fundido_com_cimento',label: 'Ferro fundido ou dúctil com revestimento interno de cimento', fatorC: 140 },
  { key: 'cobre',                    label: 'Cobre',                                              fatorC: 150 },
]

// Posição do reservatório (elevado/nível do solo/etc.) não é perguntada no
// site — vem do modelo Revit (plugin). Aqui só o material, decisão de projeto.
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
  { key: 'passeio',        label: 'Passeio público' },
]

export const ACIONAMENTOS_BOMBA = [
  { key: 'eletrico',   label: 'Motor elétrico' },
  { key: 'combustao',  label: 'Motor de combustão interna' },
]
