import { useProjeto } from '../context/ProjetoContext'
import { getOcupacoes, getCargaMap, getNormaInfo, buscarCNAE, getCNAEsDivisao } from '../data/normas/index'
export function useNorma() {
  const { state } = useProjeto()
  const uf = state.uf || 'MA'
  return {
    uf,
    info:       getNormaInfo(uf),
    ocupacoes:  getOcupacoes(uf),
    cargaMap:   getCargaMap(uf),
    buscar:     (q) => buscarCNAE(uf, q),
    cnaesDiv:   (div) => getCNAEsDivisao(uf, div),
  }
}
