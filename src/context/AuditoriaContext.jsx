import { createContext, useContext, useMemo } from 'react'
import { useProjeto } from './ProjetoContext'
import { useMedidasObrigatorias } from '../hooks/useMedidasObrigatorias'
import { camposObrigatorios } from '../data/auditoriaProjeto'

const Context = createContext({ campos:[], porId:new Map(), pendencias:[] })
export function AuditoriaProvider({ children }) {
  const { state, normasVersion } = useProjeto()
  const { porEstrutura } = useMedidasObrigatorias()
  const value = useMemo(() => {
    const campos = camposObrigatorios(state,porEstrutura)
    return { campos, porId:new Map(campos.map(c => [c.id,c])), pendencias:campos.filter(c => c.pendente) }
  },[state,porEstrutura,normasVersion])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export const useAuditoria = () => useContext(Context)
