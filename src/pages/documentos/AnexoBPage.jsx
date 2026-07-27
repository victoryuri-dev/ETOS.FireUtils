import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildAnexoBData } from '../../utils/anexoB'
import Icon from '../../components/ui/Icon'

// Reproducao fiel da estrutura do Anexo B (NT 01 — CBMMA): mesmas secoes,
// mesma ordem de campos e mesmo agrupamento de colunas do documento oficial
// (10 colunas na tabela original). Ver scripts/registros da conversa para a
// extracao campo-a-campo do docx de referencia.

const td = 'border border-solid border-[#c9c9cb] align-top py-1.5 px-2'
const lbl = 'text-[10px] font-bold text-[#4D4D4F] uppercase tracking-[.01em]'
const val = 'text-[12px] text-black'

function Campo({ label, value, accent }) {
  return (
    <div>
      <span className={accent ? 'text-[10px] font-bold text-[#C84936] uppercase' : lbl}>{label}: </span>
      <span className={val}>{value || ''}</span>
    </div>
  )
}

function SectionBar({ children }) {
  return (
    <tr>
      <td colSpan={10} className="bg-[#BCBDC1] text-[#485479] text-[12px] font-bold uppercase tracking-[.03em] text-center py-1.5 border border-solid border-[#c9c9cb]">
        {children}
      </td>
    </tr>
  )
}

function Check({ ativo }) {
  return <td className={`${td} w-6 text-center`}>{ativo && <span className="font-bold">X</span>}</td>
}

function MedidaRow({ a, b }) {
  return (
    <tr>
      <Check ativo={a.ativo}/>
      <td colSpan={3} className={`${td} ${lbl} normal-case`}>{a.label}</td>
      <Check ativo={b.ativo}/>
      <td colSpan={5} className={`${td} ${lbl} normal-case`}>{b.label}</td>
    </tr>
  )
}

export default function AnexoBPage({ onBack }) {
  const { state } = useProjeto()
  const { sistemas } = useMedidasObrigatorias()
  const d = buildAnexoBData(state, sistemas)
  const hoje = new Date().toLocaleDateString('pt-BR')

  // Junta as duas colunas de medidas/riscos em pares de linha (igual ao formulario)
  const medidasRows = d.medidasCol1.map((a, i) => ({ a, b: d.medidasCol2[i] }))
  const riscosRows = []
  for (let i = 0; i < d.riscosEspeciais.length; i += 2) {
    riscosRows.push({ a: d.riscosEspeciais[i], b: d.riscosEspeciais[i + 1] })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      {/* Barra de acoes — nao aparece na impressao */}
      <div className="no-print shrink-0 flex items-center justify-between py-3 px-8 border-b border-solid border-border bg-surface">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="left" size={13}/> Voltar
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Icon name="file" size={13}/> Imprimir / Salvar PDF
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-8">
        <div className="print-area max-w-[900px] mx-auto bg-white text-black rounded-lg shadow-[0_4px_24px_rgba(0,0,0,.35)] py-8 px-9">

          {/* Cabecalho */}
          <div className="text-center mb-4">
            <div className="text-[13px] font-bold text-[#485479]">ANEXO B</div>
            <div className="text-[11px] font-semibold text-[#4D4D4F] uppercase tracking-[.03em]">Formulário de Segurança Contra Incêndio para Processo Técnico</div>
          </div>

          <table className="w-full border-collapse table-fixed">
            <colgroup>{Array.from({ length: 10 }).map((_, i) => <col key={i} style={{ width: '10%' }}/>)}</colgroup>
            <tbody>

              <SectionBar>Identificação da edificação e/ou área de risco</SectionBar>
              <tr>
                <td colSpan={7} className={td}><Campo label="Logradouro público" value={d.endereco}/></td>
                <td colSpan={2} className={td}><Campo label="CEP" value={d.cep}/></td>
                <td colSpan={1} className={td}><Campo label="Nº" value={d.numero}/></td>
              </tr>
              <tr>
                <td colSpan={4} className={td}><Campo label="Bairro" value={d.bairro}/></td>
                <td colSpan={6} className={td}><Campo label="Município" value={d.municipio}/></td>
              </tr>
              <tr>
                <td colSpan={6} className={td}><Campo label="Complemento" value={d.complemento}/></td>
                <td colSpan={4} className={td}><Campo label="UF" value={d.uf}/></td>
              </tr>
              <tr>
                <td colSpan={6} className={td}><Campo label="Proprietário" value={d.proprietario}/></td>
                <td colSpan={4} className={td}><Campo label="CPF" value={d.proprietarioDocumento}/></td>
              </tr>
              <tr>
                <td colSpan={6} className={td}><Campo label="Responsável pelo uso" value={d.responsavelUso}/></td>
                <td colSpan={4} className={td}><Campo label="CPF/CNPJ" value={d.responsavelDocumento}/></td>
              </tr>
              <tr>
                <td colSpan={6} className={td}><Campo label="E-mail" value={d.responsavelEmail}/></td>
                <td colSpan={4} className={td}><Campo label="Fone" value={d.responsavelFone}/></td>
              </tr>
              <tr>
                <td colSpan={8} className={td}><Campo label="Razão social" value={d.razaoSocial}/></td>
                <td colSpan={2} className={td}><Campo label="CNPJ" value={d.cnpj}/></td>
              </tr>
              <tr><td colSpan={10} className={td}><Campo label="Nome fantasia" value={d.nomeFantasia}/></td></tr>
              <tr><td colSpan={10} className={td}><Campo label="CNAE principal" value={d.cnaePrincipal}/></td></tr>
              <tr><td colSpan={10} className={td}><Campo label="Classificação da ocupação (Tabela 1, Anexo A, NT_01)" value={d.classificacaoOcupacao} accent/></td></tr>
              <tr>
                <td colSpan={5} className={td}><Campo label="Área total construída" value={d.areaTotalConstruida}/></td>
                <td colSpan={5} className={td}><Campo label="Pavimentos subsolo" value={d.pavimentosSubsolo}/></td>
              </tr>
              <tr>
                <td colSpan={5} className={td}><Campo label="Área do terreno" value={d.areaTerreno}/></td>
                <td colSpan={5} className={td}><Campo label="Quantidade de público" value={d.quantidadePublico}/></td>
              </tr>
              <tr>
                <td colSpan={5} className={td}><Campo label="Área complementar" value={d.areaComplementar}/></td>
                <td rowSpan={2} colSpan={5} className={`${td} text-center`}>
                  <div className={lbl}>Carga de incêndio</div>
                  <div className={`${val} mt-1`}>{d.cargaIncendio}</div>
                </td>
              </tr>
              <tr>
                <td colSpan={5} className={td}><Campo label="Altura (para fins de medidas de segurança)" value={d.altura}/></td>
              </tr>

              <SectionBar>Forma de apresentação</SectionBar>
              <tr>
                <td className={td}></td>
                <td colSpan={4} className={`${td} text-center ${lbl} normal-case`}>Processo técnico {d.processoTecnico && <span className="font-bold">(X)</span>}</td>
                <td colSpan={5} className={`${td} text-[10px] font-bold text-[#C84936] uppercase`}>Para uso do CBMMA</td>
              </tr>
              <tr>
                <td className={td}></td>
                <td colSpan={4} className={`${td} ${lbl} normal-case`}>Processo técnico complementar</td>
                <td rowSpan={2} colSpan={3} className={`${td} ${lbl} normal-case`}>Protocolo</td>
                <td rowSpan={2} colSpan={2} className={`${td} ${lbl} normal-case`}>Observações</td>
              </tr>
              <tr>
                <td className={td}></td>
                <td colSpan={4} className={td}><Campo label="Nº do CAP principal" value="" accent/></td>
              </tr>
              <tr>
                <td colSpan={8} className={td}><Campo label="Responsável técnico" value={d.responsavelTecnico}/></td>
                <td colSpan={2} className={td}></td>
              </tr>
              <tr>
                <td colSpan={2} className={td}><Campo label="CPF" value={d.rtCpf}/></td>
                <td colSpan={6} className={td}><Campo label="Nº do conselho" value={d.rtConselho}/></td>
                <td colSpan={2} className={td}></td>
              </tr>
              <tr>
                <td colSpan={3} className={td}><Campo label="e-mail" value={d.rtEmail}/></td>
                <td colSpan={5} className={td}><Campo label="Fone" value={d.rtFone}/></td>
                <td colSpan={2} className={td}></td>
              </tr>

              <SectionBar>Características construtivas</SectionBar>
              <tr>
                <td colSpan={2} className={`${td} ${lbl} normal-case`}>Estrutura (concreto, aço, vidro, ferro, outros.):</td>
                <td colSpan={8} className={`${td} ${val}`}>{d.estrutura}</td>
              </tr>
              <tr>
                <td colSpan={2} className={`${td} ${lbl} normal-case`}>Elementos de cobertura:</td>
                <td colSpan={8} className={`${td} ${val}`}>{d.cobertura}</td>
              </tr>
              <tr>
                <td colSpan={2} className={`${td} ${lbl} normal-case`}>Elementos de vedação:</td>
                <td colSpan={8} className={`${td} ${val}`}>{d.vedacao}</td>
              </tr>

              <SectionBar>Medidas de segurança contra incêndio</SectionBar>
              {medidasRows.map((r, i) => <MedidaRow key={i} a={r.a} b={r.b}/>)}

              <SectionBar>Riscos especiais</SectionBar>
              {riscosRows.map((r, i) => <MedidaRow key={i} a={r.a} b={r.b}/>)}

            </tbody>
          </table>

          <p className="text-[10px] text-[#8a8a8c] mt-2 mb-0">Riscos especiais não são coletados pelo app ainda — marque manualmente se aplicável.</p>

          {/* Assinaturas */}
          <div className="grid grid-cols-2 gap-8 mt-10 pt-4">
            <div className="text-center">
              <div className="border-t border-solid border-black pt-1.5 text-[11px] text-[#4D4D4F]">Responsável Técnico</div>
            </div>
            <div className="text-center">
              <div className="border-t border-solid border-black pt-1.5 text-[11px] text-[#4D4D4F]">Responsável pelo uso</div>
            </div>
          </div>

          <div className="text-center text-[9px] text-[#8a8a8c] mt-8 pt-2 border-t border-solid border-[#dcdcdc]">
            NT 01/2021 Procedimentos Administrativos e Medidas de Segurança — gerado pelo ETOS Fire Utils em {hoje}
          </div>

        </div>
      </div>
    </div>
  )
}
