import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildPlanoEmergenciaData } from '../../utils/planoEmergencia'
import Icon from '../../components/ui/Icon'

// Plano de Emergência contra Incêndio — reproduz o Anexo B (modelo) da NT
// 16/2021 CBMMA, no mesmo espírito de preenchimento do Anexo C (exemplo
// preenchido): campos curtos e diretos, sem parágrafos corridos. Os dados já
// cadastrados no projeto (endereço, estrutura, sistemas, riscos especiais,
// proprietário, responsável técnico) entram automaticamente — ver
// utils/planoEmergencia.js.

function Item({ label, value }) {
  return (
    <div className="mb-2.5">
      <div className="text-[10px] font-bold text-[#4D4D4F] uppercase tracking-[.01em]">{label}</div>
      <div className="text-[12.5px] text-black leading-[1.5]">{value || '—'}</div>
    </div>
  )
}

function Secao({ n, titulo, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 bg-[#BCBDC1] text-[#485479] py-1.5 px-2.5 mb-3">
        <span className="text-[11px] font-bold">B.{n}</span>
        <span className="text-[12px] font-bold uppercase tracking-[.03em]">{titulo}</span>
      </div>
      {children}
    </div>
  )
}

function Chips({ itens, vazio }) {
  if (!itens.length) return <div className="text-[12px] text-[#8a8a8c]">{vazio}</div>
  return (
    <div className="flex flex-wrap gap-1.5">
      {itens.map((t, i) => (
        <span key={i} className="text-[11px] text-black border border-solid border-[#c9c9cb] rounded py-0.5 px-2">{t}</span>
      ))}
    </div>
  )
}

// Uma linha "procedimento → responsável" — mesma lógica dos itens B.2.1 a
// B.2.10 do modelo oficial, cada um resumido ao essencial (o quê + quem).
function Procedimento({ n, titulo, texto }) {
  return (
    <div className="flex gap-3 py-2 border-b border-solid border-[#e4e4e6] last:border-b-0">
      <div className="text-[10px] font-bold text-[#8a8a8c] w-7 shrink-0 pt-0.5">B.2.{n}</div>
      <div className="flex-1">
        <div className="text-[11px] font-bold text-black">{titulo}</div>
        <div className="text-[12px] text-[#4D4D4F] leading-[1.5]">{texto}</div>
      </div>
    </div>
  )
}

export default function PlanoEmergenciaPage({ onBack }) {
  const { state } = useProjeto()
  const { sistemas } = useMedidasObrigatorias()
  const d = buildPlanoEmergenciaData(state, sistemas)
  const hoje = new Date().toLocaleDateString('pt-BR')

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      <div className="no-print shrink-0 flex items-center justify-between py-3 px-8 border-b border-solid border-border bg-surface">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="left" size={13}/> Voltar
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Icon name="file" size={13}/> Imprimir / Salvar PDF
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-8">
        <div className="print-area max-w-[900px] mx-auto bg-white text-black rounded-lg shadow-[0_4px_24px_rgba(0,0,0,.35)] py-8 px-9 print:py-0 print:px-0">

          <div className="text-center mb-6 print:mb-4">
            <div className="text-[13px] font-bold text-[#485479]">ANEXO B</div>
            <div className="text-[11px] font-semibold text-[#4D4D4F] uppercase tracking-[.03em]">Plano de Emergência Contra Incêndio</div>
            <div className="text-[13px] font-bold text-black mt-1.5">{d.edificacao || '[Edificação]'}</div>
          </div>

          <Secao n="1" titulo="Descrição da edificação ou área de risco">
            <Item label="Localização" value={d.endereco}/>
            <div className="grid grid-cols-2 gap-x-6">
              <Item label="Característica da vizinhança" value={d.caracteristicaVizinhanca}/>
              <Item label="Distância do Corpo de Bombeiros" value={d.distanciaCBM}/>
            </div>
            <Item label="Meios de ajuda externa (PAM, brigadas vizinhas etc.)" value={d.meiosAjudaExterna}/>

            <div className="grid grid-cols-3 gap-x-6 mt-3">
              <Item label="Estrutura" value={d.estrutura}/>
              <Item label="Área construída" value={d.areaConstruida}/>
              <Item label="Altura" value={d.altura}/>
            </div>
            <div className="grid grid-cols-3 gap-x-6">
              <Item label="Pavimentos" value={d.nPavimentos}/>
              <Item label="Subsolos" value={d.nSubsolos}/>
              <Item label="Ocupação" value={d.ocupacao}/>
            </div>

            <div className="grid grid-cols-2 gap-x-6 mt-3">
              <Item label="População fixa" value={d.populacaoFixa}/>
              <Item label="População flutuante" value={d.populacaoFlutuante}/>
            </div>
            <Item label="Características de funcionamento" value={d.horarioFuncionamento}/>
            <Item label="Pessoas portadoras de necessidades especiais" value={d.pneQuantidade ? `${d.pneQuantidade} — ${d.pneLocalizacao || 'localização não informada'}` : ''}/>

            <div className="mt-3">
              <div className="text-[10px] font-bold text-[#4D4D4F] uppercase tracking-[.01em] mb-1">Riscos específicos inerentes à atividade</div>
              <Chips itens={d.riscosAtivos} vazio="Nenhum risco especial cadastrado"/>
              {d.riscosDetalhamento && <div className="text-[12px] text-black leading-[1.5] mt-1.5">{d.riscosDetalhamento}</div>}
            </div>

            <div className="grid grid-cols-2 gap-x-6 mt-3">
              <Item label="Brigada de incêndio" value={d.brigadistasQtd ? `${d.brigadistasQtd} membros` : ''}/>
              <Item label="Brigadistas profissionais" value={d.brigadistasProfissionaisQtd}/>
            </div>

            <div className="mt-3">
              <div className="text-[10px] font-bold text-[#4D4D4F] uppercase tracking-[.01em] mb-1">Sistemas de segurança contra incêndio</div>
              <Chips itens={d.sistemasAtivos} vazio="Nenhum sistema cadastrado"/>
            </div>

            <Item label="Rotas de fuga e ponto de encontro" value={d.pontoEncontro}/>
          </Secao>

          <Secao n="2" titulo="Procedimentos básicos de emergência contra incêndio">
            <Procedimento n="1" titulo="Alerta" texto={d.meioAlerta}/>
            <Procedimento n="2" titulo="Análise da situação" texto={`Responsável: ${d.respAnaliseSituacao}.`}/>
            <Procedimento n="3" titulo="Apoio externo" texto={`Responsável: ${d.respApoioExterno}. Corpo de Bombeiros: ${d.telefoneCBM}.`}/>
            <Procedimento n="4" titulo="Primeiros socorros" texto={`Responsável: ${d.respPrimeirosSocorros}.${d.hospitalReferencia ? ` Hospital de referência: ${d.hospitalReferencia}.` : ''}`}/>
            <Procedimento n="5" titulo="Eliminar riscos" texto={`Responsável: ${d.respEliminarRiscos}.`}/>
            <Procedimento n="6" titulo="Abandono de área" texto={`Responsável: ${d.respAbandono}.`}/>
            <Procedimento n="7" titulo="Isolamento de área" texto={`Responsável: ${d.respIsolamento}.`}/>
            <Procedimento n="8" titulo="Confinamento do incêndio" texto={`Responsável: ${d.respConfinamento}.`}/>
            <Procedimento n="9" titulo="Combate ao incêndio" texto={`Responsável: ${d.respCombate}.`}/>
            <Procedimento n="10" titulo="Investigação" texto={`Responsável: ${d.respInvestigacao}.`}/>
          </Secao>

          <div className="grid grid-cols-2 gap-8 mt-10 pt-4 print:mt-6 print:pt-2">
            <div className="text-center">
              <div className="border-t border-solid border-black pt-1.5 text-[11px] text-[#4D4D4F]">{d.proprietario || 'Responsável pela Empresa'}</div>
              <div className="text-[10px] text-[#8a8a8c]">Responsável pela Empresa (preposto)</div>
            </div>
            <div className="text-center">
              <div className="border-t border-solid border-black pt-1.5 text-[11px] text-[#4D4D4F]">{d.responsavelTecnico || 'Responsável Técnico'}</div>
              <div className="text-[10px] text-[#8a8a8c]">Responsável Técnico</div>
            </div>
          </div>

          <div className="text-center text-[9px] text-[#8a8a8c] mt-8 pt-2 print:mt-3 print:pt-1 border-t border-solid border-[#dcdcdc]">
            NT 16/2021 Gerenciamento de Risco (Anexo B) — gerado pelo ETOS Fire Utils em {hoje}
          </div>

        </div>
      </div>
    </div>
  )
}
