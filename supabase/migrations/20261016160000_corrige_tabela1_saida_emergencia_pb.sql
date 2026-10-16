-- Saída de emergência da PB (NT 12/2025, Anexo A, Tabela 1): ajustes da
-- linha ('PB','saida_emergencia') já existente, conferida célula a célula com
-- a tabela e as notas da norma. Valores (população e UP) estavam conformes;
-- corrige só:
--   * A-3 cita só a nota (D) na norma (a linha tinha C e D);
--   * notas (A), (E) e (F) com o texto completo da NT (a (F) não tinha
--     "salões de festas e centros de convenções em hotéis").
-- Fonte: src/data/normas/PB/saida_emergencia.js.

update public.normas_dados
set dados = jsonb_set(jsonb_set(jsonb_set(jsonb_set(dados,
      '{tabela,A-3,notas}', '["D"]'::jsonb),
      '{notas,A}', to_jsonb('(A) os parâmetros dados nesta tabela são os mínimos aceitáveis para o cálculo da população (ver 5.3).'::text)),
      '{notas,E}', to_jsonb('(E) por "Área" entende-se a "Área do pavimento" que abriga a população em foco, conforme terminologia da norma técnica específica de Terminologia de segurança contra incêndio. Quando discriminado o tipo de área (por ex.: área do alojamento), é a área útil interna da dependência em questão.'::text)),
      '{notas,F}', to_jsonb('(F) auditórios e assemelhados, em escolas, bem como salões de festas e centros de convenções em hotéis são considerados nos grupos de ocupação F-5, F-6 e outros, conforme o caso.'::text)),
    versao = versao + 1,
    atualizado_em = now()
where uf = 'PB' and sistema = 'saida_emergencia';
