// DaUi.jsx — peças de interface compartilhadas pelas páginas de Alarme e de
// Detecção de Incêndio (mesma norma, NT 19): cartão, linha com liga/desliga,
// campo numérico com unidade, notas da norma e quadro de parâmetros normativos.
import { useState } from 'react'
import Icon from '../ui/Icon'
import SwitchToggle from '../ui/SwitchToggle'
import InfoTip from '../ui/InfoTip'

export const inputBase = 'bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2.5 w-full outline-none box-border'
export const TH = 'py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium'
export const TD = 'py-2 px-3 text-xs'

export function Card({ titulo, icone, direita, children, className = '' }) {
  return (
    <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>
      {(titulo || direita) && (
        <div className="py-3.5 px-[18px] flex items-center justify-between gap-3 border-b border-solid border-border">
          <div className="flex items-center gap-2 min-w-0">
            {icone && <Icon name={icone} size={15} color="var(--color-red)"/>}
            <span className="text-xs font-bold text-ink">{titulo}</span>
          </div>
          {direita}
        </div>
      )}
      <div className="py-3.5 px-[18px]">{children}</div>
    </div>
  )
}

export function Rotulo({ children, dica }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="text-[10px] text-ink-faint uppercase tracking-[.06em]">{children}</div>
      {dica && <div className="text-[10px] text-ink-faint font-mono whitespace-nowrap">{dica}</div>}
    </div>
  )
}

/** Linha-pergunta com liga/desliga (clique em qualquer lugar da linha). Por
 * padrão, a explicação (`descricao`) fica num tip "(?)" ao lado do título,
 * pra quem já conhece a norma não precisar ler o parágrafo.
 * `pontoDeAtencao` (casos raros, como a tecnologia sem fio) troca isso: sem
 * item nem tip no título, e a descrição vira uma mensagem de atenção (âmbar)
 * logo abaixo, só quando ativado — porque ali a implicação é séria o
 * suficiente pra não depender de o usuário passar o mouse. */
export function LinhaChave({ titulo, descricao, checked, onChange, aviso, pontoDeAtencao = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-solid border-border last:border-b-0">
      <div className="min-w-0">
        <div className="text-[13px] text-ink font-medium flex items-center gap-1.5">
          {titulo}
          {!pontoDeAtencao && descricao && <InfoTip text={descricao}/>}
        </div>
        {pontoDeAtencao && checked && descricao && (
          <div className="flex items-start gap-1.5 mt-1">
            <Icon name="warn" size={12} color="var(--color-amber)" className="shrink-0 mt-0.5"/>
            <div className="text-[11px] text-amber leading-[1.5]">{descricao}</div>
          </div>
        )}
        {aviso && <div className="text-[11px] text-amber leading-[1.5] mt-0.5">{aviso}</div>}
      </div>
      <SwitchToggle checked={!!checked} onChange={onChange}/>
    </div>
  )
}

/** Campo numérico com unidade à direita; `onBlur` valida/corrige. */
export function CampoNum({ rotulo, dica, valor, onChange, onBlur, unidade, placeholder, step = '1', min = 0, max, className = '' }) {
  return (
    <div className={className}>
      {rotulo && <Rotulo dica={dica}>{rotulo}</Rotulo>}
      <div className="relative">
        <input type="number" step={step} min={min} max={max} className={`${inputBase} ${unidade ? 'pr-11' : ''}`}
          value={valor ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} onBlur={onBlur}/>
        {unidade && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">{unidade}</span>}
      </div>
    </div>
  )
}

/** Botão selecionável (fica vermelho quando ativo) — usado no lugar de <select>
 * quando as opções são poucas e a escolha merece destaque visual. */
export function BotaoOpcao({ ativo, onClick, children, tip }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-solid text-xs font-medium transition-colors ${ativo ? 'border-red bg-red-dim text-ink' : 'border-border bg-bg text-ink-faint hover:text-ink hover:border-ink-faint'}`}>
      {children}
      {tip && <span onClick={e => e.stopPropagation()}><InfoTip text={tip}/></span>}
    </button>
  )
}

export function Selecao({ rotulo, valor, onChange, opcoes, vazio = 'Selecione...' }) {
  return (
    <div>
      {rotulo && <Rotulo>{rotulo}</Rotulo>}
      <select className={inputBase} value={valor} onChange={e => onChange(e.target.value)}>
        <option value="">{vazio}</option>
        {opcoes.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
    </div>
  )
}

/** Campo de texto livre, com sugestões (datalist) das opções mais comuns da
 * norma — o usuário pode escolher uma ou digitar outro local qualquer. */
export function CampoComSugestoes({ rotulo, valor, onChange, opcoes, placeholder, id }) {
  return (
    <div>
      {rotulo && <Rotulo>{rotulo}</Rotulo>}
      <input className={inputBase} list={id} value={valor} placeholder={placeholder} onChange={e => onChange(e.target.value)}/>
      <datalist id={id}>
        {opcoes.map(o => <option key={o.key} value={o.label}/>)}
      </datalist>
    </div>
  )
}

export function Erro({ children }) {
  return (
    <div className="text-[11px] leading-[1.5] text-red flex items-start gap-1.5 mt-1.5">
      <Icon name="warn" size={12} color="var(--color-red)" className="shrink-0 mt-px"/>
      <span>{children}</span>
    </div>
  )
}

/** Notas da norma (específicas das ocupações presentes + gerais), recolhidas. */
export function NotasDaNorma({ especificas = [], gerais = [], sigla }) {
  const [aberto, setAberto] = useState(false)
  const total = especificas.length + gerais.length
  if (total === 0) return null
  const linha = (n, i) => (
    <li key={`${n.item}-${i}`} className="flex gap-2 text-[11px] text-ink-muted leading-[1.6]">
      <strong className="text-ink shrink-0 min-w-[34px]">{n.item}</strong>
      <span>{n.texto}</span>
    </li>
  )
  return (
    <div className="mt-4 pt-3.5 border-t border-solid border-border">
      <button type="button" onClick={() => setAberto(v => !v)}
        className="inline-flex items-center gap-1 text-[11px] text-ink-faint hover:text-ink bg-transparent border-none cursor-pointer p-0">
        <Icon name="chevD" size={12} className={`transition-transform ${aberto ? 'rotate-180' : ''}`}/>
        {aberto ? 'Ocultar notas' : `Notas da ${sigla || 'norma'} (${total})`}
      </button>
      {aberto && (
        <div className="mt-3 flex flex-col gap-3">
          {especificas.length > 0 && (
            <div>
              <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Para as ocupações desta estrutura</div>
              <ul className="flex flex-col gap-2 m-0 p-0 list-none">{especificas.map(linha)}</ul>
            </div>
          )}
          <div>
            <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Gerais</div>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">{gerais.map(linha)}</ul>
          </div>
        </div>
      )}
    </div>
  )
}

/** Quadro recolhido com os parâmetros normativos que a página usa (somente leitura;
 *  o que puder ser substituído é editado nos próprios campos, com o valor da norma
 *  como referência). */
export function QuadroParametros({ titulo, sigla, linhas }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="bg-surface border border-solid border-border rounded-lg overflow-hidden mb-8">
      <button type="button" onClick={() => setAberto(v => !v)}
        className="w-full py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 text-left">
        <span className="text-[13px] font-semibold text-ink">{titulo}</span>
        <span className="text-[11px] text-ink-faint">{sigla}</span>
        <Icon name="chevD" size={14} className={`ml-auto text-ink-faint transition-transform ${aberto ? 'rotate-180' : ''}`}/>
      </button>
      {aberto && (
        <dl className="m-0 py-3.5 px-[18px] grid grid-cols-2 gap-x-8 gap-y-2.5">
          {linhas.map(([rotulo, valor, item]) => (
            <div key={rotulo} className="flex items-baseline justify-between gap-3 border-b border-solid border-border pb-2">
              <dt className="text-[11px] text-ink-faint">{rotulo}{item && <span className="ml-1.5 font-mono text-[10px]">item {item}</span>}</dt>
              <dd className="m-0 text-xs font-semibold text-ink text-right">{valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
