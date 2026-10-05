import { useEffect, useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { divisoesDaEstrutura } from '../../utils/classificacao'
import { montarLinhas, classeResolvida, ORDEM_CLASSE, NORMAS_ENSAIO_POR_ELEMENTO, parseNormasEnsaio } from '../../data/cmar_calc'
import { MATERIAIS_INCOMBUSTIVEIS, buscarMaterialIncombustivel, CLASSE_INCOMBUSTIVEL, MATERIAIS_ENSAIADOS, buscarMaterialEnsaiado } from '../../data/materiaisAcabamento'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import InlineEditableNome from '../../components/ui/InlineEditableNome'
import { statusEstrutura, statusPorProgresso } from '../../utils/statusEstrutura'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

// Descrição oficial da divisão (ex.: "A-3" -> "Habitação coletiva") — OCUPACOES
// é indexado pela letra do grupo, com as divisões aninhadas em `.divisoes`
// (mesma resolução usada em descricaoDivisao, MemorialDescritivoPage.jsx).
// Usada só pra sugerir o nome inicial de um ambiente semeado automaticamente
// (ver useEffect de semeadura em ControleAcabamentoPage) — depois disso o
// nome é 100% editável pelo usuário.
function descricaoDivisao(ocupacoes, divisao) {
  return ocupacoes?.[divisao.charAt(0)]?.divisoes?.[divisao] || ''
}

const th = 'py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]'
const td = 'py-2 px-3 text-xs align-top'
const input = 'bg-bg border border-solid border-border rounded-md text-ink text-[11px] py-1.5 px-2 w-full outline-none box-border'

// Uma linha (elemento construtivo de um ambiente) do Quadro Resumo de
// Controle de Materiais de Acabamento. O material incombustível e o
// material do catálogo de ensaiados resolvem a classe sozinhos (itens 6/7
// das instruções normativas); qualquer outro material só é aceito com
// fabricante e nº do laudo preenchidos (nunca presumir classe).
function LinhaAcabamento({ estruturaId, linha, dispatch }) {
  const { elemento, elementoLabel, item } = linha
  const manual = item?.origem === 'manual'
  const ensaiado = item?.origem === 'ensaiado'
  const incombustivel = item?.origem === 'incombustivel'
  const naoPossui = item?.origem === 'nao_possui'
  const [editando, setEditando] = useState(manual && !(item.classeAdotada && item.fabricante && item.laudoNumero))
  const materiaisEnsaiadosDoElemento = MATERIAIS_ENSAIADOS[elemento] || []
  const normasDisponiveis = NORMAS_ENSAIO_POR_ELEMENTO[elemento] || []

  const set = (changes) => dispatch({ type: 'SET_ACABAMENTO', estruturaId, chave: linha.chave, changes })

  // Lista pré-marcável por elemento (item 9 das instruções) — o que não
  // está na lista de referência (ex.: uma norma de sistema especial) fica
  // no campo livre abaixo, preservado junto com o que for marcado/
  // desmarcado nos checkboxes.
  const normasAtuais = parseNormasEnsaio(item?.normasEnsaio)
  const normasMarcadas = normasAtuais.filter(n => normasDisponiveis.includes(n))
  const normaExtra = normasAtuais.filter(n => !normasDisponiveis.includes(n)).join(', ')

  const toggleNorma = (norma) => {
    const novas = normasMarcadas.includes(norma)
      ? normasAtuais.filter(n => n !== norma)
      : [...normasAtuais, norma]
    set({ normasEnsaio: novas.join(', ') })
  }

  const setNormaExtra = (texto) => {
    set({ normasEnsaio: [...normasMarcadas, ...parseNormasEnsaio(texto)].join(', ') })
  }

  const handleMaterial = (e) => {
    const val = e.target.value
    if (val === '') { set({ origem: '', materialId: '', materialNome: '', classeAdotada: '', fabricante: '', laudoNumero: '', laudoValidade: '' }); setEditando(false); return }
    if (val === 'nao_possui') { set({ origem: 'nao_possui', materialId: '', materialNome: '', classeAdotada: '', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' }); setEditando(false); return }
    if (val === 'manual') { set({ origem: 'manual', materialId: '', materialNome: '', classeAdotada: '', fabricante: '', laudoNumero: '', laudoValidade: '' }); setEditando(true); return }
    if (val.startsWith('ensaiado:')) {
      const mat = buscarMaterialEnsaiado(elemento, val.slice('ensaiado:'.length))
      set({ origem: 'ensaiado', materialId: mat?.id || '', materialNome: mat?.nome || '', classeAdotada: mat?.classe || '', fabricante: '', laudoNumero: '', laudoValidade: '' })
      setEditando(false)
      return
    }
    const mat = buscarMaterialIncombustivel(val)
    set({ origem: 'incombustivel', materialId: val, materialNome: mat?.nome || '', classeAdotada: CLASSE_INCOMBUSTIVEL, fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' })
    setEditando(false)
  }

  const classeMostrada = naoPossui ? 'N/A' : incombustivel ? CLASSE_INCOMBUSTIVEL : (ensaiado || manual ? item.classeAdotada : '')

  return (
    <>
      <tr className="border-b border-solid border-border last:border-b-0">
        <td className={`${td} text-ink whitespace-nowrap`}>{elementoLabel}</td>
        <td className={td}>
          <select
            value={manual ? 'manual' : ensaiado ? `ensaiado:${item.materialId}` : naoPossui ? 'nao_possui' : (item?.materialId || '')}
            onChange={handleMaterial}
            className={input}
          >
            <option value="">Selecionar material…</option>
            <option value="nao_possui">Não possui este elemento</option>
            <optgroup label="Incombustíveis (Classe I automática)">
              {MATERIAIS_INCOMBUSTIVEIS.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </optgroup>
            {materiaisEnsaiadosDoElemento.length > 0 && (
              <optgroup label="Materiais ensaiados (catálogo)">
                {materiaisEnsaiadosDoElemento.map(m => (
                  <option key={m.id} value={`ensaiado:${m.id}`}>{m.nome} — Classe {m.classe}</option>
                ))}
              </optgroup>
            )}
            <option value="manual">Outro material (informar / anexar laudo)</option>
          </select>
          {manual && (
            <button type="button" onClick={() => setEditando(o => !o)} className="text-[10px] text-ink-faint underline mt-1 cursor-pointer">
              {editando ? 'ocultar dados do laudo' : (item.materialNome || 'editar dados do laudo')}
            </button>
          )}
        </td>
        <td className={`${td} text-ink text-center whitespace-nowrap`}>{classeMostrada || '—'}</td>
        <td className={td}>
          {naoPossui ? (
            <span className="text-ink-faint">N/A — elemento não possui</span>
          ) : incombustivel ? (
            <span className="text-ink-faint">Não aplicável — material incombustível</span>
          ) : normasDisponiveis.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {normasDisponiveis.map(norma => (
                  <label key={norma} className="flex items-center gap-1.5 text-[11px] text-ink-faint whitespace-nowrap cursor-pointer">
                    <input type="checkbox" checked={normasMarcadas.includes(norma)} onChange={() => toggleNorma(norma)}/>
                    {norma}
                  </label>
                ))}
              </div>
              <input
                placeholder="outra norma…"
                value={normaExtra}
                onChange={e => setNormaExtra(e.target.value)}
                className={`${input} mt-1.5`}
              />
            </>
          ) : (
            <input
              placeholder="ex.: EN 13823 – SBI"
              value={item?.normasEnsaio || ''}
              onChange={e => set({ normasEnsaio: e.target.value })}
              className={input}
            />
          )}
        </td>
      </tr>
      {manual && editando && (
        <tr className="border-b border-solid border-border last:border-b-0">
          <td colSpan={4} className="py-3 px-3 bg-surface-2">
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

// Caixa "Edificação/Ambiente" — retrátil, nome 100% editável (clique no
// nome ou no lápis) e removível pelo usuário. Mesmo estilo-base dos cards
// de ambiente de Extintores/Saída de Emergência (AmbienteCard,
// ExtintoresPage.jsx e InlineEditableNome, compartilhado entre os dois) —
// só cor e formatação reaproveitadas daqui, sem o arrastar-e-soltar deles.
function TabelaAcabamento({ ambiente, linhas, estruturaId, dispatch }) {
  const [aberto, setAberto] = useState(true)
  const renomear = (nome) => dispatch({ type: 'RENAME_AMBIENTE_ACABAMENTO', id: ambiente.id, nome })
  const remover = (e) => {
    e.stopPropagation()
    dispatch({ type: 'REMOVE_AMBIENTE_ACABAMENTO', id: ambiente.id })
  }

  return (
    <div className="group rounded-lg border border-solid border-border bg-surface hover:border-white/20 transition-colors mb-3">
      <div
        className={`flex items-center justify-between gap-4 py-3 px-3.5 cursor-pointer select-none bg-surface-2 ${aberto ? 'rounded-t-[7px] border-b border-solid border-border' : 'rounded-[7px]'}`}
        onClick={() => setAberto(a => !a)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon name={aberto ? 'chevD' : 'chevR'} size={15} className="text-ink-faint shrink-0"/>
          <InlineEditableNome value={ambiente.nome} onCommit={renomear} textClassName="font-heading text-[13px] font-semibold text-ink truncate"/>
        </div>
        <button type="button" onClick={remover} className="bg-transparent border-none text-ink-faint hover:text-red cursor-pointer p-1 shrink-0" title="Remover ambiente">
          <Icon name="trash" size={12}/>
        </button>
      </div>
      {aberto && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[640px]">
            <colgroup>
              <col className="w-[120px]"/>
              <col className="w-[27%]"/>
              <col className="w-[64px]"/>
              <col/>
            </colgroup>
            <thead>
              <tr className="border-b border-solid border-border">
                <th className={th}>Elemento construtivo</th>
                <th className={th}>Material</th>
                <th className={`${th} text-center`}>Classe</th>
                <th className={th}>Normas de ensaio</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(l => <LinhaAcabamento key={l.chave} estruturaId={estruturaId} linha={l} dispatch={dispatch}/>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EstruturaAcabamento({ est, ambientes, itens, dispatch, exigido }) {
  const linhasPorAmbiente = ambientes.map(amb => ({ ambiente: amb, linhas: montarLinhas(amb, itens) }))
  const todasLinhas = linhasPorAmbiente.flatMap(({ linhas }) => linhas)
  const preenchidas = todasLinhas.filter(l => l.item?.origem === 'nao_possui' || classeResolvida(l.item)).length
  const status = exigido
    ? statusPorProgresso(preenchidas, todasLinhas.length, { pendente: 'Nenhum material informado', concluido: 'Materiais informados' })
    : statusEstrutura('concluido', 'Não exigida')

  const adicionarAmbiente = () => dispatch({ type: 'ADD_AMBIENTE_ACABAMENTO', estruturaId: est.id, nome: `Ambiente ${ambientes.length + 1}` })

  return (
    <EstruturaSection titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est} semArea/>} status={status} conclusao={exigido ? { estruturaId: est.id, medida: 'controle_acabamento' } : null} defaultOpen={false}>
      {!exigido ? (
        <div className="ibox green">
          <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
          <span className="text-xs">Controle de materiais de acabamento não exigido para a ocupação/altura atual desta estrutura, conforme NT 01 CBMMA.</span>
        </div>
      ) : (
        <>
          {ambientes.length === 0 && (
            <div className="ibox amber">
              <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span className="text-xs">Nenhum ambiente cadastrado nesta estrutura ainda — adicione um abaixo.</span>
            </div>
          )}

          {linhasPorAmbiente.map(({ ambiente, linhas }) => (
            <TabelaAcabamento key={ambiente.id} ambiente={ambiente} linhas={linhas} estruturaId={est.id} dispatch={dispatch}/>
          ))}

          <button type="button" onClick={adicionarAmbiente} className="btn-add w-full justify-center py-2">
            <Icon name="plus" size={12}/> Adicionar ambiente
          </button>
        </>
      )}
    </EstruturaSection>
  )
}

export default function ControleAcabamentoPage() {
  const { state, dispatch } = useProjeto()
  const { ocupacoes } = useNorma()
  const { porEstrutura } = useMedidasObrigatorias()

  // Semeia uma caixa de ambiente por divisão já classificada na estrutura —
  // só da primeira vez que a estrutura aparece aqui sem nenhuma caixa (ver
  // INIT_AMBIENTES_ACABAMENTO no reducer, idempotente). Depois disso o
  // conjunto de ambientes é 100% gerido pelo usuário: a semeadura nunca
  // roda de novo nem sobrescreve nomes já editados ou caixas já removidas
  // (mesmo padrão de INIT_CARGA, ver Step5.jsx).
  const estruturasParaSemear = state.estruturas
    .filter(est => !state.acabamentoAmbientes.some(a => a.estruturaId === est.id))
    .map(est => ({ est, divisoes: divisoesDaEstrutura(state.pavimentos.filter(p => p.estruturaId === est.id)) }))
    .filter(({ divisoes }) => divisoes.length > 0)

  const seedDepsKey = estruturasParaSemear.map(({ est, divisoes }) => `${est.id}:${divisoes.join('|')}`).join(';')

  useEffect(() => {
    estruturasParaSemear.forEach(({ est, divisoes }) => {
      const ambientes = divisoes.map(d => ({
        id: `${est.id}-amb-${d}`,
        estruturaId: est.id,
        nome: descricaoDivisao(ocupacoes, d) ? `${d} — ${descricaoDivisao(ocupacoes, d)}` : d,
      }))
      dispatch({ type: 'INIT_AMBIENTES_ACABAMENTO', estruturaId: est.id, ambientes })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedDepsKey])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
            <Icon name={SISTEMA_ICON.controle_acabamento} size={20} color="var(--color-red)" className="shrink-0"/>
            Controle de Materiais de Acabamento e Revestimento
          </h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[640px] m-0">
            Quadro Resumo de Controle de Materiais de Acabamento por estrutura — um ambiente por caixa (nome livre, editável), com piso, parede/divisórias, teto/forro, cobertura e isolamento térmico acústico cada um. Materiais incombustíveis recebem Classe I automaticamente, e produtos do catálogo de materiais já ensaiados (piso, parede e teto) têm a classe preenchida direto do ensaio; qualquer outro material exige fabricante e nº do laudo para a classe ser considerada comprovada.
          </p>
        </div>

        {state.estruturas.map(est => {
          const pe = porEstrutura.find(p => p.estrutura.id === est.id)
          return (
            <EstruturaAcabamento
              key={est.id}
              est={est}
              ambientes={state.acabamentoAmbientes.filter(a => a.estruturaId === est.id)}
              itens={state.acabamentos.filter(a => a.estruturaId === est.id)}
              dispatch={dispatch}
              exigido={!!pe?.sistemas?.controle_acabamento?.ativo}
            />
          )
        })}
      </div>
    </div>
  )
}
