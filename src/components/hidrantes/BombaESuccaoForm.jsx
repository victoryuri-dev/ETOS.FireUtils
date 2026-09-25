// BombaESuccaoForm.jsx — Bomba de Incêndio e Sucção da Bomba (NPSH),
// renderizado na Etapa 3 (Dimensionamento da Bomba de Incêndio, ver
// HidrantesPage.jsx). Migrado de FormularioSistema.jsx (Etapa 1) pra ficar
// junto de onde o RT de fato decide a bomba — eficiência e potência, logo
// abaixo (EficienciaPotenciaAdotada). A classificação compartilhada
// (temSprinklers, risco) vem de hooks/useClassificacaoHidrantes.js, a
// mesma usada pela Etapa 1, nunca duplicada.
import { useClassificacaoHidrantes } from '../../hooks/useClassificacaoHidrantes'
import FormSection from '../ui/FormSection'
import { inputClass, Field, Pill, Nota, ToggleRow } from './formUi'

export default function BombaESuccaoForm() {
  const { h, set, norma, risco, reservaSugerida, temSprinklers } = useClassificacaoHidrantes()
  // dimensionamento já existe sempre que este formulário é renderizado —
  // Etapa 3 só libera depois da Etapa 2 (ver HidrantesPage.jsx) — então
  // h.dimensionamento.succao é sempre 'positiva' ou 'negativa' aqui, nunca
  // indefinido. Só a sucção NEGATIVA precisa do NPSH disponível (Anexo C);
  // a condição em si (positiva/negativa) vem só da geometria (cotas), não
  // da altitude/temperatura perguntadas nesta seção — então elas ficam
  // sem sentido pra mostrar quando a sucção já deu positiva.
  const succaoPositiva = h.dimensionamento?.succao === 'positiva'

  return (
    <div className="mb-8">
      {/* Bomba de incêndio */}
      <FormSection title="Bomba de Incêndio" description="Vazão e pressão vêm do plugin. Eficiência e potência são definidas logo abaixo.">
        <ToggleRow label="Bomba principal" checked={h.bombaExiste} onChange={v => set({ bombaExiste: v })}/>
        {h.bombaExiste && (
          <>
            <div className="mt-3 mb-1">
              <Field label="Tipo de acionamento da bomba principal"/>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {norma.ACIONAMENTOS_BOMBA.map(op => (
                  <Pill key={op.key} active={h.bombaAcionamento === op.key} onClick={() => set({ bombaAcionamento: op.key })}>
                    {op.label}
                  </Pill>
                ))}
              </div>
            </div>
            <ToggleRow label="Bomba reserva" checked={h.bombaReserva} onChange={v => set({ bombaReserva: v })}/>
            {h.bombaReserva && (
              <div className="grid grid-cols-2 gap-2 my-3 pl-4">
                {norma.ACIONAMENTOS_BOMBA.map(op => (
                  <Pill key={op.key} active={h.bombaReservaAcionamento === op.key} onClick={() => set({ bombaReservaAcionamento: op.key })}>
                    {op.label}
                  </Pill>
                ))}
              </div>
            )}
            <ToggleRow label="Bomba jockey (pressurização)" checked={h.bombaJockey} onChange={v => set({ bombaJockey: v })}/>
            {h.bombaJockey && (
              <div className="grid grid-cols-2 gap-4 my-3 pl-4">
                <Field label="Potência da bomba jockey">
                  <div className="relative">
                    <input type="number" step="0.1" min={0} className={inputClass + ' pr-10'}
                      value={h.bombaJockeyPotencia} onChange={e => set({ bombaJockeyPotencia: e.target.value })}/>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">cv</span>
                  </div>
                </Field>
                <Field label="Vazão da bomba jockey">
                  <div className="relative">
                    <input type="number" step="1" min={0} className={inputClass + ' pr-14'}
                      value={h.bombaJockeyVazao} onChange={e => set({ bombaJockeyVazao: e.target.value })}/>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">L/min</span>
                  </div>
                </Field>
              </div>
            )}
            {temSprinklers && (
              <ToggleRow label="O sistema de bombeamento também alimenta os chuveiros automáticos (sprinklers)?" checked={h.bombaAlimentaSprinklers} onChange={v => set({ bombaAlimentaSprinklers: v })}/>
            )}
            {reservaSugerida && !h.bombaReserva && (
              <Nota>
                Risco {risco} classificado — a NT 22 (Anexo C, C.3.12) exige bomba reserva: {reservaSugerida.tipo}.
              </Nota>
            )}
          </>
        )}
      </FormSection>

      {/* Sucção da bomba (NPSH disponível) — omitida quando a sucção já
          deu positiva: altitude/temperatura só importam pro NPSHd (Anexo
          C), calculado só quando a sucção é negativa (ver succaoPositiva,
          acima). */}
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
    </div>
  )
}
