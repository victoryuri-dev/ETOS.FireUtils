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
import { inputClass, Field, Resultado, Pill, Nota, ToggleRow } from './formUi'
import { POSICOES_RESERVATORIO } from '../../data/hidrantes_calc'

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
        <span>Área</span><span className="text-ink font-medium text-right">{area ? `${area.toLocaleString('pt-BR')} m²` : '—'}</span>
        <span>Ocupação</span><span className="text-ink font-medium text-right">{divisao || '—'}</span>
        <span>Carga de incêndio</span><span className="text-ink font-medium text-right">{carga != null ? `${carga} MJ/m²` : '—'}</span>
        <span>Risco</span><span className={`font-medium text-right ${risco ? RISCO_COLOR[risco] : ''}`}>{risco ? RISCO_LABEL[risco] : '—'}</span>
      </div>
    </button>
  )
}

export default function FormularioSistema() {
  const {
    h, set, norma,
    infoPorEstrutura, estruturasSelecionadas, toggleEstrutura,
    areaTotal, sugestao, escolherOpcao,
    tipoAtual, dadosTipo, recalqueDuplo, vazaoSistema,
  } = useClassificacaoHidrantes()

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
      <FormSection title="Classificação do Sistema" description="Cruzamento área construída × ocupação, conforme Tabela 3 da NT 22 CBMMA.">
        <div className="grid grid-cols-2 gap-4 bg-surface-2 border border-solid border-border rounded-lg p-4 mb-4">
          <Resultado label="Área total construída (estruturas selecionadas acima)"
            value={areaTotal ? `${areaTotal.toLocaleString('pt-BR')} m²` : '—'}/>
          <Resultado label="Ocupação usada na classificação" hint={sugestao.divisao ? `coluna ${sugestao.coluna} da Tabela 3` : undefined}
            value={sugestao.divisao || 'Nenhuma divisão classificada ainda (Etapa 4/5)'}/>
        </div>

        {sugestao.opcoes.length > 1 && (
          <div className="mb-4">
            <Field label="A norma permite dois sistemas para esta ocupação — escolha qual adotar" />
            <div className="grid grid-cols-2 gap-2 mt-1">
              {sugestao.opcoes.map(op => (
                <Pill key={op.tipo} active={h.tipo === op.tipo} onClick={() => escolherOpcao(op)}>
                  Tipo {op.tipo} — RTI {op.rti} m³
                </Pill>
              ))}
            </div>
          </div>
        )}

        {sugestao.opcoes.length === 1 && sugestao.opcoes[0].nota && (
          <Nota>{sugestao.opcoes[0].nota}</Nota>
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
          <Field label="Material do reservatório">
            <select className={inputClass} value={h.reservatorioMaterial} onChange={e => set({ reservatorioMaterial: e.target.value })}>
              <option value="">Selecione...</option>
              {norma.MATERIAIS_RESERVATORIO.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Posição do reservatório">
            <select className={inputClass} value={h.reservatorioPosicao} onChange={e => set({ reservatorioPosicao: e.target.value })}>
              <option value="">Selecione...</option>
              {POSICOES_RESERVATORIO.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </Field>
        </div>
        <ToggleRow label="Reservatório exclusivo para combate a incêndio?" checked={h.reservatorioExclusivo} onChange={v => set({ reservatorioExclusivo: v })}/>
        {!h.reservatorioExclusivo && (
          <div className="mt-3">
            <Field label="Volume total do reservatório (incêndio + outros usos)" hint="a reserva efetiva de incêndio deve ficar sempre garantida dentro desse total">
              <div className="relative">
                <input type="number" step="0.5" min={0} className={inputClass + ' pr-10'}
                  value={h.reservatorioVolumeTotal} onChange={e => set({ reservatorioVolumeTotal: e.target.value })}/>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">m³</span>
              </div>
            </Field>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mt-3 bg-surface-2 border border-solid border-border rounded-lg p-4">
          <Resultado label="RTI (Reserva Técnica de Incêndio)" hint="Tabela 3, NT 22" value={h.rti ? `${h.rti} m³` : '—'}/>
        </div>
      </FormSection>

      {/* C — Rede de tubulação */}
      <FormSection title="Rede de Tubulação">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Material">
            <select className={inputClass} value={h.redeMaterial} onChange={e => set({ redeMaterial: e.target.value })}>
              <option value="">Selecione...</option>
              {norma.MATERIAIS_TUBULACAO.map(m => (
                <option key={m.key} value={m.key}>{m.label} (C={m.fatorC})</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="text-[11px] text-ink-faint mt-3">
          Diâmetro mínimo da rede: DN65 (DN50 permitido apenas em sistemas Tipo 1 ou 2, item 5.11.6).
        </div>
      </FormSection>

      {/* D — Dispositivo de recalque */}
      <FormSection title="Dispositivo de Recalque (Corpo de Bombeiros)">
        <div className="flex flex-wrap gap-2 mb-3">
          {norma.TIPOS_RECALQUE.map(op => (
            <Pill key={op.key} active={h.recalqueTipo === op.key} onClick={() => set({ recalqueTipo: op.key })}>
              {op.label}
            </Pill>
          ))}
        </div>
        {h.recalqueTipo === 'passeio' && (
          <Field label="Justificativa técnica de impossibilidade">
            <textarea className={inputClass + ' min-h-[70px] resize-y'} value={h.recalqueJustificativaPasseio}
              onChange={e => set({ recalqueJustificativaPasseio: e.target.value })}/>
          </Field>
        )}
        {/* Verificação do nº de entradas — item 5.3.3, NT 22: vazão do
            sistema acima de 1.000 L/min exige recalque duplo. Não é uma
            escolha do RT (auto-sincronizada em h.recalqueEntradas, ver
            useClassificacaoHidrantes) — só um resultado a conferir. */}
        {dadosTipo && (
          <div className={`flex items-center justify-between gap-3 mt-3 py-2.5 px-3.5 rounded-md border border-solid ${recalqueDuplo ? 'bg-amber-dim border-amber-border' : 'bg-surface-2 border-border'}`}>
            <span className="text-xs text-ink">
              Vazão do sistema ({dadosTipo.vazaoMin} L/min × {norma.HIDRANTES_SIMULTANEOS} hidrantes simultâneos = {vazaoSistema} L/min) {recalqueDuplo ? 'acima' : 'dentro'} do limite de 1.000 L/min (item 5.3.3, NT 22)
            </span>
            <span className={`shrink-0 inline-block py-[3px] px-2.5 rounded font-bold text-[11px] border border-solid whitespace-nowrap ${recalqueDuplo ? 'bg-amber-dim border-amber-border text-amber' : 'bg-green-dim border-green-border text-green'}`}>
              Recalque {recalqueDuplo ? 'duplo — 2 entradas' : 'simples — 1 entrada'}
            </span>
          </div>
        )}
      </FormSection>

      {/* E — Abrigos e mangueiras (derivado da Tabela 4, somente leitura) */}
      {dadosTipo && (
        <FormSection title="Abrigos e Mangueiras" description="Componentes obrigatórios para o Tipo de sistema adotado (Tabela 4, NT 22).">
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span className="text-ink-faint">Abrigo</span><span className="text-ink font-medium capitalize">{dadosTipo.componentes.abrigo}</span>
            <span className="text-ink-faint">Mangueira de incêndio</span><span className="text-ink font-medium">{norma.LABEL_MANGUEIRA_INCENDIO[dadosTipo.componentes.mangueiraIncendio] || (dadosTipo.componentes.mangueiraIncendio ? dadosTipo.componentes.mangueiraIncendio : 'Não se aplica')}</span>
            <span className="text-ink-faint">Diâmetro / comprimento da mangueira</span><span className="text-ink font-medium">DN{dadosTipo.mangueiraDn} — {dadosTipo.mangueiraComprimento} m</span>
            <span className="text-ink-faint">Esguicho regulável</span><span className="text-ink font-medium">DN{dadosTipo.esguicho}</span>
            <span className="text-ink-faint">Chave para hidrante / engate</span><span className="text-ink font-medium">{dadosTipo.componentes.chaveEngate ? 'Sim' : 'Não'}</span>
            <span className="text-ink-faint">Esguicho avulso</span><span className="text-ink font-medium">{dadosTipo.componentes.esguichoAvulso ? 'Sim' : 'Não'}</span>
            <span className="text-ink-faint">Mangueira semirrígida com esguicho</span><span className="text-ink font-medium">{dadosTipo.componentes.mangueiraSemirrigida ? 'Sim' : 'Não'}</span>
          </div>
        </FormSection>
      )}

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
        <div className="text-[11px] text-ink-faint mt-3">
          Válvula do mangotinho: esfera de abertura rápida, DN25 (1") — fixo pela NT 22, item 5.5.4.
        </div>
      </FormSection>

      {/* G — Observações */}
      <FormSection title="Observações Complementares">
        <textarea className={inputClass + ' min-h-[90px] resize-y'} placeholder="Qualquer particularidade do projeto que não se encaixa nos campos acima..."
          value={h.observacoes} onChange={e => set({ observacoes: e.target.value })}/>
      </FormSection>
    </div>
  )
}
