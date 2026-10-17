import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildMemorial, PRIMEIRA_SECAO_MEDIDA } from '../../data/memorial/registry'
import { Titulo, BlocoMedida } from '../documentos/BlocosMemorial'
import { TEXTO, numerarBlocos } from '../../utils/memorialEstilo'

// Prévia da medida no memorial descritivo em texto (MA e demais estados sem
// fluxo próprio): a(s) seção(ões) da medida com o mesmo número e os mesmos
// blocos do documento (MemorialDescritivoPage).
export default function PreviaMemorial({ sistKey }) {
  const { state } = useProjeto()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const secoes = buildMemorial(state, sistemas, porEstrutura)
  const daMedida = secoes.map((secao, i) => ({ secao, numero: PRIMEIRA_SECAO_MEDIDA + i })).filter(({ secao }) => secao.medida === sistKey)
  if (daMedida.length === 0) {
    return <p className={`${TEXTO} m-0`}>Esta medida não entra no memorial descritivo do projeto (não exigida ou sem texto próprio no memorial).</p>
  }
  return daMedida.map(({ secao, numero }) => (
    <div key={numero} className="mb-8 last:mb-0">
      <Titulo nivel={1} numero={String(numero)}>{secao.titulo}</Titulo>
      {secao.blocos
        ? numerarBlocos(secao.blocos, numero).map((b, i) => <BlocoMedida key={i} bloco={b}/>)
        : (secao.paragrafos || []).map((p, i) => <p key={i} className={`${TEXTO} indent-8 pl-2 mb-3`}>{p}</p>)}
    </div>
  ))
}
