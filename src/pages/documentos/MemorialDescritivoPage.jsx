import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildMemorial } from '../../data/memorial/registry'
import Icon from '../../components/ui/Icon'

// Memorial descritivo: um documento para impressão, uma pagina A4 por medida
// de seguranca (secao vinda de buildMemorial). Medidas ainda sem builder
// registrado (ver memorial/registry.js) simplesmente nao aparecem aqui.

function Capa({ state, totalSecoes }) {
  const hoje = new Date().toLocaleDateString('pt-BR')
  return (
    <div className="memorial-secao flex flex-col min-h-[247mm]">
      <div className="text-center mt-16 mb-10">
        <div className="text-[11px] font-bold text-[#485479] uppercase tracking-[.08em]">Memorial Descritivo</div>
        <h1 className="text-[20px] font-bold text-black mt-2">Medidas de Segurança Contra Incêndio</h1>
        <p className="text-[12px] text-[#4D4D4F] mt-1">{state.nome || 'Projeto sem nome'}</p>
      </div>

      <div className="max-w-[420px] mx-auto w-full flex flex-col gap-2.5 text-[12px] text-black">
        <div><strong>Endereço:</strong> {[state.endereco, state.numero].filter(Boolean).join(', ')}</div>
        <div><strong>Bairro / Município:</strong> {[state.bairro, state.cidade].filter(Boolean).join(' — ')}</div>
        <div><strong>UF:</strong> {state.uf}</div>
        <div><strong>Responsável técnico:</strong> {state.rtNome || '—'}</div>
        <div><strong>CREA/CAU:</strong> {state.rtConselho || '—'}</div>
        <div><strong>Nº de páginas de medidas:</strong> {totalSecoes}</div>
      </div>

      <div className="text-center text-[10px] text-[#8a8a8c] mt-auto pt-6">
        Gerado pelo ETOS Fire Utils em {hoje}
      </div>
    </div>
  )
}

function SecaoMedida({ secao, index, total }) {
  return (
    <div className="memorial-secao">
      <div className="flex items-center justify-between border-b border-solid border-[#c9c9cb] pb-2 mb-6">
        <div>
          <div className="text-[10px] font-bold text-[#485479] uppercase tracking-[.06em]">Memorial Descritivo</div>
          <h2 className="text-[15px] font-bold text-black mt-0.5">{secao.titulo}</h2>
        </div>
        <div className="text-[10px] text-[#8a8a8c]">Seção {index + 1} de {total}</div>
      </div>

      {secao.paragrafos.map((p, i) => (
        <p key={i} className="text-[12.5px] text-black leading-[1.85] text-justify mb-3 indent-8">{p}</p>
      ))}
    </div>
  )
}

export default function MemorialDescritivoPage({ onBack }) {
  const { state }    = useProjeto()
  const { sistemas } = useMedidasObrigatorias()
  const secoes = buildMemorial(state, sistemas)

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-none">
      <div className="no-print shrink-0 flex items-center justify-between py-3 px-8 border-b border-solid border-border bg-none">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="left" size={13}/> Voltar
        </button>
        <button className="btn-primary" onClick={() => window.print()} disabled={!secoes.length}>
          <Icon name="file" size={13}/> Imprimir / Salvar PDF
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-8">
        {!secoes.length ? (
          <div className="max-w-[600px] mx-auto py-16 px-10 text-center border border-dashed border-border rounded-lg text-ink-faint text-[13px]">
            Nenhuma medida com memorial disponível ainda. Preencha o dimensionamento de uma medida (ex.: Acesso de Viatura) para gerar as páginas aqui.
          </div>
        ) : (
          <div className="print-area max-w-[900px] mx-auto bg-white text-black rounded-lg shadow-[0_4px_24px_rgba(0,0,0,.35)] print:shadow-none print:rounded-none">
            <div className="py-10 px-12 print:py-0 print:px-0">
              <Capa state={state} totalSecoes={secoes.length}/>
              {secoes.map((secao, i) => (
                <SecaoMedida key={i} secao={secao} index={i} total={secoes.length}/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
