-- Remove `configuracoes_rede` (ramal único / malha fechado) da norma de
-- hidrantes: a configuração da rede deixou de ser perguntada no formulário
-- nem narrada no memorial. Os catálogos globais (materiais de tubulação e de
-- reservatório, tipos de recalque, acionamentos de bomba) agora vivem em
-- src/data/hidrantesCatalogos.js e o site ignora as cópias que ainda existirem
-- em normas_dados.

update public.normas_dados
set dados = dados - 'configuracoes_rede',
    versao = versao + 1,
    atualizado_em = now()
where sistema = 'hidrantes';
