import Obrigatorio from '../ui/Obrigatorio'
// FormularioSistema.jsx — classificação do Sistema de Hidrantes/Mangotinhos
// (NT 22 CBMMA) pro memorial descritivo. Registro único por projeto (ver
// comentário de state.hidrantes em ProjetoContext.jsx) — o dimensionamento
// hidráulico continua vindo do plugin Revit; aqui só a classificação que o
// site decide e envia pra ele (ver hidrantes_calc.js e site-sync).
//
// Bomba de Incêndio e Sucção da Bomba (NPSH) saíram daqui pra
// BombaESuccaoForm.jsx, renderizado na Etapa 3 (Dimensionamento da Bomba de
// Incêndio, ver HidrantesPage.jsx) — mais perto de onde o RT de fato decide
// a bomba, junto de eficiência/potência. A lógica de classificação
// compartilhada pelas duas etapas (temSprinklers, risco, recalqueDuplo etc.)
// mora em hooks/useClassificacaoHidrantes.js, não duplicada nos dois lugares.
import { useClassificacaoHidrantes } from '../../hooks/useClassificacaoHidrantes'
import FormSection from '../ui/FormSection'
import InfoTip from '../ui/InfoTip'
import CaixaInfo from '../ui/CaixaInfo'
import { inputClass, Field, Resultado, Pill, Nota, ToggleRow } from './formUi'
import { posicoesReservatorio } from '../../data/hidrantes_calc'
import { useProjeto } from '../../context/ProjetoContext'
import { fmtNum } from '../../utils/numero'
import { LANCES_INTERNOS, LANCES_EXTERNOS, NAO_SE_APLICA, tiposMangueiraPermitidos } from '../../data/hidrantesMangueiras'

const RISCO_LABEL = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' }
const RISCO_COLOR = { baixo: 'text-ink-faint', medio: 'text-amber', alto: 'text-red' }

// Mesma lógica de cores da Etapa 6 (medidas de segurança): estrutura em que a
// norma EXIGE hidrantes é vermelha — cheia quando selecionada e só com a
// borda vermelha se o RT a desmarcou (sinaliza que a norma exige mesmo assim);
// as não exigidas ficam verdes quando selecionadas (opcional) e neutras quando não.
function EstruturaPill({ active, obrigatorio, onClick, nome, area, divisao, carga, risco }) {
  const tom = obrigatorio
    ? (active ? 'border-red bg-red-dim' : 'border-red bg-bg hover:bg-red-dim')
    : (active ? 'border-green bg-green-dim' : 'border-border bg-bg hover:border-ink-faint')
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`text-left p-3 rounded-md border border-solid transition-colors ${tom}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="text-xs font-semibold text-ink">{nome}</div>
        {obrigatorio && <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[.06em] text-red">Obrigatório</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-ink-faint">
        <span>Área</span><span className="text-ink font-medium text-right">{area ? `${fmtNum(area)} m²` : '—'}</span>
        <span>Ocupação</span><span className="text-ink font-medium text-right">{divisao || '—'}</span>
        <span>Carga de incêndio</span><span className="text-ink font-medium text-right">{carga != null ? `${carga} MJ/m²` : '—'}</span>
        <span>Risco</span><span className={`font-medium text-right ${risco ? RISCO_COLOR[risco] : ''}`}>{risco ? RISCO_LABEL[risco] : '—'}</span>
      </div>
    </button>
  )
}

/** Tomadas d'água do recalque — item 5.3.3: vazão do sistema acima de
 *  1.000 L/min exige recalque duplo. Não é escolha do RT (auto-sincronizada
 *  em h.recalqueEntradas, ver useClassificacaoHidrantes) — card de resultado
 *  da etapa de Dimensionamento do Sistema, com a conta no tooltip. */
export function TomadasRecalque() {
  const { norma, dadosTipo, recalqueDuplo, vazaoSistema } = useClassificacaoHidrantes()
  return (
    <div className="bg-surface border border-solid border-border rounded-lg py-4 px-5">
      <div className="flex items-center gap-1 text-[11px] text-ink-faint uppercase tracking-[.06em] mb-1">
        Tomadas d'água do recalque
        {dadosTipo && <InfoTip text={`Vazão do sistema: ${fmtNum(dadosTipo.vazaoMin)} L/min × ${norma.HIDRANTES_SIMULTANEOS} hidrantes simultâneos = ${fmtNum(vazaoSistema)} L/min, ${recalqueDuplo ? 'acima' : 'dentro'} do limite de 1.000 L/min (${norma.HIDRANTES_SIMULTANEOS_REF}).`}/>}
      </div>
      <div className={`text-base font-semibold ${recalqueDuplo ? 'text-amber' : 'text-ink'}`}>
        {!dadosTipo ? '—' : recalqueDuplo ? 'Duplo — 2 entradas' : 'Simples — 1 entrada'}
      </div>
    </div>
  )
}

export default function FormularioSistema() {
  const {
    h, set, norma,
    infoPorEstrutura, estruturasSelecionadas, toggleEstrutura,
    areaTotal, sugestao, escolherOpcao,
    tipoAtual, dadosTipo,
  } = useClassificacaoHidrantes()
  // Opções de posição do reservatório do estado (PB inclui o manancial).
  const posicoes = posicoesReservatorio(useProjeto().state.uf)

  return (
    <div className="mb-8">

      {/* Áreas para classificação — nem toda estrutura do projeto exige
          hidrantes; o RT confirma/ajusta quais entram na conta. */}
      <FormSection title="Áreas para Classificação do Sistema" description="Selecione as estruturas que exigem sistema de hidrantes — só elas entram na área total e na ocupação usadas na Tabela 3.">
        <div className="grid grid-cols-2 gap-3">
          {infoPorEstrutura.map(e => (
            <EstruturaPill key={e.id} active={estruturasSelecionadas.includes(e.id)} obrigatorio={e.hidrantesObrigatorio} onClick={() => toggleEstrutura(e.id)}
              nome={e.nome} area={e.area} divisao={e.divisaoLabel} carga={e.carga} risco={e.risco}/>
          ))}
        </div>
      </FormSection>

      {/* A — Classificação do sistema */}
      <FormSection title="Classificação do Sistema">
        <div className="grid grid-cols-2 gap-4 bg-surface-2 border border-solid border-border rounded-lg p-4 mb-4">
          <Resultado label="Área total construída (estruturas selecionadas acima)"
            value={areaTotal ? `${fmtNum(areaTotal)} m²` : '—'}/>
          <Resultado label="Ocupação usada na classificação" hint={sugestao.divisao ? `coluna ${sugestao.coluna} da Tabela 3` : undefined}
            value={sugestao.divisao || 'Nenhuma divisão classificada ainda (Etapa 4/5)'}/>
        </div>

        {sugestao.opcoes.length > 1 && (
          <div className="mb-4">
            <Field label="A norma permite dois sistemas para esta ocupação — escolha qual adotar" />
            <div className="grid grid-cols-2 gap-2 mt-1">
              {sugestao.opcoes.map(op => (
                <Pill key={op.tipo} active={h.tipo === op.tipo} onClick={() => escolherOpcao(op)}>
                  Tipo {op.tipo} — RTI {fmtNum(op.rti)} m³
                </Pill>
              ))}
            </div>
          </div>
        )}

        {/* Nota de rebaixamento (Tabela 3, Nota 1 ou 2) — sempre ao lado das
            pills acima: o rebaixamento nunca é aplicado sozinho, é sempre
            uma escolha do RT entre o Tipo da tabela e o Tipo rebaixado. */}
        {sugestao.opcoes.some(op => op.nota) && (
          <Nota>{sugestao.opcoes.find(op => op.nota).nota}</Nota>
        )}

        {dadosTipo && norma.TIPOS_SISTEMA[tipoAtual]?.variantes.length > 1 && (
          <div className="mb-4">
            <Field label="Mangueira do Tipo 4"/>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {norma.TIPOS_SISTEMA[tipoAtual].variantes.map((v, i) => (
                <Pill key={i} active={(h.tipoVariante || 0) === i} onClick={() => set({ tipoVariante: i })}>
                  Esguicho DN{v.esguicho} — mangueira DN{v.mangueiraDn} — {v.pressaoMin} mca
                </Pill>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-6 gap-3 bg-surface-2 border border-solid border-border rounded-lg p-4 mt-4">
          <Resultado label="Tipo" value={tipoAtual ? `Tipo ${tipoAtual}` : '—'}/>
          {dadosTipo && (
            <>
              <Resultado label="Esguicho" value={`DN${dadosTipo.esguicho}`}/>
              <Resultado label="Mangueira" value={`DN${dadosTipo.mangueiraDn} — ${dadosTipo.mangueiraComprimento} m`}/>
              <Resultado label="Expedições" value={dadosTipo.expedicoes} className="capitalize"/>
              <Resultado label="Vazão mín." value={`${dadosTipo.vazaoMin} L/min`}/>
              <Resultado label="Pressão mín." value={`${dadosTipo.pressaoMin} mca`}/>
            </>
          )}
        </div>
      </FormSection>

      {/* B — Reservatório e RTI */}
      <FormSection title="Reservatório">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <Field label={<>Material do reservatório <Obrigatorio id="hidrantes.reservatorioMaterial"/></>}>
            <select className={inputClass} value={h.reservatorioMaterial} onChange={e => set({ reservatorioMaterial: e.target.value })}>
              <option value="">Selecione...</option>
              {norma.MATERIAIS_RESERVATORIO.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </Field>
          <Field label={<>Posição do reservatório <Obrigatorio id="hidrantes.reservatorioPosicao"/></>}>
            <select className={inputClass} value={posicoes.some(p => p.key === h.reservatorioPosicao) ? h.reservatorioPosicao : ''} onChange={e => set({ reservatorioPosicao: e.target.value })}>
              <option value="">Selecione...</option>
              {posicoes.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </Field>
        </div>
        <ToggleRow label="Reservatório exclusivo para combate a incêndio?" checked={h.reservatorioExclusivo} onChange={v => set({ reservatorioExclusivo: v })}/>
        {!h.reservatorioExclusivo && (
          <div className="mt-3">
            <Field label={<>Volume total do reservatório (incêndio + outros usos) <Obrigatorio id="hidrantes.reservatorioVolumeTotal"/></>} hint="a reserva efetiva de incêndio deve ficar sempre garantida dentro desse total">
              <div className="relative">
                <input type="number" step="0.5" min={0} className={inputClass + ' pr-10'}
                  value={h.reservatorioVolumeTotal} onChange={e => set({ reservatorioVolumeTotal: e.target.value })}/>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">m³</span>
              </div>
            </Field>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mt-3 bg-surface-2 border border-solid border-border rounded-lg p-4">
          <Resultado label="RTI (Reserva Técnica de Incêndio)" hint={`Tabela 3, ${norma.NORMA.nome}`} value={h.rti ? `${fmtNum(h.rti, 2, h.rti)} m³` : '—'}/>
        </div>
      </FormSection>

      {/* C — Rede de tubulação */}
      <FormSection title="Rede de Tubulação">
        <div className="grid grid-cols-2 gap-4">
          <Field label={<>Material <Obrigatorio id="hidrantes.redeMaterial"/></>}>
            <select className={inputClass} value={h.redeMaterial} onChange={e => set({ redeMaterial: e.target.value })}>
              <option value="">Selecione...</option>
              {norma.MATERIAIS_TUBULACAO.map(m => (
                <option key={m.key} value={m.key}>{m.label} (C={m.fatorC})</option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      {/* D — Dispositivo de recalque */}
      {/* Opções na mesma linha do título (FormSection extra). */}
      <FormSection title={<>Dispositivo de Recalque <Obrigatorio id="hidrantes.recalqueTipo"/></>} extra={
        <div className="flex flex-wrap justify-end gap-2">
          {norma.TIPOS_RECALQUE.map(op => (
            <Pill key={op.key} active={h.recalqueTipo === op.key} onClick={() => set({ recalqueTipo: op.key })}>
              {op.label}
            </Pill>
          ))}
        </div>
      }>
        {h.recalqueTipo === 'passeio' && (
          <Field label={<>Justificativa técnica de impossibilidade <Obrigatorio id="hidrantes.recalqueJustificativaPasseio"/></>}>
            <textarea className={inputClass + ' min-h-[70px] resize-y'} value={h.recalqueJustificativaPasseio}
              onChange={e => set({ recalqueJustificativaPasseio: e.target.value })}/>
          </Field>
        )}
      </FormSection>

      {/* E — Abrigos e mangueiras: o que o RT escolhe (lances e tipo de
          mangueira, só os tipos que o sistema admite) e, depois, os
          componentes obrigatórios do Tipo (Tabela 4) como resultado. */}
      {dadosTipo && (() => {
        const c = dadosTipo.componentes
        const tipos = tiposMangueiraPermitidos(c.mangueiraIncendio)
        const tipoMangueira = tipos.some(([k]) => k === h.mangueiraTipo) ? h.mangueiraTipo : ''
        const sn = v => (v ? 'Sim' : 'Não')
        const componentes = [
          ['Abrigo', c.abrigo === 'obrigatorio' ? 'Obrigatório' : 'Opcional', c.abrigo === 'obrigatorio'],
          ['Mangueira de incêndio', norma.LABEL_MANGUEIRA_INCENDIO[c.mangueiraIncendio] || c.mangueiraIncendio || 'Não se aplica', !!c.mangueiraIncendio],
          ['Diâmetro / comprimento', `DN${dadosTipo.mangueiraDn} — ${dadosTipo.mangueiraComprimento} m`, true],
          ['Esguicho regulável', `DN${dadosTipo.esguicho}`, true],
          ['Chave para hidrante / engate', sn(c.chaveEngate), c.chaveEngate],
          ['Esguicho avulso', sn(c.esguichoAvulso), c.esguichoAvulso],
          ['Mangueira semirrígida com esguicho', sn(c.mangueiraSemirrigida), c.mangueiraSemirrigida],
        ]
        return (
          <FormSection title="Abrigos e Mangueiras">
            <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
              <Field label="Lances de mangueira — hidrantes internos">
                <select className={inputClass} value={h.lancesInternos || ''} onChange={e => set({ lancesInternos: e.target.value })}>
                  <option value="">Selecione...</option>
                  {LANCES_INTERNOS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </Field>
              <Field label="Lances de mangueira — hidrantes externos">
                <select className={inputClass} value={h.lancesExternos || ''} onChange={e => set({ lancesExternos: e.target.value })}>
                  <option value="">Selecione...</option>
                  <option value={NAO_SE_APLICA}>Não se aplica</option>
                  {LANCES_EXTERNOS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </Field>
              <Field label="Tipo de mangueira (NBR 11861)">
                <select className={inputClass} value={tipoMangueira} disabled={tipos.length === 0}
                  onChange={e => set({ mangueiraTipo: e.target.value })}>
                  <option value="">{tipos.length ? 'Selecione...' : 'Não se aplica (mangotinho)'}</option>
                  {tipos.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </Field>
            </div>
            {/* Resultado da Tabela 4, recolhido (mesma caixa azul do Acesso de
                Viatura); o que o Tipo não exige fica apagado. */}
            <div className="mt-5">
              <CaixaInfo titulo="Componentes obrigatórios">
                <dl className="m-0 grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1.5 text-xs">
                  {componentes.map(([rotulo, valor, exigido]) => (
                    <div key={rotulo} className="contents">
                      <dt className={exigido ? 'text-ink-muted' : 'text-ink-faint'}>{rotulo}</dt>
                      <dd className={`m-0 text-right font-semibold ${exigido ? 'text-ink' : 'text-ink-faint'}`}>{valor}</dd>
                    </div>
                  ))}
                </dl>
              </CaixaInfo>
            </div>
          </FormSection>
        )
      })()}

      {/* F — Válvulas */}
      <FormSection title="Válvulas">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Válvula do hidrante (globo angular)">
            <select className={inputClass} value={h.valvulaHidranteDn} onChange={e => set({ valvulaHidranteDn: Number(e.target.value) })}>
              <option value={65}>DN65 (2 ½")</option>
              <option value={50}>DN50 (2") — só Tipo 1/2 com rede DN50</option>
            </select>
          </Field>
          <Field label="Válvulas de bloqueio">
            <select className={inputClass} value={h.valvulaBloqueioTipo} onChange={e => set({ valvulaBloqueioTipo: e.target.value })}>
              <option value="gaveta">Gaveta</option>
              <option value="gaveta_os_y">Gaveta de haste ascendente (OS&Y)</option>
            </select>
          </Field>
        </div>
      </FormSection>

      {/* G — Observações */}
      <FormSection title="Observações complementares">
        <textarea className={inputClass + ' min-h-[90px] resize-y'} placeholder="Qualquer particularidade do projeto que não se encaixa nos campos acima..."
          value={h.observacoes} onChange={e => set({ observacoes: e.target.value })}/>
      </FormSection>
    </div>
  )
}
