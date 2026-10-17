import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useProjeto } from '../context/ProjetoContext'
import AnexoBPage from './documentos/AnexoBPage'
import MemorialDescritivoPage from './documentos/MemorialDescritivoPage'
import MemorialPBPage from './documentos/MemorialPBPage'
import { documentosDoEstado } from '../estados/registro'
import Icon from '../components/ui/Icon'
import Loader from '../components/ui/Loader'
import SemLicenca from '../components/perfil/SemLicenca'
import { useAcesso } from '../hooks/useLicencas'

function DocumentoCard({ doc, onAbrir }) {
  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between py-3 px-4 border-b border-solid border-border">
        <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
          <Icon name="file" size={13}/> {doc.titulo}
        </span>
      </div>
      <div className="py-4 px-4 flex items-center justify-between gap-4">
        <p className="text-[13px] text-ink-faint leading-[1.6] m-0 max-w-[520px]">{doc.descricao}</p>
        <button className="btn-primary shrink-0" onClick={onAbrir}>
          <Icon name="file" size={13}/> Visualizar
        </button>
      </div>
    </div>
  )
}

export default function DocumentosPage() {
  const location = useLocation()
  const { state } = useProjeto()
  // Documentos do estado do projeto (estados/registro.js). Anexo B pede
  // dados (endereço, responsáveis, área do terreno...) que um projeto
  // "apenas dimensionamento" nunca coleta — fica de fora nesse modo.
  const documentos = documentosDoEstado(state.uf, state.tipoProjeto)
  // O documento aberto vive na URL (/projeto/:id/documentos/:docId), então
  // recarregar a página ou copiar o link mantém o documento aberto.
  const { id, docId } = useParams()
  const navigate = useNavigate()
  // Memorial Descritivo e Anexo B são o módulo Memorial (ou PRO).
  const acesso = useAcesso('memorial')
  const base = `/projeto/${id}/documentos`
  const abrir = doc => navigate(`${base}/${doc}`)
  const voltar = () => navigate(base)

  // Chegada com um documento pedido por estado (ex.: botão "Ver no Memorial
  // Descritivo" em GerenciamentoRiscoPage.jsx): converte para a URL do documento.
  if (!docId && location.state?.abrir) {
    return <Navigate to={`${base}/${location.state.abrir}`} replace/>
  }
  const aberto = documentos.some(d => d.id === docId) ? docId : null
  // URL de documento inexistente (ou indisponível neste tipo de projeto): volta pra lista.
  if (docId && !aberto) return <Navigate to={base} replace/>

  if (acesso.carregando) {
    return <div className="flex-1 flex items-center justify-center"><Loader size={32}/></div>
  }
  if (!acesso.liberado) {
    return (
      <SemLicenca
        titulo="Documentos fazem parte do módulo Memorial"
        texto="Gerar o Memorial Descritivo e o Anexo B exige a licença do módulo Memorial ou do FireUtils PRO."
      />
    )
  }

  const tipo = documentos.find(d => d.id === aberto)?.tipo
  if (tipo === 'anexo-b') return <AnexoBPage onBack={voltar}/>
  if (tipo === 'memorial-texto') return <MemorialDescritivoPage onBack={voltar}/>
  if (tipo === 'formulario-pb') return <MemorialPBPage onBack={voltar}/>

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto pt-8 px-10 pb-[60px]">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink mb-1.5">Documentos</h1>
            <p className="text-[13px] text-ink-faint leading-[1.6] m-0 max-w-[640px]">
              Documentos obrigatorios do processo tecnico, montados automaticamente a partir dos dados do projeto.
            </p>
          </div>

          {documentos.some(d => d.tipo === 'anexo-b') && (
            <div className="ibox amber mb-5">
              <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
              <span>Os campos "Para uso do CBMMA" (protocolo, observacoes, No do CAP) sao de preenchimento exclusivo do Corpo de Bombeiros e ficam em branco no documento.</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {documentos.map(doc => (
              <DocumentoCard key={doc.id} doc={doc} onAbrir={() => abrir(doc.id)}/>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
