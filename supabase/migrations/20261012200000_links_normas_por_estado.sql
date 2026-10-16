-- Links das normas por estado e medida. Executar no SQL Editor do Supabase.
-- Usa public.normas_dados, criada pela migração 20260906120000.
-- As políticas existentes já permitem leitura pública e restringem a escrita.
-- Não altera cálculos normativos, permissões ou habilitação de estados.
-- Após editar os links no banco, recarregue o FireUtils.

begin;
insert into public.normas_dados (uf, sistema, dados, versao)
values ('MA', 'links_normas', $links${
  "portal": "https://cbm.ssp.ma.gov.br/legislacao-tecnica/",
  "medidas": {
    "acesso_viatura": [
      {
        "titulo": "NT 06",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_06-ACESSO-DE-VIATURAS-NAS-EDIFICACOES-E-AREAS-DE-RISCO.pdf"
      }
    ],
    "seg_estrutural": [
      {
        "titulo": "NT 08",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_08-SEGURANCA-ESTRUTURAL-CONTRA-INCENDIO.pdf"
      }
    ],
    "compart_horizontal": [
      {
        "titulo": "NT 09",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_09-COMPARTIMENTACAO-HORIZONTAL-E-VERTICAL.pdf"
      }
    ],
    "compart_vertical": [
      {
        "titulo": "NT 09",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_09-COMPARTIMENTACAO-HORIZONTAL-E-VERTICAL.pdf"
      }
    ],
    "controle_acabamento": [
      {
        "titulo": "NT 10",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_10-CONTROLE-DE-MATERIAL-DE-ACABAMENTO-E-REVESTIMENTO.pdf"
      }
    ],
    "saida_emergencia": [
      {
        "titulo": "NT 11",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_11-SAIDA-DE-EMERGENCIA.pdf"
      }
    ],
    "carga_incendio": [
      {
        "titulo": "NT 14",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_14-CARGA-DE-INCENDIO.pdf"
      }
    ],
    "controle_fumaca": [
      {
        "titulo": "NT 15 — Parte 1",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_15-1-CONTROLE-DE-FUMACA-PARTE-1.pdf"
      }
    ],
    "gerenciamento_risco": [
      {
        "titulo": "NT 16",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_16-GERENCIAMENTO-DE-RISCO.pdf"
      }
    ],
    "brigada": [
      {
        "titulo": "NT 17 — Parte 1",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2023/05/NT_17-Brigada-de-Incendio-Parte-1-Brigada-de-Incendio-Organica-com-capa.pdf"
      }
    ],
    "iluminacao": [
      {
        "titulo": "NT 18",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_18-ILUMINACAO-DE-EMERGENCIA.pdf"
      }
    ],
    "alarme": [
      {
        "titulo": "NT 19",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_19-SISTEMA-DE-DETECCAO-E-ALARME-DE-INCENDIO.pdf"
      }
    ],
    "deteccao": [
      {
        "titulo": "NT 19",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_19-SISTEMA-DE-DETECCAO-E-ALARME-DE-INCENDIO.pdf"
      }
    ],
    "sinalizacao": [
      {
        "titulo": "NT 20",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_20-SINALIZACAO-DE-EMERGENCIA.pdf"
      }
    ],
    "extintores": [
      {
        "titulo": "NT 21",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_21-SISTEMA-DE-PROTECAO-POR-EXTINTORES.pdf"
      }
    ],
    "hidrantes": [
      {
        "titulo": "NT 22",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_22-SISTEMA-DE-PROTECAO-POR-HIDRANTES-E-MANGOTINHOS.pdf"
      }
    ],
    "sprinklers": [
      {
        "titulo": "NT 23",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_23-SISTEMA-DE-PROTECAO-POR-CHUVEIROS-AUTOMATICOS.pdf"
      }
    ],
    "central_gas": [
      {
        "titulo": "NT 28",
        "url": "https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/NT_28-MANIPULACAO-ARMAZENAMENTO-COMERCIALIZACAO-E-UTILIZACAO-DE-GAS-LIQUEFEITO-DE-PETROLEO-GLP.pdf"
      }
    ]
  }
}$links$::jsonb, 1)
on conflict (uf, sistema) do update
set dados = excluded.dados,
    versao = public.normas_dados.versao + 1,
    atualizado_em = now();
commit;

-- CADASTRAR OUTRO ESTADO (exemplo comentado; substituir pelos dados oficiais):
-- insert into public.normas_dados (uf, sistema, dados, versao)
-- values ('PE', 'links_normas', '{
--   "portal": "https://ENDERECO-OFICIAL/legislacao",
--   "medidas": {
--     "controle_acabamento": [{"titulo":"IT XX", "url":"https://ENDERECO-OFICIAL/norma.pdf"}],
--     "compart_horizontal": [{"titulo":"IT YY", "url":"https://ENDERECO-OFICIAL/compartimentacao.pdf"}],
--     "compart_vertical": [{"titulo":"IT YY", "url":"https://ENDERECO-OFICIAL/compartimentacao.pdf"}]
--   }
-- }'::jsonb, 1)
-- on conflict (uf, sistema) do update
-- set dados = excluded.dados, versao = public.normas_dados.versao + 1, atualizado_em = now();
-- Use qualquer UF brasileira e as mesmas chaves das medidas presentes no JSON do MA.
-- Cada medida aceita uma lista de documentos; [] oculta o atalho dessa medida.
-- Para atualizar UMA medida preservando as demais do mesmo estado:
-- update public.normas_dados
-- set dados = jsonb_set(dados, '{medidas,controle_acabamento}',
--   '[{"titulo":"IT XX", "url":"https://ENDERECO-OFICIAL/norma.pdf"}]'::jsonb),
--   versao = versao + 1, atualizado_em = now()
-- where uf = 'PE' and sistema = 'links_normas';
