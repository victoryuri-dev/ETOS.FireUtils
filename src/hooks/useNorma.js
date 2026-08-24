import { useProjeto } from '../context/ProjetoContext'
import { getOcupacoes, getGrupos, getCargaMap, getNormaInfo, buscarCNAE, getCNAEsDivisao, temCNAECadastrado, getAV, getTRRF, getExtintores, getIluminacao, getSinalizacao, getControleAcabamento } from '../data/normas/index'
export function useNorma() {
  const { state } = useProjeto()
  const uf = state.uf || 'MA'
  return {
    uf,
    info:        getNormaInfo(uf),
    ocupacoes:   getOcupacoes(uf),
    grupos:      getGrupos(uf),
    cargaMap:    getCargaMap(uf),
    buscar:      (q) => buscarCNAE(uf, q),
    cnaesDiv:    (div) => getCNAEsDivisao(uf, div),
    temCNAE:     (div) => temCNAECadastrado(uf, div),
    av:          getAV(uf),
    trrf:        getTRRF(uf),
    extintores:  getExtintores(uf),
    iluminacao:  getIluminacao(uf),
    sinalizacao: getSinalizacao(uf),
    cmar:        getControleAcabamento(uf),
  }
}
