-- Iluminação do MA: acrescenta à linha ('MA','iluminacao') a sigla da norma,
-- citada na tela e no memorial (até aqui fixa no código como "NT 18 CBMMA").
-- Fonte: src/data/normas/MA/iluminacao.js (NORMA).

update public.normas_dados
set dados = dados || $j${
  "norma": {
    "sigla": "NT 18 CBMMA"
  }
}$j$::jsonb,
    versao = versao + 1,
    atualizado_em = now()
where uf = 'MA' and sistema = 'iluminacao';
