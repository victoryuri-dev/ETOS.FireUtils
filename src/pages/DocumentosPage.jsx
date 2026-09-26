import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useProjeto } from '../context/ProjetoContext'
import AnexoBPage from './documentos/AnexoBPage'
import MemorialDescritivoPage from './documentos/MemorialDescritivoPage'
import Icon from '../components/ui/Icon'

const DOCUMENTOS = [
  {
    id: 'anexo-b',
    titulo: 'Anexo B — NT 01',
    descricao: 'Formulario de Seguranca Contra Incendio para Processo Tecnico. Preenchido com os dados cadastrados nas etapas de configuracao do projeto.',
  },
  {
    id: 'memorial-descritivo',
    titulo: 'Memorial Descritivo',
    descricao: 'Uma pagina por medida de seguranca dimensionada, com o texto tecnico gerado a partir dos dados de cada dimensionamento — inclui o Plano de Emergencia (NT 16) quando aplicavel ao projeto.',
  },
]

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
  // Anexo B pede dados (endereço, responsáveis, área do terreno...) que um
  // projeto "apenas dimensionamento" nunca coleta — não faz sentido gerar
  // um formulário cheio de campo em branco pra um modo pensado pra não
  // pedir esse dado.
  const documentos = state.tipoProjeto === 'dimensionamento'
    ? DOCUMENTOS.filter(d => d.id !== 'anexo-b')
    : DOCUMENTOS
  // O documento aberto vive na URL (/projeto/:id/documentos/:docId), então
  // recarregar a página ou copiar o link mantém o documento aberto.
  const { id, docId } = useParams()
  const navigate = useNavigate()
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

  if (aberto === 'anexo-b') {
    return <AnexoBPage onBack={voltar}/>
  }
  if (aberto === 'memorial-descritivo') {
    return <MemorialDescritivoPage onBack={voltar}/>
  }

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

          <div className="ibox amber mb-5">
            <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
            <span>Os campos "Para uso do CBMMA" (protocolo, observacoes, No do CAP) sao de preenchimento exclusivo do Corpo de Bombeiros e ficam em branco no documento.</span>
          </div>

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
