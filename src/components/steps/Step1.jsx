import { useProjeto } from '../../context/ProjetoContext'
import { ESTADOS_DISPONIVEIS, getNormaInfo } from '../../data/normas/index'
import Icon from '../ui/Icon'

const S = {
  section:{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'},
  header:{marginBottom:26},
  stepLbl:{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5},
  title:{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5},
  desc:{fontSize:13,color:'var(--text-faint)',lineHeight:1.6},
  block:{marginBottom:26},
  blockTitle:{fontSize:11,fontWeight:500,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,paddingBottom:8,borderBottom:'.5px solid var(--border)'},
}

export default function Step1() {
  const { state, dispatch } = useProjeto()
  const set = f => e => dispatch({ type:'SET_FIELD', field:f, value:e.target.value })
  const normaInfo = getNormaInfo(state.uf || 'MA')

  return (
    <div style={S.section}>
      <div style={S.header}>
        <div style={S.stepLbl}>Etapa 1 de 8</div>
        <h2 style={S.title}>Identificacao do projeto</h2>
        <p style={S.desc}>Dados gerais de identificacao e localizacao. A norma e vinculada ao estado selecionado.</p>
      </div>

      <div style={S.block}>
        <div style={S.blockTitle}>Identificacao</div>
        <div className="fg" style={{marginBottom:12}}>
          <label>Nome do projeto <span className="req">*</span></label>
          <input value={state.nome} onChange={set('nome')} placeholder="Ex: Edificio Comercial Centro"/>
        </div>
        <div className="fg">
          <label>Data de inicio</label>
          <input type="date" value={state.dataInicio} onChange={set('dataInicio')} style={{maxWidth:220}}/>
        </div>
      </div>

      <div style={S.block}>
        <div style={S.blockTitle}>Localizacao</div>
        <div className="fg" style={{marginBottom:12}}>
          <label>Endereco completo <span className="req">*</span></label>
          <input value={state.endereco} onChange={set('endereco')} placeholder="Rua, numero, complemento, bairro"/>
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
          <div className="fg"><label>CEP</label><input value={state.cep} onChange={set('cep')} placeholder="65000-000"/></div>
        </div>
      </div>

      <div style={S.block}>
        <div style={S.blockTitle}>Norma aplicavel</div>
        <div className="ibox amber">
          <Icon name="info" size={14} color="var(--amber)" style={{flexShrink:0}}/>
          <span>Norma vinculada ao estado selecionado. Verifique a versao vigente antes de iniciar o dimensionamento.</span>
        </div>
        {normaInfo && (
          <div className="norma-badge">
            <Icon name="file" size={13}/>
            <span>{normaInfo.nome} — {normaInfo.desc}</span>
          </div>
        )}
      </div>
    </div>
  )
}