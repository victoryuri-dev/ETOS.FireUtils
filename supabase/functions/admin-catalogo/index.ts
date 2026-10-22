// Edge Function: admin-catalogo
//
// Mantém o catálogo da biblioteca de famílias consistente com os buckets:
// confere fantasmas (item que cita arquivo inexistente) e órfãos (arquivo que
// nenhum item cita), publica o plugin-assets/catalog.json só quando tudo
// confere, importa o catálogo atual e remove órfãos.
//
// A lógica está em _shared/adminCatalogo.ts (testada com cliente falso).
// Requer o usuário com linha em `admins`; usa a service role só aqui dentro.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { criarHandler } from '../_shared/adminCatalogo.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(criarHandler(supabase))
