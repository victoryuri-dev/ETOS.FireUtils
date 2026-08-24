import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { divisoesDaEstrutura } from '../../utils/classificacao'
import { montarLinhas, resumoCMAR, ORDEM_CLASSE, formatarClasses } from '../../data/cmar_calc'
import { MATERIAIS_INCOMBUSTIVEIS, buscarMaterialIncombustivel, CLASSE_INCOMBUSTIVEL } from '../../data/materiaisAcabamento'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}

// Descrição oficial da divisão (ex.: "A-3" -> "Habitação coletiva") — OCUPACOES
// é indexado pela letra do grupo, com as divisões aninhadas em `.divisoes`
// (mesma resolução usada em descricaoDivisao, MemorialDescritivoPage.jsx).
function descricaoDivisao(ocupacoes, divisao) {
  return ocupacoes?.[divisao.charAt(0)]?.divisoes?.[divisao] || ''
}

const th = 'py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]'
const td = 'py-2 px-3 text-xs align-top'
const input = 'bg-bg border border-solid border-border rounded-md text-ink text-[11px] py-1.5 px-2 w-full outline-none box-border'

const RESULTADO_INFO = {
  ATENDE:              { cls: 'text-green',     label: 'Atende' },
  NAO_ATENDE:          { cls: 'text-red',       label: 'Não atende' },
  PENDENTE_LAUDO:      { cls: 'text-amber',     label: 'Pendente de laudo' },
  NAO_PREENCHIDO:      { cls: 'text-ink-faint', label: 'A preencher' },
  SEM_DADO_NORMATIVO:  { cls: 'text-amber',     label: 'Pendente de norma' },
}

// Uma linha (elemento construtivo de uma divisão) do Quadro Resumo de
// Controle de Materiais de Acabamento. O material incombustível resolve a
// classe sozinho (item 7 das instruções normativas); qualquer outro
// material só é aceito com fabricante e nº do laudo preenchidos (item 6 —
// nunca presumir classe).
function LinhaAcabamento({ estruturaId, linha, dispatch }) {
  const { elementoLabel, classesExigidas, item, resultado } = linha
  const manual = item?.origem === 'manual'
  const [editando, setEditando] = useState(manual && !(item.classeAdotada && item.fabricante && item.laudoNumero))

  const set = (changes) => dispatch({ type: 'SET_ACABAMENTO', estruturaId, chave: linha.chave, changes })

  const handleMaterial = (e) => {
    const val = e.target.value
    if (val === '') { set({ origem: '', materialId: '', materialNome: '', classeAdotada: '', fabricante: '', laudoNumero: '', laudoValidade: '' }); setEditando(false); return }
    if (val === 'manual') { set({ origem: 'manual', materialId: '', materialNome: '', classeAdotada: '', fabricante: '', laudoNumero: '', laudoValidade: '' }); setEditando(true); return }
    const mat = buscarMaterialIncombustivel(val)
    set({ origem: 'incombustivel', materialId: val, materialNome: mat?.nome || '', classeAdotada: CLASSE_INCOMBUSTIVEL, fabricante: '', laudoNumero: '', laudoValidade: '' })
    setEditando(false)
  }

  const classeMostrada = item?.origem === 'incombustivel' ? CLASSE_INCOMBUSTIVEL : (manual ? item.classeAdotada : '')
  const r = RESULTADO_INFO[resultado] || RESULTADO_INFO.NAO_PREENCHIDO

  return (
    <>
      <tr className="border-b border-solid border-border last:border-b-0">
        <td className={`${td} text-ink whitespace-nowrap`}>{elementoLabel}</td>
        <td className={td}>
          <select
            value={manual ? 'manual' : (item?.materialId || '')}
            onChange={handleMaterial}
            className={input}
          >
            <option value="">Selecionar material…</option>
            <optgroup label="Incombustíveis (Classe I automática)">
              {MATERIAIS_INCOMBUSTIVEIS.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </optgroup>
            <option value="manual">Outro material (informar / anexar laudo)</option>
          </select>
          {manual && (
            <button type="button" onClick={() => setEditando(o => !o)} className="text-[10px] text-ink-faint underline mt-1 cursor-pointer">
              {editando ? 'ocultar dados do laudo' : (item.materialNome || 'editar dados do laudo')}
            </button>
          )}
        </td>
        <td className={`${td} text-ink-faint`}>
          {formatarClasses(classesExigidas) || <span className="text-amber whitespace-nowrap">Pendente de norma</span>}
        </td>
        <td className={`${td} text-ink whitespace-nowrap`}>{classeMostrada || '—'}</td>
        <td className={td}>
          <input
            placeholder="ex.: ISO 1182, NBR 9442"
            value={item?.normasEnsaio || ''}
            onChange={e => set({ normasEnsaio: e.target.value })}
            className={input}
          />
        </td>
        <td className={`${td} font-semibold whitespace-nowrap ${r.cls}`}>{r.label}</td>
      </tr>
      {manual && editando && (
        <tr className="border-b border-solid border-border last:border-b-0">
          <td colSpan={6} className="py-3 px-3 bg-surface-2">
            <div className="grid grid-cols-4 gap-2">
              <input placeholder="Nome do material" value={item.materialNome} onChange={e => set({ materialNome: e.target.value })} className={input}/>
              <select value={item.classeAdotada} onChange={e => set({ classeAdotada: e.target.value })} className={input}>
                <option value="">Classe (aguardando laudo)</option>
                {ORDEM_CLASSE.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Fabricante / modelo" value={item.fabricante} onChange={e => set({ fabricante: e.target.value })} className={input}/>
              <input placeholder="Nº do laudo / ensaio" value={item.laudoNumero} onChange={e => set({ laudoNumero: e.target.value })} className={input}/>
            </div>
            <div className="text-[10px] text-ink-faint mt-1.5 leading-[1.5]">
              A classe só é considerada comprovada com fabricante/modelo e nº do laudo preenchidos — conforme a NT 10/2021 CBMMA, a classe de reação ao fogo não pode ser presumida sem documentação técnica do produto.
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function TabelaAcabamento({ titulo, linhas, estruturaId, dispatch }) {
  return (
    <Card className="mb-3">
      <div className="py-2.5 px-3 border-b border-solid border-border">
        <div className="text-xs font-semibold text-ink">{titulo}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-solid border-border">
              <th className={th}>Elemento construtivo</th>
              <th className={th}>Material</th>
              <th className={th}>Classe exigida</th>
              <th className={th}>Classe adotada</th>
              <th className={th}>Normas de ensaio</th>
              <th className={th}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(l => <LinhaAcabamento key={l.chave} estruturaId={estruturaId} linha={l} dispatch={dispatch}/>)}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

const RESUMO_INFO = {
  ATENDE:                { cls: 'ibox green', titulo: 'ATENDE', texto: 'Todos os materiais possuem classificação compatível com as exigências da NT 10/2021 CBMMA.' },
  ATENDE_COM_PENDENCIAS: { cls: 'ibox amber', titulo: 'ATENDE COM PENDÊNCIAS DOCUMENTAIS', texto: 'Os materiais especificados são potencialmente compatíveis, porém há linhas sem material selecionado ou sem os dados de laudo necessários para comprovar a classe.' },
  NAO_ATENDE:            { cls: 'ibox red',   titulo: 'NÃO ATENDE', texto: 'Um ou mais materiais possuem classificação inferior à exigida pela NT 10/2021 CBMMA.' },
  DADOS_INSUFICIENTES:   { cls: 'ibox amber', titulo: 'DADOS INSUFICIENTES', texto: 'Uma ou mais linhas (cobertura, isolamento térmico acústico, ou divisão sem dado normativo cadastrado para este estado) ainda não têm classe exigida definida — não é possível concluir a análise até isso ser preenchido.' },
}

function EstruturaAcabamento({ est, pavimentos, tabela, ocupacoes, itens, dispatch }) {
  const divisoes = divisoesDaEstrutura(pavimentos)
  const linhas = montarLinhas(divisoes, tabela, itens)
  const resumo = resumoCMAR(linhas)
  const info = RESUMO_INFO[resumo]

  return (
    <EstruturaSection titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est}/>}>
      {Object.keys(tabela).length === 0 ? (
        <div className="ibox amber">
          <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-xs">A Tabela B.1 (Anexo B) da NT 10/2021 CBMMA ainda não foi cadastrada para este estado — as classes exigidas abaixo ficarão pendentes até isso ser preenchido.</span>
        </div>
      ) : (
        <div className="ibox amber">
          <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-xs">A classe exigida para <strong>cobertura</strong> e <strong>isolamento térmico acústico</strong> ainda não foi cadastrada (a Tabela B.1 não traz essas colunas) — essas linhas ficarão pendentes até uma referência normativa ser informada.</span>
        </div>
      )}

      {divisoes.length === 0 ? (
        <div className="ibox amber">
          <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-xs">Nenhuma divisão de ocupação cadastrada nesta estrutura ainda — volte à Etapa 2 (Pavimentos) para classificá-la.</span>
        </div>
      ) : (
        divisoes.map(divisao => (
          <TabelaAcabamento
            key={divisao}
            titulo={descricaoDivisao(ocupacoes, divisao) ? `${divisao} — ${descricaoDivisao(ocupacoes, divisao)}` : divisao}
            linhas={linhas.filter(l => l.divisao === divisao)}
            estruturaId={est.id}
            dispatch={dispatch}
          />
        ))
      )}

      <div className={info.cls}>
        <Icon name={resumo === 'ATENDE' ? 'check' : 'warn'} size={14} color={`var(--color-${resumo === 'ATENDE' ? 'green' : resumo === 'NAO_ATENDE' ? 'red' : 'amber'})`} className="shrink-0"/>
        <span className="text-xs"><strong>{info.titulo}</strong> — {info.texto}</span>
      </div>
    </EstruturaSection>
  )
}

export default function ControleAcabamentoPage() {
  const { state, dispatch } = useProjeto()
  const { cmar, ocupacoes } = useNorma()
  const { TABELA_B1 } = cmar

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1100px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
            <Icon name={SISTEMA_ICON.controle_acabamento} size={20} color="var(--color-red)" className="shrink-0"/>
            Controle de Materiais de Acabamento e Revestimento
          </h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[640px] m-0">
            Quadro Resumo de Controle de Materiais de Acabamento por estrutura — piso, parede/divisórias, teto/forro, cobertura e isolamento térmico acústico de cada ocupação, conforme Anexo B da NT 10/2021 CBMMA. Materiais incombustíveis (concreto, vidro, gesso, cerâmica, pedra natural, alvenaria, metais) recebem Classe I automaticamente; qualquer outro material exige fabricante e nº do laudo para a classe ser considerada comprovada.
          </p>
        </div>

        {state.estruturas.map(est => (
          <EstruturaAcabamento
            key={est.id}
            est={est}
            pavimentos={state.pavimentos.filter(p => p.estruturaId === est.id)}
            tabela={TABELA_B1}
            ocupacoes={ocupacoes}
            itens={state.acabamentos.filter(a => a.estruturaId === est.id)}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}
