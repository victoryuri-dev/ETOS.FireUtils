// Gera supabase/functions/admin-catalogo/index.ts como um arquivo ÚNICO, juntando
// _shared/catalogo.ts e _shared/adminCatalogo.ts (que são o que os testes cobrem).
//
// Por quê: o deploy pelo painel do Supabase (e alguns fluxos de CLI) empacota só
// a pasta da função e não enxerga ../_shared. Com um arquivo só, funciona em
// qualquer deploy. NÃO edite o index.ts à mão: mude os _shared e rode
//   node scripts/gerar-admin-catalogo.mjs
// (tests/adminCatalogoBundle.test.mjs falha se o index.ts estiver desatualizado).

import { readFileSync, writeFileSync } from 'node:fs'

const raiz = new URL('../supabase/functions/', import.meta.url)
const ler = (p) => readFileSync(new URL(p, raiz), 'utf8')

export function gerar() {
  const catalogo = ler('_shared/catalogo.ts').replace(/^export /gm, '')
  const handler = ler('_shared/adminCatalogo.ts')
    .replace(/^import \{[\s\S]*?\} from '\.\/catalogo\.ts'\n/m, '')
    .replace(/^export function criarHandler/m, 'function criarHandler')

  return `// GERADO por scripts/gerar-admin-catalogo.mjs — não edite à mão.
// Fonte: supabase/functions/_shared/catalogo.ts e _shared/adminCatalogo.ts.
//
// Edge Function: admin-catalogo
//
// Mantém o catálogo da biblioteca de famílias consistente com os buckets:
// confere fantasmas (item que cita arquivo inexistente) e órfãos (arquivo que
// nenhum item cita), publica o plugin-assets/catalog.json só quando tudo
// confere, importa o catálogo atual e remove órfãos.
//
// Requer o usuário com linha em \`admins\`; usa a service role só aqui dentro.

import { createClient } from 'jsr:@supabase/supabase-js@2'

// ---- _shared/catalogo.ts ----
${catalogo}
// ---- _shared/adminCatalogo.ts ----
${handler}
// ---- servidor ----
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(criarHandler(supabase))
`
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  writeFileSync(new URL('admin-catalogo/index.ts', raiz), gerar())
  console.log('admin-catalogo/index.ts gerado')
}
