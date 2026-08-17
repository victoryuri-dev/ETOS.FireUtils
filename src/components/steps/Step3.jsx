import { useProjeto } from '../../context/ProjetoContext'
import FormSection from '../ui/FormSection'
const S={section:'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',header:'mb-8',stepLbl:'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',title:'text-[22px] font-semibold text-ink mb-[5px]',desc:'text-[13px] text-ink-faint leading-[1.6]'}
export default function Step3() {
  const {state,dispatch}=useProjeto()
  const set=f=>e=>dispatch({type:'SET_FIELD',field:f,value:e.target.value})
  return (
    <div className={S.section}>
      <div className={S.header}><div className={S.stepLbl}>Etapa 3 de 7</div><h2 className={S.title}>Responsavel tecnico</h2><p className={S.desc}>Dados do engenheiro ou arquiteto responsavel pelo PPCI e informacoes da ART.</p></div>
      <FormSection title="Projetista">
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
      <FormSection title="ART">
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
      </FormSection>
    </div>
  )
}
