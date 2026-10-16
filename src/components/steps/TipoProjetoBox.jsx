import { useProjeto } from '../../context/ProjetoContext'
import { enquadrarTipoProjeto, getTiposProjeto } from '../../data/tipoProjeto'
import { fmtNum } from '../../utils/numero'
import FormSection from '../ui/FormSection'
import Icon from '../ui/Icon'

// Tipo de projeto (técnico ou simplificado) — só informa o enquadramento,
// que é automático (data/tipoProjeto.js): área e altura de cada estrutura
// contra os limiares da tabela de medidas do estado. Não é um campo editável:
// o mesmo critério já decide quais medidas são exigidas (Tabela 5 x Tabela 6).
function Opcao({ k, icon, tipo, tipos, limiares, op }) {
  const sel = tipo === k
  return (
    <div className={`border border-solid rounded-md py-3.5 px-4 flex items-center gap-3 ${sel ? 'border-red-border bg-red-dim' : 'border-border bg-transparent opacity-60'}`}
      aria-current={sel ? 'true' : undefined}>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${sel ? 'bg-red-dim text-red' : 'bg-surface-2 text-ink-faint'}`}>
        <Icon name={icon} size={17}/>
      </div>
      <div className="min-w-0">
        <div className={`text-[13px] font-medium ${sel ? 'text-red' : 'text-ink-muted'}`}>{tipos[k].nome} ({tipos[k].sigla})</div>
        <div className="text-[11px] text-ink-faint mt-0.5">
          {k === 'simplificado'
            ? limiares ? `Área ${op} ${fmtNum(limiares.areaMin, 0)} m² e altura ${op} ${fmtNum(limiares.alturaMin, 0)} m` : 'Edificações de pequeno porte'
            : limiares ? `${limiares.inclusivo ? 'Acima de' : 'A partir de'} ${fmtNum(limiares.areaMin, 0)} m² ou de ${fmtNum(limiares.alturaMin, 0)} m de altura` : 'Demais edificações'}
        </div>
      </div>
      {sel && <Icon name="check" size={15} color="var(--color-red)" className="ml-auto shrink-0"/>}
    </div>
  )
}

export default function TipoProjetoBox() {
  const { state } = useProjeto()
  const tipos = getTiposProjeto(state.uf)
  const { tipo, limiares, porEstrutura } = enquadrarTipoProjeto(state.uf, state.estruturas)
  const op = limiares?.inclusivo ? '≤' : '<'
  const multiplas = porEstrutura.length > 1
  const props = { tipo, tipos, limiares, op }

  return (
    <FormSection title="Tipo de projeto" description="Enquadramento automático pela área construída e pela altura de cada estrutura — o mesmo critério que define as medidas de segurança exigidas.">
      <div className="g2 mb-3">
        <Opcao k="tecnico" icon="file" {...props}/>
        <Opcao k="simplificado" icon="file" {...props}/>
      </div>

      {!limiares ? (
        <div className="ibox amber mb-0">
          <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
          <span>A tabela de medidas de segurança deste estado ainda não carregou — o enquadramento aparece assim que ela estiver disponível.</span>
        </div>
      ) : tipo == null ? (
        <div className="ibox amber mb-0">
          <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
          <span>Informe a área e a altura de {multiplas ? 'todas as estruturas' : 'a estrutura'} (abaixo) para enquadrar o projeto.</span>
        </div>
      ) : multiplas && (
        <div className="text-[12px] text-ink-faint leading-[1.6]">
          {porEstrutura.map(({ estrutura, area, altura, tipo: t }) => (
            <div key={estrutura.id}>
              <strong className="font-medium text-ink-muted">{estrutura.nome}:</strong>{' '}
              {t ? `${tipos[t].sigla} — ${fmtNum(area, 2)} m², ${altura === 0 ? 'térrea' : `${fmtNum(altura, 2)} m`}` : 'área ou altura não informada'}
            </div>
          ))}
          {tipo === 'tecnico' && <div className="mt-1">Basta uma estrutura acima do limite para o projeto ser técnico.</div>}
        </div>
      )}
    </FormSection>
  )
}
