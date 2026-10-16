// Estilos e utilitários de texto compartilhados pelos documentos gerados
// (memorial descritivo do MA e anexos do formulário da PB) — extraídos de
// MemorialDescritivoPage.jsx pra que as duas páginas nunca divirjam.

// Estilo unico de tabela do memorial — cabecalho cinza, zebra nas linhas e
// borda clara. Centralizado aqui pra que as tabelas das medidas, do Anexo de
// medidas aplicadas e da caracterizacao nao divirjam com o tempo.
export const TABELA = 'w-full border-collapse text-[10.5px] text-black mt-4 mb-2'
export const TABELA_THEAD = 'bg-[#f3f4f6]'
export const TABELA_TH = 'border border-solid border-[#d1d5db] px-2.5 py-2 font-bold'
export const TABELA_TD = 'border border-solid border-[#d1d5db] px-2.5 py-2'
export const zebra = i => (i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]')

// Texto corrido do documento inteiro — sempre 1,5 de entrelinha e sem margem
// (nenhum espaço extra antes/depois de parágrafo, item de lista ou campo: só
// a quebra do próprio bloco separa um do outro, como "Antes: 0pt / Depois:
// 0pt / Entrelinhas: 1,5" no Word). Centralizado aqui pra nunca divergir
// entre as seções do memorial — ver Titulo (abaixo) pro espaçamento de
// título/subtítulo, que é a única folga deliberada. `whitespace-pre-line`
// preserva quebra de linha de texto livre digitado pelo usuário (textareas
// como motivo de isenção, observações etc.) embutido nessas frases — sem
// isso o HTML colapsa "\n" num espaço e o texto sai corrido no memorial,
// mesmo com a quebra visível no formulário de origem.
export const TEXTO = 'text-[12.5px] text-black leading-[1.5] text-justify whitespace-pre-line'
export const TEXTO_PEQUENO = 'text-[12px] text-black leading-[1.5] whitespace-pre-line'

// Nomes digitados em CAIXA ALTA (ex.: "REFEITÓRIO") viram "Refeitório" nos
// titulos secundarios/terciarios; texto que ja tem minusculas fica como esta.
const CONECTIVOS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'a', 'o', 'para', 'com'])
export function tituloCase(texto) {
  if (!texto || texto !== texto.toUpperCase() || texto === texto.toLowerCase()) return texto
  return texto.toLowerCase().split(' ').map((p, i) =>
    (i > 0 && CONECTIVOS.has(p)) ? p : p.charAt(0).toUpperCase() + p.slice(1)
  ).join(' ')
}

// Numera os blocos de uma secao de medida: 'titulo2' vira N.M; 'titulo3' vira
// N.M.K. O memorial de hidrantes ja numera os proprios topicos ("7. Titulo" e
// "7.1 Trecho ...") — esses numeros sao aproveitados e apenas prefixados com
// o da secao, em vez de repetidos. Passos "1)" / "a)" de calculo mantem o
// marcador proprio, sem numero de secao.
export function numerarBlocos(blocos, numeroSecao) {
  let n2 = 0
  let n3 = 0
  return blocos.map(b => {
    if (b.tipo === 'titulo2') {
      if (b.semNumero) {
        const m = b.texto.match(/^(\d+)\.\s+(.*)$/)
        if (!m) return b
        n2 = Number(m[1])
        n3 = 0
        return { ...b, numero: `${numeroSecao}.${n2}`, texto: m[2] }
      }
      n2 += 1
      n3 = 0
      return { ...b, numero: `${numeroSecao}.${n2}` }
    }
    if (b.tipo === 'titulo3') {
      const explicito = b.texto.match(/^(\d+(?:\.\d+)+)\s+(.*)$/)
      if (explicito) return { ...b, numero: `${numeroSecao}.${explicito[1]}`, texto: explicito[2] }
      if (/^(\d+|[a-z])\)\s/.test(b.texto) || n2 === 0) return b
      n3 += 1
      return { ...b, numero: `${numeroSecao}.${n2}.${n3}` }
    }
    return b
  })
}
