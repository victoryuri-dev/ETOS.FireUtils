// ── Cartao de secao de formulario — separa visualmente um conjunto de
// campos do resto da pagina (fundo, borda e titulo com peso proprio),
// em vez do antigo rotulo pequeno e cinza que se misturava ao fundo.
export default function FormSection({ title, description, extra, children }) {
  return (
    <section className="bg-surface hover:bg-surface-2 focus-within:bg-surface-2 transition-colors duration-300 ease-out border border-solid border-border rounded-lg p-5 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {description && <p className="text-[12px] text-ink-faint leading-[1.5] mt-1">{description}</p>}
        </div>
        {extra && <div className="shrink-0">{extra}</div>}
      </div>
      {children}
    </section>
  )
}
