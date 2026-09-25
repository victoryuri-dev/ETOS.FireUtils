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

// Catálogo de produtos/materiais já ENSAIADOS e classificados (relatório de
// ensaio do fabricante ou similar) — fornecido pelo usuário, não estimado.
// Diferente de MATERIAIS_INCOMBUSTIVEIS (classe sempre I, vale pra qualquer
// elemento), aqui a classe é específica do elemento em que o material foi
// ensaiado (ex.: um MDF revestido pode ter classe diferente como parede e
// como forro) — por isso o catálogo é indexado por elemento ('piso',
// 'parede', 'teto'). Ao selecionar um item daqui a classe é preenchida
// automaticamente, sem exigir fabricante/nº de laudo na tela (o dado já
// vem de um ensaio) — mas o campo "Normas de ensaio" da linha continua
// disponível para registrar a norma usada, se o usuário quiser.
export const MATERIAIS_ENSAIADOS = {
  piso: [
    { id: 'piso-borracha-eckifloor',   nome: 'Piso de Borracha Eckifloor',                        classe: 'II-A' },
    { id: 'piso-vinilico-laminado',    nome: 'Piso vinílico (revestimento laminado)',              classe: 'II-A' },
    { id: 'piso-vinilico-borracha-madeira', nome: 'Pisos vinílicos de borracha e de madeira',      classe: 'II-A' },
    { id: 'piso-carpete-itapema',      nome: 'Carpete coleção Itapema',                            classe: 'III-A' },
    { id: 'piso-carpete-poliester',    nome: 'Carpetes 100% poliéster e alguns sintéticos',        classe: 'III-A' },
    { id: 'piso-laminado-eucafloor',   nome: 'Piso laminado Eucafloor',                            classe: 'III-B' },
    { id: 'piso-laminado-geral',       nome: 'Pisos laminados em geral',                           classe: 'III-B' },
    { id: 'piso-carpete-bouclê-tricolor', nome: 'Carpete coleção Bouclê Tricolor',                 classe: 'IV-A' },
    { id: 'piso-carpete-sintetico',    nome: 'Carpetes 100% sintéticos',                           classe: 'IV-A' },
    { id: 'piso-carpete-etruria',      nome: 'Carpete Etruria 100% Polipropileno',                 classe: 'IV-B' },
    { id: 'piso-carpete-generico',     nome: 'Carpetes (genérico)',                                classe: 'IV-B' },
  ],
  parede: [
    { id: 'parede-wall-eternit-ckc2020', nome: 'Painel Wall Eternit CKC-2020 Retardante de Chamas para Fibras Celulósicas', classe: 'II-A' },
    { id: 'parede-gesso-pvc-melaminico', nome: 'Placas de gesso com ou sem película PVC ou melamínico',                    classe: 'II-A' },
    { id: 'parede-sonique-wood',       nome: 'Painel acústico linha Sonique Wood',                 classe: 'III-A' },
    { id: 'parede-mdf-melamina',       nome: 'Painel MDF revestido com melamina',                  classe: 'III-A' },
    { id: 'parede-mdf-laminado',       nome: 'Painel MDF revestido com laminado',                  classe: 'III-B' },
    { id: 'parede-verniz-firecoat',    nome: 'Tinta Verniz Corta-Chama Firecoat',                  classe: 'IV-A' },
  ],
  teto: [
    { id: 'teto-sonique-clean-cleanline-decor', nome: 'Forro acústico linhas Sonique Clean e Cleanline FireProof e Decor', classe: 'II-A' },
    { id: 'teto-attuale-pvc',          nome: 'Forro Attuale Modular em PVC',                       classe: 'II-A' },
    { id: 'teto-hunter-douglas',       nome: 'Forro Hunter Douglas (madeira, fibra têxtil ou fibra mineral)', classe: 'II-A' },
    { id: 'teto-gesso-acartonado',     nome: 'Gesso acartonado',                                   classe: 'II-A' },
    { id: 'teto-thermatex',            nome: 'Painéis de Lã Mineral para Forros, linha THERMATEX', classe: 'II-B' },
    { id: 'teto-la-mineral-generico',  nome: 'Forros de lã mineral (vide fabricante)',              classe: 'II-B' },
    { id: 'teto-sonique-wave-abstract', nome: 'Forro acústico linha Sonique Wave-classic-Abstract', classe: 'III-A' },
    { id: 'teto-mdf-standart',         nome: 'Forro em MDF Standart',                              classe: 'III-A' },
  ],
}

export function buscarMaterialEnsaiado(elemento, id) {
  return MATERIAIS_ENSAIADOS[elemento]?.find(m => m.id === id) || null
}
