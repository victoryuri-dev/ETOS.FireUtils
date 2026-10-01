-- revit_syncs_latest.medida_check só aceitava 'extintores', 'hidrantes',
-- 'saidas_emergencia' e 'sinalizacao' — a Edge Function revit-sync passou a
-- aceitar também a medida 'iluminacao' (quantitativo de equipamentos de
-- aclaramento, ver supabase/functions/revit-sync/index.ts e
-- Fire Utils.tab/lib/sync.py no plugin): sem isso o INSERT/UPDATE falharia
-- no banco mesmo com a função validando tudo certo.
--
-- Amplia a constraint pra incluir 'iluminacao', preservando as demais — não
-- afeta nenhuma linha existente.
ALTER TABLE revit_syncs_latest DROP CONSTRAINT revit_syncs_latest_medida_check;

ALTER TABLE revit_syncs_latest ADD CONSTRAINT revit_syncs_latest_medida_check
  CHECK (medida = ANY (ARRAY['extintores'::text, 'hidrantes'::text, 'saidas_emergencia'::text, 'sinalizacao'::text, 'iluminacao'::text]));
