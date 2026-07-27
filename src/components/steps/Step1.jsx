import { useState, useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useCnpjLookup } from '../../hooks/useCnpjLookup'
import { ESTADOS_DISPONIVEIS, getNormaInfo } from '../../data/normas/index'
import Icon from '../ui/Icon'

const S = {
  section: 'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',
  header: 'mb-[26px]',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
  block: 'mb-[26px]',
  blockTitle: 'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border',
}

function maskCNPJ(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export default function Step1() {
  const { state, dispatch } = useProjeto()
  const { buscar, loading, error, warning, enderecoFiscal, aplicarEndereco } = useCnpjLookup()
  const [mesmoResponsavel, setMesmoResponsavel] = useState(false)
  const set = f => e => dispatch({ type:'SET_FIELD', field:f, value:e.target.value })
  const setCNPJ = e => dispatch({ type:'SET_FIELD', field:'respCNPJ', value: maskCNPJ(e.target.value) })
  const setCNAE = e => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 7)
    const masked = d.length <= 4 ? d : d.length === 5 ? `${d.slice(0,4)}-${d[4]}` : `${d.slice(0,4)}-${d[4]}/${d.slice(5,7)}`
    dispatch({ type:'SET_FIELD', field:'cnaePrincipal', value: masked })
  }
  const normaInfo = getNormaInfo(state.uf || 'MA')

  // Mantem "Proprietario do imovel" espelhando "Responsavel pelo uso" enquanto marcado —
  // evita digitar os mesmos dados duas vezes quando e a mesma empresa/pessoa.
  useEffect(() => {
    if (!mesmoResponsavel) return
    dispatch({ type:'SET_FIELD', field:'propNome', value: state.respRazaoSocial })
    dispatch({ type:'SET_FIELD', field:'propDocumento', value: state.respCNPJ })
    dispatch({ type:'SET_FIELD', field:'propTelefone', value: state.respTelefone })
  }, [mesmoResponsavel, state.respRazaoSocial, state.respCNPJ, state.respTelefone])

  return (
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa 1 de 7</div>
        <h2 className={S.title}>Identificacao do projeto</h2>
        <p className={S.desc}>Comece pelo CNPJ da empresa para pre-preencher os dados — depois confirme o endereco da obra e os demais responsaveis.</p>
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Responsavel pelo uso</div>
        <div className="ibox blue"><Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/><span>Empresa ou pessoa que ocupa o imovel — pode ser diferente do proprietario. Buscar pelo CNPJ preenche os dados abaixo automaticamente.</span></div>

        <div className="fg mb-3">
          <label>CNPJ <span className="req">*</span></label>
          <div className="flex gap-2 items-start">
            <input value={state.respCNPJ} onChange={setCNPJ} placeholder="00.000.000/0000-00" className="flex-1"/>
            <button type="button" className="btn-ghost shrink-0" disabled={loading} onClick={() => buscar(state.respCNPJ)}>
              <Icon name="search" size={12}/> {loading ? 'Buscando...' : 'Preencher pelo CNPJ'}
            </button>
          </div>
          {error && <span className="text-[11px] text-red">{error}</span>}
          {warning && <span className="text-[11px] text-amber">{warning}</span>}
        </div>

        <div className="g2 mb-3">
          <div className="fg"><label>Razao social <span className="req">*</span></label><input value={state.respRazaoSocial} onChange={set('respRazaoSocial')}/></div>
          <div className="fg"><label>Nome fantasia</label><input value={state.respFantasia} onChange={set('respFantasia')}/></div>
        </div>
        <div className="g2 mb-3">
          <div className="fg"><label>Telefone</label><input type="tel" value={state.respTelefone} onChange={set('respTelefone')}/></div>
          <div className="fg"><label>E-mail</label><input type="email" value={state.respEmail} onChange={set('respEmail')}/></div>
        </div>
        <div className="g2 mb-3">
          <div className="fg"><label>CNAE principal</label><input value={state.cnaePrincipal} onChange={setCNAE} placeholder="0000-0/00"/></div>
          <div className="fg"><label>Descricao da atividade</label><input value={state.cnaePrincipalDesc} onChange={set('cnaePrincipalDesc')} placeholder="Preenchido automaticamente pela busca do CNPJ"/></div>
        </div>
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Identificacao</div>
        <div className="fg mb-3">
          <label>Nome do projeto <span className="req">*</span></label>
          <input value={state.nome} onChange={set('nome')} placeholder="Ex: Edificio Comercial Centro"/>
        </div>
        <div className="fg">
          <label>Data de inicio</label>
          <input type="date" value={state.dataInicio} onChange={set('dataInicio')} className="max-w-[220px]"/>
        </div>
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Localizacao da obra</div>

        {enderecoFiscal && (
          <div className="ibox blue">
            <Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/>
            <span>
              Endereco fiscal encontrado: {enderecoFiscal.logradouro}, {enderecoFiscal.numero} — {enderecoFiscal.bairro}, {enderecoFiscal.cidade} — {enderecoFiscal.uf}, CEP {enderecoFiscal.cep}.
              {' '}Pode ser diferente do endereco da obra — confirme antes de usar.{' '}
              <button type="button" className="btn-ghost" onClick={aplicarEndereco}>
                <Icon name="check" size={11}/> Usar como endereco da obra
              </button>
            </span>
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
              {ESTADOS_DISPONIVEIS.map(e => (
                <option key={e.uf} value={e.uf} disabled={!e.ativo}>
                  {e.nome}{!e.ativo ? ' — em breve' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Norma aplicavel</div>
        <div className="ibox amber">
          <Icon name="info" size={14} color="var(--color-amber)" className="shrink-0"/>
          <span>Norma vinculada ao estado selecionado. Verifique a versao vigente antes de iniciar o dimensionamento.</span>
        </div>
        {normaInfo && (
          <div className="norma-badge">
            <Icon name="file" size={13}/>
            <span>{normaInfo.nome} — {normaInfo.desc}</span>
          </div>
        )}
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Proprietario do imovel</div>
        <label className="flex items-center gap-2 mb-3 text-[12px] text-ink-muted cursor-pointer">
          <input type="checkbox" checked={mesmoResponsavel} onChange={e => setMesmoResponsavel(e.target.checked)} className="w-auto"/>
          Proprietario e o mesmo que o responsavel pelo uso
        </label>
        <div className="g2 mb-3">
          <div className="fg"><label>Nome / Razao social <span className="req">*</span></label><input value={state.propNome} onChange={set('propNome')} readOnly={mesmoResponsavel}/></div>
          <div className="fg"><label>CPF / CNPJ <span className="req">*</span></label><input value={state.propDocumento} onChange={set('propDocumento')} readOnly={mesmoResponsavel}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label>Telefone</label><input type="tel" value={state.propTelefone} onChange={set('propTelefone')} placeholder="(99) 99999-9999" readOnly={mesmoResponsavel}/></div>
          <div className="fg"><label>E-mail</label><input type="email" value={state.propEmail} onChange={set('propEmail')}/></div>
        </div>
      </div>
    </div>
  )
}
