-- Compartimentação do MA: acrescenta à linha ('MA','compartimentacao') a
-- sigla da norma, citada nos textos das páginas de compartimentação
-- (comuns aos estados). Fonte: src/data/normas/MA/compartimentacao.js (NORMA).

update public.normas_dados
set dados = dados || $j${
  "norma": {
    "sigla": "NT 09 CBMMA",
    "nome": "Compartimentação Horizontal e Vertical"
  }
}$j$::jsonb,
    versao = versao + 1,
    atualizado_em = now()
where uf = 'MA' and sistema = 'compartimentacao';
