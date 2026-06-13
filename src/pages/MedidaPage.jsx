import Icon from '../components/ui/Icon'

const SIST_LABELS = {
  acesso_viatura:      'Acesso de Viatura em Edificações',
  seg_estrutural:      'Segurança Estrutural Contra Incêndio',
  compart_vertical:    'Compartimentação Vertical',
  controle_acabamento: 'Controle de Materiais de Acabamento',
  saida_emergencia:    'Saída de Emergência',
  gerenciamento_risco: 'Gerenciamento de Risco de Incêndio',
  brigada:             'Brigada de Incêndio',
  iluminacao:          'Iluminação de Emergência',
  sinalizacao:         'Sinalização de Emergência',
  extintores:          'Proteção por Extintores',
  hidrantes:           'Hidrantes / Mangotinho',
  alarme:              'Alarme de Incêndio',
  deteccao:            'Detecção de Incêndio',
  sprinklers:          'Chuveiros Automáticos',
  controle_fumaca:     'Controle de Fumaça',
  central_gas:         'Central de Gás',
  spda:                'SPDA',
}

export default function MedidaPage({ sistKey }) {
  const label = SIST_LABELS[sistKey] || sistKey

  return (
    <div style={{ flex:1, overflowY:'auto' }}><div style={{ maxWidth:720, margin:'0 auto', padding:'34px 48px 96px' }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:11, color:'var(--red)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:5 }}>
          Medidas de segurança
        </div>
        <h2 style={{ fontSize:22, fontWeight:600, color:'var(--text)', marginBottom:5 }}>{label}</h2>
        <p style={{ fontSize:13, color:'var(--text-faint)', lineHeight:1.6 }}>
          Dimensionamento e especificações técnicas do sistema conforme NT 42/2019 CBMMA.
        </p>
      </div>

      <div className="ibox amber">
        <Icon name="warn" size={14} color="var(--amber)" style={{ flexShrink:0 }}/>
        <span>
          Esta página está em construção. O módulo de dimensionamento para{' '}
          <strong style={{ color:'var(--text-muted)' }}>{label}</strong> estará disponível em breve.
        </span>
      </div>

      <div style={{
        background:'var(--surface-2)', border:'.5px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'64px 20px',
        textAlign:'center',
      }}>
        {/* Clock icon */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
          style={{ margin:'0 auto 18px', display:'block', color:'var(--text-faint)', opacity:.3 }}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>

        <div style={{ fontSize:15, fontWeight:500, color:'var(--text-muted)', marginBottom:6 }}>
          Página em construção
        </div>
        <div style={{ fontSize:13, color:'var(--text-faint)', lineHeight:1.7, maxWidth:400, margin:'0 auto' }}>
          O dimensionamento será realizado pelo plugin Revit.<br/>
          Após executar o plugin, os resultados e o memorial<br/>
          descritivo aparecerão aqui automaticamente.
        </div>
      </div>
    </div></div>
  )
}
