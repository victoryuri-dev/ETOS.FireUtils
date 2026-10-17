import { useProjeto } from '../context/ProjetoContext'
import { EstagioExistentePB, CamposPBGerais, CamposPBGlp } from './PB/campos'

// Pontos da Configuração (etapas comuns aos estados) onde um estado acrescenta
// campos próprios. Estado sem extensão naquele ponto: nada é renderizado.
const EXTENSOES = {
  PB: {
    situacao: <EstagioExistentePB/>,     // Etapa 2, box Situação (item 3.6)
    classificacao: <CamposPBGerais/>,    // Etapa 4 (item 3.1)
    riscos: <CamposPBGlp/>,              // Etapa 6 (item 3.4.1)
  },
}

export default function ExtensaoConfig({ ponto }) {
  const { state } = useProjeto()
  return EXTENSOES[state.uf]?.[ponto] ?? null
}
