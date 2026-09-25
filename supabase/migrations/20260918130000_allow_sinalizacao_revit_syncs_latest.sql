-- revit_syncs_latest.medida_check só aceitava 'extintores', 'hidrantes' e
-- 'saidas_emergencia' — criada direto no banco (sem migration própria até
-- agora), ficou desatualizada quando a Edge Function revit-sync passou a
-- aceitar a medida 'sinalizacao' (ver supabase/functions/revit-sync/index.ts
-- e Fire Utils.tab/lib/sync.py no plugin): a função validava tudo certo e o
-- INSERT/UPDATE só falhava no banco, sem mensagem específica pro cliente.
--
-- Amplia a constraint pra incluir 'sinalizacao', preservando as demais —
-- não afeta nenhuma linha existente.
ALTER TABLE revit_syncs_latest DROP CONSTRAINT revit_syncs_latest_medida_check;

ALTER TABLE revit_syncs_latest ADD CONSTRAINT revit_syncs_latest_medida_check
  CHECK (medida = ANY (ARRAY['extintores'::text, 'hidrantes'::text, 'saidas_emergencia'::text, 'sinalizacao'::text]));
