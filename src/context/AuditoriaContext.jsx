import { createContext, useContext, useMemo } from 'react'
import { useProjeto } from './ProjetoContext'
import { useMedidasObrigatorias } from '../hooks/useMedidasObrigatorias'
import { camposObrigatorios, camposOpcionais } from '../data/auditoriaProjeto'

const Context = createContext({ campos:[], opcionais:[], porId:new Map(), pendencias:[] })
export function AuditoriaProvider({ children }) {
  const { state, normasVersion } = useProjeto()
  const { porEstrutura } = useMedidasObrigatorias()
  const value = useMemo(() => {
    const campos = camposObrigatorios(state,porEstrutura).map(c => ({ ...c, obrigatorio:true }))
    const opcionais = camposOpcionais(state,porEstrutura)
    return { campos, opcionais, porId:new Map([...campos,...opcionais].map(c => [c.id,c])), pendencias:campos.filter(c => c.pendente) }
  },[state,porEstrutura,normasVersion])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export const useAuditoria = () => useContext(Context)
