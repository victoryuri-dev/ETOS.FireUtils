import { useProjeto } from '../../context/ProjetoContext'
import { observacaoBruta, acaoObservacao, ROTULO_OBSERVACOES } from '../../utils/observacoes'

// Campo padrão "Observações complementares" no fim do bloco de cada estrutura
// das páginas de medida — mesmo visual do campo que Compartimentação e
// Segurança Estrutural já tinham. Onde o texto fica guardado: ver
// utils/observacoes.js. `comNome` põe o nome da estrutura no rótulo — para
// páginas sem bloco por estrutura (ex.: Gerenciamento de Risco), onde os
// campos de todas as estruturas ficam listados juntos.
export default function ObservacoesComplementares({ estrutura, medida, placeholder, comNome = false }) {
  const { dispatch } = useProjeto()
  return (
    <div className="bg-surface border border-solid border-border rounded-lg overflow-hidden mt-3">
      <div className="py-3.5 px-[18px]">
        <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">{ROTULO_OBSERVACOES}{comNome ? ` — ${estrutura.nome}` : ''}</div>
        <textarea
          value={observacaoBruta(estrutura, medida)}
          onChange={e => dispatch(acaoObservacao(estrutura, medida, e.target.value))}
          placeholder={placeholder || 'Particularidades, isenções ou justificativas desta medida nesta estrutura (opcional).'}
          aria-label={`${ROTULO_OBSERVACOES} — ${estrutura.nome}`}
          className="bg-bg border border-solid border-border rounded-md text-ink text-xs py-2 px-2.5 w-full outline-none box-border min-h-[72px]"
        />
      </div>
    </div>
  )
}
