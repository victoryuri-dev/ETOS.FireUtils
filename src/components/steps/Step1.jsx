import { useState, useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useCnpjLookup } from '../../hooks/useCnpjLookup'
import { getEstadosDisponiveis } from '../../data/normas/index'
import Icon from '../ui/Icon'
import FormSection from '../ui/FormSection'

const S = {
  section: 'max-w-[980px] mx-auto pt-8 px-10 pb-20',
  header: 'mb-8',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
}

function maskCNPJ(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

// ── Seletor de "Proprietario do imovel" ─────────────────────────────────
// Janela com as opcoes: mesmo que o responsavel pelo uso, cada socio do
// quadro societario (QSA) trazido pela busca de CNPJ em "Responsavel pelo
// uso" (reaproveita o mesmo CNPJ — o dono do imovel costuma ser a propria
// empresa ou um dos socios dela), ou preenchimento manual.
function ProprietarioSeletorModal({ qsa, respRazaoSocial, onEscolherResponsavel, onEscolherSocio, onEscolherManual, onClose }) {
  return (
    <div className="fixed inset-0 z-[500] bg-black/65 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-surface border border-solid border-border rounded-lg w-[480px] max-w-[96vw] max-h-[85vh] flex flex-col overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 py-[18px] px-[22px] border-b border-solid border-border shrink-0">
          <div className="text-base font-bold text-ink">Quem e o proprietario do imovel?</div>
          <button type="button" className="btn-ghost p-1.5 shrink-0" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-[22px] flex flex-col gap-2">
          <button
            type="button" onClick={onEscolherResponsavel} disabled={!respRazaoSocial}
            className="text-left border border-solid border-border rounded-md py-3 px-3.5 hover:border-ink-hint hover:bg-surface-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent"
          >
            <div className="text-[13px] font-semibold text-ink">Mesmo que o responsavel pelo uso</div>
            <div className="text-xs text-ink-faint mt-0.5">{respRazaoSocial || 'Preencha o CNPJ em "Responsavel pelo uso" primeiro'}</div>
          </button>

          {qsa.length > 0 && (
            <>
              <div className="text-[10px] font-medium text-ink-faint uppercase tracking-[.06em] mt-2 mb-1">Quadro societario (do CNPJ buscado)</div>
              {qsa.map((s, i) => (
                <button
                  key={i} type="button" onClick={() => onEscolherSocio(i)}
                  className="text-left border border-solid border-border rounded-md py-3 px-3.5 hover:border-ink-hint hover:bg-surface-2 transition-colors"
                >
                  <div className="text-[13px] font-semibold text-ink">{s.nome_socio}</div>
                  <div className="text-xs text-ink-faint mt-0.5">{[s.qualificacao_socio, s.cnpj_cpf_do_socio].filter(Boolean).join(' — ')}</div>
                </button>
              ))}
            </>
          )}

          <div className="text-[10px] font-medium text-ink-faint uppercase tracking-[.06em] mt-2 mb-1">Outro</div>
          <button
            type="button" onClick={onEscolherManual}
            className="text-left border border-solid border-border rounded-md py-3 px-3.5 hover:border-ink-hint hover:bg-surface-2 transition-colors"
          >
            <div className="text-[13px] font-semibold text-ink">Preencher manualmente</div>
            <div className="text-xs text-ink-faint mt-0.5">Proprietario diferente dos listados acima</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Step1({ step, totalSteps }) {
  const { state, dispatch } = useProjeto()
  const { buscar, loading, error, warning, enderecoFiscal, aplicarEndereco, qsa } = useCnpjLookup()
  // Fonte dos dados de "Proprietario do imovel", escolhida no seletor:
  // 'manual' (padrao — digita livre), 'responsavel' (espelha "Responsavel
  // pelo uso", mesmo comportamento do checkbox que existia aqui antes) ou
  // 'socio' (preenchido uma vez a partir de qsa[socioIndex], editavel depois).
  const [proprietarioFonte, setProprietarioFonte] = useState('manual')
  const [socioIndex, setSocioIndex] = useState(null)
  const [seletorAberto, setSeletorAberto] = useState(false)
  const set = f => e => dispatch({ type:'SET_FIELD', field:f, value:e.target.value })
  const estadosDisponiveis = getEstadosDisponiveis()
  const setCNPJ = e => dispatch({ type:'SET_FIELD', field:'respCNPJ', value: maskCNPJ(e.target.value) })

  // Erros e avisos da busca por CNPJ aparecem logo abaixo do campo (toasts
  // ficam reservados ao retorno das importações do Revit). O endereço fiscal
  // encontrado fica na seção "Localizacao da obra".
  const mostrarEnderecoFiscal = !!enderecoFiscal

  // Mantem "Proprietario do imovel" espelhando "Responsavel pelo uso" enquanto essa
  // for a fonte escolhida no seletor — evita digitar os mesmos dados duas vezes
  // quando e a mesma empresa/pessoa. Socio do quadro societario e um preenchimento
  // unico (ver escolherSocio), nao fica espelhando nada depois.
  useEffect(() => {
    if (proprietarioFonte !== 'responsavel') return
    dispatch({ type:'SET_FIELD', field:'propNome', value: state.respRazaoSocial })
    dispatch({ type:'SET_FIELD', field:'propDocumento', value: state.respCNPJ })
    dispatch({ type:'SET_FIELD', field:'propTelefone', value: state.respTelefone })
  }, [proprietarioFonte, state.respRazaoSocial, state.respCNPJ, state.respTelefone])

  function escolherResponsavel() {
    setProprietarioFonte('responsavel')
    setSocioIndex(null)
    setSeletorAberto(false)
  }
  function escolherSocio(i) {
    const socio = qsa[i]
    if (!socio) return
    setProprietarioFonte('socio')
    setSocioIndex(i)
    dispatch({ type:'SET_FIELD', field:'propNome', value: socio.nome_socio || '' })
    dispatch({ type:'SET_FIELD', field:'propDocumento', value: socio.cnpj_cpf_do_socio || '' })
    dispatch({ type:'SET_FIELD', field:'propTelefone', value: '' })
    setSeletorAberto(false)
  }
  function escolherManual() {
    setProprietarioFonte('manual')
    setSocioIndex(null)
    setSeletorAberto(false)
  }

  const resumoProprietarioFonte = proprietarioFonte === 'responsavel'
    ? 'Mesmo que o responsavel pelo uso.'
    : proprietarioFonte === 'socio' && qsa[socioIndex]
      ? `Do quadro societario: ${qsa[socioIndex].nome_socio}.`
      : 'Preenchimento manual.'

  return (
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa {step} de {totalSteps}</div>
        <h2 className={S.title}>Identificacao do projeto</h2>
        <p className={S.desc}>Comece pelo CNPJ da empresa para pre-preencher os dados — depois confirme o endereco da obra e os demais responsaveis.</p>
      </div>

      <div className="fg mb-6">
        <label className="text-[13px]">Nome do projeto <span className="req">*</span></label>
        <input value={state.nome} onChange={set('nome')} placeholder="Ex: Edificio Comercial Centro" className="text-[15px] py-3"/>
      </div>

      <FormSection title="Responsavel pelo uso" description="Empresa ou pessoa que ocupa o imovel — pode ser diferente do proprietario.">
        <div className="ibox blue"><Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/><span>Buscar pelo CNPJ preenche os dados abaixo automaticamente.</span></div>

        <div className="fg mb-3">
          <label>CNPJ <span className="req">*</span></label>
          <div className="flex gap-2 items-start">
            <input value={state.respCNPJ} onChange={setCNPJ} placeholder="00.000.000/0000-00" className="flex-1"/>
            <button type="button" className="btn-ghost shrink-0" disabled={loading} onClick={() => buscar(state.respCNPJ)}>
              <Icon name="search" size={12}/> {loading ? 'Buscando...' : 'Preencher pelo CNPJ'}
            </button>
          </div>
          {error && (
            <div className="ibox red mt-2 mb-0" role="alert">
              <Icon name="warn" size={13} color="var(--color-red)" className="shrink-0"/>
              <span className="text-xs">{error}</span>
            </div>
          )}
          {!error && warning && (
            <div className="ibox amber mt-2 mb-0" role="status">
              <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span className="text-xs">{warning}</span>
            </div>
          )}
        </div>

        <div className="g2 mb-3">
          <div className="fg"><label>Razao social <span className="req">*</span></label><input value={state.respRazaoSocial} onChange={set('respRazaoSocial')}/></div>
          <div className="fg"><label>Nome fantasia</label><input value={state.respFantasia} onChange={set('respFantasia')}/></div>
        </div>
        <div className="g2 mb-3">
          <div className="fg"><label>Telefone</label><input type="tel" value={state.respTelefone} onChange={set('respTelefone')}/></div>
          <div className="fg"><label>E-mail</label><input type="email" value={state.respEmail} onChange={set('respEmail')}/></div>
        </div>
      </FormSection>

      <FormSection title="Localizacao da obra">
        {mostrarEnderecoFiscal && (
          <div className="ibox blue mb-4 flex-col items-stretch gap-3">
            <div className="flex items-start gap-2.5">
              <Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0 mt-0.5"/>
              <div className="text-xs leading-[1.6]">
                <div className="font-semibold text-ink mb-0.5">Endereco fiscal encontrado pelo CNPJ</div>
                {enderecoFiscal.logradouro}, {enderecoFiscal.numero} — {enderecoFiscal.bairro}, {enderecoFiscal.cidade} — {enderecoFiscal.uf}, CEP {enderecoFiscal.cep}.
                {' '}Pode ser diferente do endereco da obra — confirme antes de usar.
              </div>
            </div>
            <div className="flex gap-2 pl-6">
              <button type="button" className="btn-ghost" onClick={aplicarEndereco}>Usar como endereco da obra</button>
            </div>
          </div>
        )}

        <div className="g3 mb-3">
          <div className="fg col-span-2"><label>Logradouro (rua, avenida...) <span className="req">*</span></label><input value={state.endereco} onChange={set('endereco')} placeholder="Rua Grande"/></div>
          <div className="fg"><label>Numero</label><input value={state.numero} onChange={set('numero')} placeholder="123"/></div>
        </div>
        <div className="g3 mb-3">
          <div className="fg"><label>Complemento</label><input value={state.complemento} onChange={set('complemento')} placeholder="Sala, andar..."/></div>
          <div className="fg"><label>Bairro</label><input value={state.bairro} onChange={set('bairro')} placeholder="Centro"/></div>
          <div className="fg"><label>CEP</label><input value={state.cep} onChange={set('cep')} placeholder="65000-000"/></div>
        </div>
        <div className="g3">
          <div className="fg"><label>Cidade <span className="req">*</span></label><input value={state.cidade} onChange={set('cidade')} placeholder="Sao Luis"/></div>
          <div className="fg">
            <label>Estado <span className="req">*</span></label>
            <select value={state.uf} onChange={set('uf')}>
              {estadosDisponiveis.map(e => (
                <option key={e.uf} value={e.uf} disabled={!e.ativo}>
                  {e.nome}{!e.ativo ? ' — em breve' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Proprietario do imovel">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[12px] text-ink-muted">{resumoProprietarioFonte}</span>
          <button type="button" className="btn-ghost shrink-0" onClick={() => setSeletorAberto(true)}>
            <Icon name="search" size={12}/> Selecionar proprietario
          </button>
        </div>
        <div className="g2 mb-3">
          <div className="fg"><label>Nome / Razao social <span className="req">*</span></label><input value={state.propNome} onChange={set('propNome')} readOnly={proprietarioFonte === 'responsavel'}/></div>
          <div className="fg"><label>CPF / CNPJ <span className="req">*</span></label><input value={state.propDocumento} onChange={set('propDocumento')} readOnly={proprietarioFonte === 'responsavel'}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label>Telefone</label><input type="tel" value={state.propTelefone} onChange={set('propTelefone')} placeholder="(99) 99999-9999" readOnly={proprietarioFonte === 'responsavel'}/></div>
          <div className="fg"><label>E-mail</label><input type="email" value={state.propEmail} onChange={set('propEmail')}/></div>
        </div>
      </FormSection>

      {seletorAberto && (
        <ProprietarioSeletorModal
          qsa={qsa}
          respRazaoSocial={state.respRazaoSocial}
          onEscolherResponsavel={escolherResponsavel}
          onEscolherSocio={escolherSocio}
          onEscolherManual={escolherManual}
          onClose={() => setSeletorAberto(false)}
        />
      )}
    </div>
  )
}
