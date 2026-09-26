// BombaESuccaoForm.jsx — Etapa 3 (Dimensionamento da Bomba de Incêndio, ver
// HidrantesPage.jsx). Duas partes:
//   - SelecaoBombas: um botão por bomba (principal / reserva / jockey); ao
//     ativar, o cartão de especificação dela (vazão, pressão, eficiência e
//     potência) aparece logo abaixo do botão;
//   - SucaoBomba: altitude e temperatura da água (NPSH).
// A classificação compartilhada (temSprinklers, risco) vem de
// hooks/useClassificacaoHidrantes.js, a mesma usada pela Etapa 1.
import { useState } from 'react'
import { useClassificacaoHidrantes } from '../../hooks/useClassificacaoHidrantes'
import FormSection from '../ui/FormSection'
import Icon from '../ui/Icon'
import { inputClass, Field, Pill, Nota } from './formUi'

// Cartão de escolha de uma bomba — mesmo padrão dos cartões de medidas de
// segurança (Etapa 6): clicar no cartão liga/desliga. `bloqueado` (bomba
// principal desligada) apaga o cartão e impede o clique.
function CartaoBomba({ titulo, descricao, checked, onChange, bloqueado }) {
  const alternar = () => onChange(!checked)
  return (
    <div
      role="switch" aria-checked={checked} aria-disabled={bloqueado || undefined} tabIndex={bloqueado ? -1 : 0}
      onClick={alternar}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar() } }}
      className={`flex items-start justify-between gap-3 p-4 rounded-lg border border-solid cursor-pointer select-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red/60 ${checked ? 'border-red bg-red-dim' : 'border-border bg-bg hover:border-ink-faint'} ${bloqueado ? 'opacity-40 pointer-events-none' : ''}`}
    >
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-ink">{titulo}</div>
        {descricao && <div className="text-[11px] text-ink-faint leading-[1.5] mt-0.5">{descricao}</div>}
      </div>
      <span aria-hidden="true" className={`shrink-0 w-[18px] h-[18px] rounded-full border border-solid flex items-center justify-center ${checked ? 'border-red bg-red text-white' : 'border-ink-faint text-transparent'}`}>
        <Icon name="check" size={11} strokeWidth={3}/>
      </span>
    </div>
  )
}

// Escolha do acionamento (motor elétrico / combustão) — botões empilhados.
function Acionamento({ opcoes, valor, onChange }) {
  return (
    <div>
      <Field label="Tipo de acionamento"/>
      <div className="flex flex-col gap-2 mt-1">
        {opcoes.map(op => (
          <Pill key={op.key} active={valor === op.key} onClick={() => onChange(op.key)}>{op.label}</Pill>
        ))}
      </div>
    </div>
  )
}

// Cartão de especificação de uma bomba já escolhida.
function EspecBomba({ children }) {
  return (
    <div className="p-4 rounded-lg border border-solid border-border bg-surface-2">
      <div className="text-[10px] text-ink-faint uppercase tracking-[.08em] mb-3.5">Especificações</div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

// Dado que vem do dimensionamento (não editável): rótulo em cima, valor embaixo.
function Dado({ rotulo, valor, unidade, conversao, tom = 'text-ink' }) {
  return (
    <div>
      <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">{rotulo}</div>
      <div className="h-[30px] flex items-baseline gap-1.5 pt-1">
        <span className={`font-mono text-base font-bold ${tom}`}>{valor}</span>
        {unidade && <span className="text-[11px] text-ink-faint">{unidade}</span>}
        {conversao && <span className="text-[11px] text-ink-faint">· {conversao}</span>}
      </div>
    </div>
  )
}

// Campo numérico com unidade à direita.
function CampoNumero({ rotulo, valor, onChange, onBlur, unidade, step = '0.1', min = 0, max }) {
  return (
    <Field label={rotulo}>
      <div className="relative">
        <input type="number" step={step} min={min} max={max} className={inputClass + ' pr-12'}
          value={valor} onChange={e => onChange(e.target.value)} onBlur={onBlur}/>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">{unidade}</span>
      </div>
    </Field>
  )
}

const f2 = n => Number(n).toFixed(2)
// Conversões exibidas ao lado dos valores principais: m³/h -> L/min e mca -> kPa.
const lpm = m3h => `${(Number(m3h) * 1000 / 60).toFixed(1)} L/min`
const kpa = mca => `${(Number(mca) * 9.80665).toFixed(1)} kPa`

export function SelecaoBombas({ vazaoM3h, pressaoMca, eta, onChangeEta, potenciaAdotada, onChangePotenciaAdotada, potCv }) {
  const { h, set, norma, risco, reservaSugerida, temSprinklers } = useClassificacaoHidrantes()
  // A potência adotada nunca pode ficar abaixo da calculada: ao sair do campo,
  // se estiver abaixo, é substituída pela calculada e o aviso continua até a
  // próxima edição.
  const [corrigida, setCorrigida] = useState(false)
  const calculada = potCv != null ? Math.ceil(potCv * 100) / 100 : null
  const abaixo = potenciaAdotada !== '' && calculada != null && Number(potenciaAdotada) < calculada
  const editarPotencia = v => { setCorrigida(false); onChangePotenciaAdotada(v) }
  const validarPotencia = () => {
    if (abaixo) { onChangePotenciaAdotada(String(calculada)); setCorrigida(true) }
  }
  const reservaAtiva = h.bombaExiste && h.bombaReserva
  const jockeyAtiva = h.bombaExiste && h.bombaJockey

  return (
    <FormSection title="Bombas do Sistema" description="Ative as bombas que a casa de bombas terá; a especificação de cada uma aparece logo abaixo.">
      <div className="grid grid-cols-3 gap-3 items-start">
        <div className="flex flex-col gap-3">
          <CartaoBomba titulo="Bomba principal" descricao="Bomba de recalque do sistema"
            checked={h.bombaExiste} onChange={v => set({ bombaExiste: v })}/>
          {h.bombaExiste && (
            <EspecBomba>
              <Acionamento opcoes={norma.ACIONAMENTOS_BOMBA} valor={h.bombaAcionamento} onChange={v => set({ bombaAcionamento: v })}/>
              <Dado rotulo="Vazão" valor={f2(vazaoM3h)} unidade="m³/h" conversao={lpm(vazaoM3h)}/>
              <Dado rotulo="Pressão" valor={f2(pressaoMca)} unidade="mca" conversao={kpa(pressaoMca)}/>
              <CampoNumero rotulo="Eficiência global (η)" valor={eta} onChange={onChangeEta} unidade="%" step="1" min={1} max={100}/>
              <Dado rotulo="Potência calculada" valor={potCv != null ? f2(potCv) : '—'} unidade={potCv != null ? 'cv' : 'informe a eficiência'} tom="text-amber"/>
              <CampoNumero rotulo="Potência adotada" valor={potenciaAdotada} onChange={editarPotencia} onBlur={validarPotencia} unidade="cv" step="0.5"/>
              {(abaixo || corrigida) && (
                <div className="text-[11px] leading-[1.5] text-red">
                  A potência adotada não pode ser inferior à potência calculada ({f2(potCv)} cv).{corrigida ? ' O valor foi ajustado automaticamente.' : ''}
                </div>
              )}
            </EspecBomba>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <CartaoBomba titulo="Bomba reserva" descricao="Mesmas características da principal" bloqueado={!h.bombaExiste}
            checked={reservaAtiva} onChange={v => set({ bombaReserva: v })}/>
          {reservaAtiva && (
            <EspecBomba>
              <Acionamento opcoes={norma.ACIONAMENTOS_BOMBA} valor={h.bombaReservaAcionamento} onChange={v => set({ bombaReservaAcionamento: v })}/>
              <Dado rotulo="Vazão" valor={f2(vazaoM3h)} unidade="m³/h" conversao={lpm(vazaoM3h)}/>
              <Dado rotulo="Pressão" valor={f2(pressaoMca)} unidade="mca" conversao={kpa(pressaoMca)}/>
              <Dado rotulo="Eficiência global (η)" valor={eta !== '' ? eta : '—'} unidade={eta !== '' ? '%' : ''}/>
              <Dado rotulo="Potência" valor={potenciaAdotada !== '' ? potenciaAdotada : '—'} unidade={potenciaAdotada !== '' ? 'cv' : ''}/>
            </EspecBomba>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <CartaoBomba titulo="Bomba jockey" descricao="Pressurização da rede" bloqueado={!h.bombaExiste}
            checked={jockeyAtiva} onChange={v => set({ bombaJockey: v })}/>
          {jockeyAtiva && (
            <EspecBomba>
              <CampoNumero rotulo="Vazão" valor={h.bombaJockeyVazao} onChange={v => set({ bombaJockeyVazao: v })} unidade="L/min" step="1"/>
              <CampoNumero rotulo="Pressão" valor={h.bombaJockeyPressao ?? ''} onChange={v => set({ bombaJockeyPressao: v })} unidade="mca" step="0.1"/>
              <CampoNumero rotulo="Potência" valor={h.bombaJockeyPotencia} onChange={v => set({ bombaJockeyPotencia: v })} unidade="cv"/>
            </EspecBomba>
          )}
        </div>
      </div>

      {h.bombaExiste && temSprinklers && (
        <div className="mt-3">
          <CartaoBomba titulo="Alimenta os chuveiros automáticos" descricao="O sistema de bombeamento também alimenta os sprinklers?"
            checked={h.bombaAlimentaSprinklers} onChange={v => set({ bombaAlimentaSprinklers: v })}/>
        </div>
      )}

      {h.bombaExiste && reservaSugerida && !h.bombaReserva && (
        <Nota>
          Risco {risco} classificado — a NT 22 (Anexo C, C.3.12) exige bomba reserva: {reservaSugerida.tipo}.
        </Nota>
      )}
    </FormSection>
  )
}

export function SucaoBomba() {
  const { h, set, norma } = useClassificacaoHidrantes()
  // dimensionamento já existe sempre que este formulário é renderizado —
  // Etapa 3 só libera depois da Etapa 2 (ver HidrantesPage.jsx) — então
  // h.dimensionamento.succao é sempre 'positiva' ou 'negativa' aqui. Só a
  // sucção NEGATIVA precisa do NPSH disponível (Anexo C); altitude e
  // temperatura ficam sem sentido quando a sucção já deu positiva.
  const succaoPositiva = h.dimensionamento?.succao === 'positiva'

  return (
    <>
      {/* Sucção da bomba (NPSH disponível) — omitida quando a sucção já deu positiva. */}
      {h.bombaExiste && !succaoPositiva && (
        <FormSection title="Sucção da Bomba (NPSH)" description="Usadas pelo plugin para verificar a condição de sucção e, se negativa, calcular o NPSH disponível (Anexo C).">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Altitude do local">
              <select className={inputClass} value={h.succaoAltitude} onChange={e => set({ succaoAltitude: Number(e.target.value) })}>
                {norma.ALTITUDES_SUCCAO.map(a => (
                  <option key={a.altitude} value={a.altitude}>{a.altitude.toLocaleString('pt-BR')} m — Ha = {a.ha} mca</option>
                ))}
              </select>
            </Field>
            <Field label="Temperatura da água">
              <select className={inputClass} value={h.succaoTemperatura} onChange={e => set({ succaoTemperatura: Number(e.target.value) })}>
                {norma.TEMPERATURAS_SUCCAO.map(t => (
                  <option key={t.temperatura} value={t.temperatura}>{t.temperatura} °C — Hvp = {t.hvp} mca</option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>
      )}
    </>
  )
}
