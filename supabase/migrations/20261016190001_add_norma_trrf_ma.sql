-- TRRF do MA: acrescenta à linha ('MA','trrf') a sigla da norma e as
-- referências citadas nos textos da tela e do memorial (até aqui fixas no
-- código como "NT 01 CBMMA", "SSCI do CBMMA", "item 5.12" e "item 4.31, NT 03
-- CBMMA"). Fonte: src/data/normas/MA/trrf.js (NORMA).

update public.normas_dados
set dados = dados || $j${
  "norma": {
    "sigla": "NT 01 CBMMA",
    "orgaoAnalise": "SSCI do CBMMA",
    "itemNaoRegressao": "5.12",
    "terminologia": "item 4.31, NT 03 CBMMA"
  }
}$j$::jsonb,
    versao = versao + 1,
    atualizado_em = now()
where uf = 'MA' and sistema = 'trrf';
