import { useEffect, useRef, useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { usePerfil, temDadosRT } from '../../hooks/usePerfil'
import FormSection from '../ui/FormSection'
import Icon from '../ui/Icon'
import SwitchToggle from '../ui/SwitchToggle'
const S={section:'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',header:'mb-8',stepLbl:'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',title:'text-[22px] font-semibold text-ink mb-[5px]',desc:'text-[13px] text-ink-faint leading-[1.6]'}

export default function Step3({ step, totalSteps }) {
  const {state,dispatch}=useProjeto()
  const { perfil } = usePerfil()
  const set=f=>e=>dispatch({type:'SET_FIELD',field:f,value:e.target.value})

  const rtPerfil = perfil?.responsavelTecnico
  const perfilTemDados = temDadosRT(rtPerfil)
  const etapaVazia = !temDadosRT(state)

  const aplicarPerfil = () => dispatch({ type: 'SET_FIELDS', fields: { ...rtPerfil } })

  // Projeto novo com perfil preenchido: adianta o preenchimento em vez de
  // deixar o usuario redigitar o que ja esta na conta. So quando a etapa esta
  // em branco — reescrever o que alguem digitou seria perder trabalho — e uma
  // vez so por montagem, pra que apagar um campo de proposito nao traga o
  // valor do perfil de volta.
  const jaAplicou = useRef(false)
  const [preenchidoDoPerfil, setPreenchidoDoPerfil] = useState(false)
  useEffect(() => {
    if (jaAplicou.current || !perfilTemDados || !etapaVazia) return
    jaAplicou.current = true
    aplicarPerfil()
    setPreenchidoDoPerfil(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilTemDados, etapaVazia])

  const botaoPerfil = perfilTemDados && (
    <button
      className="btn-ghost"
      onClick={() => { aplicarPerfil(); setPreenchidoDoPerfil(true) }}
      title="Copia nome, CREA/CAU, CPF, especialidade, empresa e contatos do seu perfil"
    >
      <Icon name="user" size={13}/> Usar dados do perfil
    </button>
  )

  return (
    <div className={S.section}>
      <div className={S.header}><div className={S.stepLbl}>Etapa {step} de {totalSteps}</div><h2 className={S.title}>Responsavel tecnico</h2><p className={S.desc}>Dados do engenheiro ou arquiteto responsavel pelo PPCI e informacoes da ART.</p></div>

      {preenchidoDoPerfil && (
        <div className="ibox blue">
          <Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/>
          <span>Preenchido com o responsável técnico do seu perfil. Alterações feitas aqui valem só para este projeto.</span>
        </div>
      )}

      <FormSection title="Projetista" extra={botaoPerfil}>
        <div className="g2 mb-3">
          <div className="fg"><label>Nome completo <span className="req">*</span></label><input value={state.rtNome} onChange={set('rtNome')}/></div>
          <div className="fg"><label>CREA / CAU <span className="req">*</span></label><input value={state.rtConselho} onChange={set('rtConselho')} placeholder="CREA-MA MA00000000/D"/></div>
        </div>
        <div className="g2 mb-3">
          <div className="fg"><label>CPF</label><input value={state.rtCpf} onChange={set('rtCpf')} placeholder="000.000.000-00"/></div>
          <div className="fg"><label>Especialidade</label>
            <select value={state.rtEspecialidade} onChange={set('rtEspecialidade')}>
              <option>Engenharia Civil</option><option>Engenharia Eletrica</option><option>Arquitetura</option><option>Engenharia de Seguranca</option>
            </select>
          </div>
        </div>
        <div className="fg mb-3">
          <label>Empresa / Escritorio</label><input value={state.rtEmpresa} onChange={set('rtEmpresa')}/>
        </div>
        <div className="g2">
          <div className="fg"><label>E-mail</label><input type="email" value={state.rtEmail} onChange={set('rtEmail')}/></div>
          <div className="fg"><label>Telefone</label><input type="tel" value={state.rtTelefone} onChange={set('rtTelefone')}/></div>
        </div>
      </FormSection>
      <FormSection
        title="ART"
        description={state.usaArt ? 'Dados desta obra — não vêm do perfil, mudam de projeto para projeto.' : 'Desativada — não entra no memorial descritivo.'}
        extra={
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[11px] text-ink-faint">Utiliza ART</span>
            <SwitchToggle checked={state.usaArt} onChange={v => dispatch({ type:'SET_FIELD', field:'usaArt', value:v })}/>
          </label>
        }
      >
        {state.usaArt && (
          <>
            <div className="g2 mb-3">
              <div className="fg"><label>Numero da ART <span className="req">*</span></label><input value={state.artNumero} onChange={set('artNumero')}/></div>
              <div className="fg"><label>Data de emissao</label><input type="date" value={state.artData} onChange={set('artData')}/></div>
            </div>
            <div className="g2">
              <div className="fg"><label>Tipo de servico</label>
                <select value={state.artTipoServico} onChange={set('artTipoServico')}>
                  <option>Projeto</option><option>Execucao</option><option>Projeto e execucao</option><option>Consultoria / Laudo</option>
                </select>
              </div>
              <div className="fg"><label>Valor da obra (R$)</label><input value={state.artValorObra} onChange={set('artValorObra')} placeholder="R$ 0,00"/></div>
            </div>
          </>
        )}
      </FormSection>
    </div>
  )
}
