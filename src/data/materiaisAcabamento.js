// materiaisAcabamento.js — catálogo de materiais de acabamento/revestimento
// usado no CMAR (Controle de Material de Acabamento e Revestimento, NT 10
// CBMMA). Só entram aqui materiais comprovadamente incombustíveis (item 7
// das instruções normativas do CMAR) — a classe de reação ao fogo desses
// materiais não varia por norma/estado, só a CLASSE MÁXIMA ADMITIDA por
// elemento/ocupação varia (essa vem de normas/<UF>/controle_acabamento.js).
//
// Qualquer material fora desta lista (PVC, ACM, EPS, PIR, PUR, painel
// isotérmico, carpete, MDF, laminado, tecido, sistemas compostos, etc.) é
// cadastrado manualmente na tela — o catálogo nunca "adivinha" a classe de
// um material combustível ou composto (item 6 das instruções).
export const MATERIAIS_INCOMBUSTIVEIS = [
  { id: 'concreto',      nome: 'Concreto' },
  { id: 'vidro',         nome: 'Vidro' },
  { id: 'gesso',         nome: 'Gesso' },
  { id: 'ceramico',      nome: 'Produto cerâmico (porcelanato, cerâmica, azulejo)' },
  { id: 'pedra_natural', nome: 'Pedra natural' },
  { id: 'alvenaria',     nome: 'Alvenaria' },
  { id: 'metal',         nome: 'Metal / liga metálica' },
]

// Classe atribuída automaticamente a qualquer material da lista acima.
export const CLASSE_INCOMBUSTIVEL = 'I'

export function buscarMaterialIncombustivel(id) {
  return MATERIAIS_INCOMBUSTIVEIS.find(m => m.id === id) || null
}
