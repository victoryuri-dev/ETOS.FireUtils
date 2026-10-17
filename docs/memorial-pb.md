# Memorial Descritivo — Paraíba (CBMPB)

Na Paraíba o memorial não é texto corrido como no Maranhão: é o **formulário oficial do CBMPB** (DSPCI — Seção de Análise de Projeto), de marcar X e preencher campos curtos, com "Exigível / Não exigível" em cada medida. Este documento registra o levantamento campo a campo do formulário contra o que o FireUtils já tinha, e o que já foi implementado.

## Como está montado

| Peça | Arquivo |
|---|---|
| Parâmetros do formulário (faixas, classes, listas) | Supabase `('PB','memorial_formulario')` — seed gerado de `src/data/normas/PB/memorial_formulario.js` |
| Classificação e exigências NT 04/2023 | Supabase `('PB','ocupacoes')` e `('PB','medidas_seguranca')` (já cadastradas no banco); `src/data/normas/PB/ocupacoes.js` é só referência/fixture de teste (o site lê só o banco) |
| Gerador dos dados do formulário (puro, testável) | `src/data/memorial/PB/formulario.js` |
| Página / desenho do formulário | `src/pages/documentos/MemorialPBPage.jsx` (+ estilos `.pbf-*` em `src/index.css`) |
| Campos que só a PB pede | `state.memorialPB` (ProjetoContext) — boxes "Campos específicos da Paraíba" (`src/components/pb/CamposPB.jsx`) no fim de cada página de medida e na Configuração (Etapa 2: forma de apresentação, estágio, adaptações, observação da natureza; Etapa de Medidas: classe de GLP) |
| Testes | `tests/memorialPB.test.mjs` |
| SQL | `supabase/migrations/20261016120001_seed_normas_memorial_formulario_pb.sql` (só o sistema novo `memorial_formulario`) |

Regras do gerador:
- todo dado sai do projeto (mesmos cálculos das telas), dos parâmetros do formulário ou de `state.memorialPB`, nunca de suposição;
- itens de **atesto** ("as escadas atendem ao item 5.7...") nunca são marcados automaticamente, só quando o RT marca;
- **Exigível / Não exigível**: sai da tabela de exigências da NT 04/2023 (`medidas_seguranca` da PB, via `useMedidasObrigatorias`) — "exigível" quando a norma exige ou o RT adotou a medida. Se a tabela não carregar (offline), "não exigível" fica **em aberto** (nenhum dos dois marcado), porque não haveria base para afirmar;
- seções ainda não ligadas ao projeto saem com o texto do formulário e campos em branco, mas com Exigível/Não exigível marcado, para o documento sair completo.

**Estado do projeto**: escolhido antes de abrir a ferramenta (modal em "Criar novo projeto"; estados sem norma aparecem em cinza com cadeado) e travado depois (o reducer ignora `SET_FIELD 'uf'`). O estado decide a norma e o modelo de documento: projeto da PB abre este formulário em Documentos, no lugar do Anexo B e do memorial do MA.

## Levantamento por seção

✅ = implementado · 🔜 = próxima etapa (definir forma de implementação)

| Seção | Status | Origem dos dados / o que falta |
|---|---|---|
| **1. Identificação** | ✅ | `respRazaoSocial`/`nome`, endereço, `bairro`, `cidade`, `rtNome`, `rtConselho`, `artNumero`. |
| **2. Forma de apresentação** | ✅ | Automático pelo enquadramento técnico/simplificado (box "Tipo de projeto", Etapa 2): PCI ou PCIS. PTIOT e PTOTEP não são gerados pela ferramenta. |
| **3.1 Natureza da ocupação** | ✅ | Divisões de todas as estruturas, com os rótulos da NT 04/2023 do banco. Observação livre nova (`obsNatureza`). A-1 não tem linha no formulário: cai na observação. |
| **3.2 Altura (Tipo I–V)** | ✅ | Maior altura entre as estruturas, com a tabela do próprio formulário (até 30 m). |
| **3.3 Área construída** | ✅ | `areaConstruidaTotal`; com várias estruturas, uma linha por estrutura (nome + área). |
| **3.4 Risco e validade** e **3.5 Nível de carga** | ✅ | Maior carga de incêndio do projeto (≤300 / ≤1200 / >1200 MJ/m²), com o mapa de CNAEs da NT 02/2023 (`carga_incendio` da PB no Supabase). |
| **3.4.1 Classe de GLP (NBR 15514)** | ✅ | Novo: `memorialPB.glpClasse`, só com o risco especial GLP marcado. |
| **3.6 Estágio da construção** | ✅ | Box Situação (Etapa 2): nova = "ainda será construída"; existente = 3 opções "as built" + `adaptacoes` (NT 16 / Resoluções Técnicas). |
| **4. Medidas de proteção** | ✅ | `sistemas[].ativo`. Espuma e resfriamento ainda não existem no app (sempre em branco). |
| **5. Riscos especiais** | ✅ | Lista por estado (`riscosEspeciaisDoEstado`); a PB acrescenta tendas/coberturas inflamáveis, estrutura montada, geradores e sistemas elétricos montados (Etapa 6). |
| **6. Acesso de viatura** | ✅ | O RT informa as distâncias (entrada da circulação comum e registro do recalque até a via) e os dados da via; `estados/PB/acessoViatura.js` marca a linha (casos 1–5) e as exigências da via (a–f, largura 5–6 m, retorno, portão, faixa de estacionamento). Limites no `memorial_formulario` (`acesso_viatura`). Recalque > 20 m com edificação ≤ 50 m não tem linha no formulário: obrigatório, nenhuma marcada, aviso na página. |
| **7. Segurança estrutural** | ✅ | Grupo, divisão, classe e TRRF de `trrf_calc`, pela tabela da NT 08/2024 da PB. |
| **8. Compartimentação** | ✅ | Área máxima (a mais restritiva) e elementos marcados na tela de Compartimentação; característica de cada elemento nova (`especificacaoCompart`). ⏸ NT 36 da PB não cadastrada (adiada): página com "norma não cadastrada" e seção em branco. |
| **9. CMAR** | ✅ | Linha marcada pelo grupo/divisão; observação nova. |
| **10. Saídas de emergência** | ✅ | Página comum de Saída de Emergência (ambientes, acessos, tipo de escada) com a norma da PB; no fim, as declarações do RT do item 10. Anexo A = texto do dimensionamento. |
| **11.1 Plano de emergência** | ✅ | Novo: `memorialPB.planoModelo` (item 6 / Anexo B da NT 13/2023) + observação. |
| **12. Brigada** | ✅ | Quantidade, divisão, risco e nível de `brigada_calc` com a Tabela A.1 da NT 17/2024 e o item 4.11.2 (público da edificação). Carga horária pela Tabela B.2 da NT 17/2024 (maior nível exigido: básico 4 h, intermediário 8 h, avançado 24 h), mostrada com a origem na página; tempo entre simulados com 12 meses por padrão; dimensionamento preenchido pelo cálculo; 2 atestos. |
| **13. Iluminação** | ✅ | Box da PB na página de Iluminação: altura de instalação (`memorialPB.iluAlturaInstalacao`) → distância máxima 4 × H; atestos por grupo (gerais, circuitos, luminárias, 13.1–13.4 só do tipo adotado). Fluxo exato = fluxos cadastrados no projeto. Tipo UPS na norma da PB. Observações complementares por estrutura. |
| **14. Alarme e detecção** | ✅ | Local da central (`centralLocal`); raio e altura dos detectores do tipo adotado (limites da norma usados no dimensionamento). Itens 14.1 viraram atestos. |
| **15. Sinalização** | 🔜 | Atestos e placas M-1/M-2 (dá para tirar do quantitativo). |
| **16. Extintores** | ✅ | NT 21/2024 da PB. Linha pelo nível de carga; nível III com escolha do RT (`extintorNivelIII`); linhas especiais pelos riscos (G-3, GLP, central de gás, fogos). |
| **17. Hidrantes** | ✅ | Página comum de Hidrantes (dimensionamento, bombas) com a norma da PB: tipo/variante, vazão (Qs) e pressão (P_ref) do hidrante mais desfavorável, RTI, reservatório (elevado / subterrâneo → enterrado / semienterrado), materiais, pressão das bombas (Ht) e jockey. No fim, só o que ela não tem: manancial, NSTH, diâmetro das tubulações, lances, tipo de mangueira e declarações. Anexo B = memorial de hidrantes + memorial de cálculo. |
| **18. Chuveiros automáticos (SPK)** | 🔜 | Não há tela no app. Hoje: só o Exigível. |
| **19. SPDA** | 🔜 | Sem regra de exigência no app (análise de risco NBR 5419): "Exigível" só quando o RT adota. |
| **20. Isolamento de risco (NT 20/2023)** | 🔜 | Novo, por par de edificações. Hoje: em branco. |
| **Anexos A–D / assinatura** | ✅ | A = texto de Saídas do memorial do MA (quando ativa); B = Hidrantes + memorial de cálculo (quando ativo); C e D só a orientação do formulário. Assinatura com nome, graduação (`rtEspecialidade`) e CREA/CAU. |

## Normas da PB que ainda faltam cadastrar

Já no Supabase (PB): `ocupacoes`, `medidas_seguranca`, `memorial_formulario`, `saida_emergencia` (conferida: mesmo formato do MA; Tabela 1 = PDF da NT 12/2025, grupo C a 5 m²/pessoa), `carga_incendio` e `hidrantes` (a conferir). Tipos de escada (Anexo C, Tabela 3): migração `20261016150000_add_tipos_escada_saida_emergencia_pb.sql` — notas da tabela ainda não transcritas.

Extintores (NT 21/2024): `20261016170000_seed_normas_extintores_pb.sql` — Tabelas 1 a 5 da NT; nível III com duas opções (3-A a 15 m / 4-A a 20 m), escolhida no box da PB da página de extintores. ⚠ Distância de sobre rodas e classe D, altura de instalação, unidade única, proporção, locais de risco especial, entrada/escadas e classe K copiados do MA, a conferir.

Brigada (NT 17/2024, Anexo A): `20261016180000_seed_normas_brigada_pb.sql` — Tabela A.1 e notas conferidas contra o PDF; diferenças para o MA em H-1, H-3, H-4, H-5, H-6, M-5, B-2 (sem a nota 3), F-5 (nota 10) e F-7. Item 4.11.2 (`dimensionamento_publico`): F-7 sempre e, pela nota 10, F-2/F-3/F-5/F-6/F-11 com público acima de 250 pessoas — público = população da edificação inteira (soma dos pavimentos da estrutura na Saída de Emergência). Carga horária pela Tabela B.2 (`carga_horaria_treinamento`).

TRRF (NT 08/2024, Anexo B): `20261016190000_seed_normas_trrf_pb.sql` — tabela transcrita das imagens; ⚠ notas, divisões de subsolo sem ocupação e metodologias com textos do MA adaptados. Textos da tela/memorial citam a norma do estado (`norma` da linha 'trrf'; migração `20261016190001_add_norma_trrf_ma.sql` para o MA).

Iluminação (NT 18/2024): `20261016200000_seed_normas_iluminacao_pb.sql` — 3 lux (planos) / 5 lux (desnível), espaçamento 15 m / 7,5 m, 30 V, isenção de salas ≤ 50 m², balizamento em F-3/F-5/F-6/F-7/F-10/F-11; uniformidade e tempo de resposta da NBR 10898; autonomia 2 h (formulário do CBMPB). Sigla na tela/memorial: migração `20261016200001_add_norma_iluminacao_ma.sql` para o MA.

Faltam: `compartimentacao` (NT 36, adiada), `controle_acabamento`, `acesso_viatura` (NT 14/2023), `sinalizacao`, `deteccao_alarme`, `nts` e `links_normas`. Sem cada um, a página da medida mostra "norma não cadastrada" e a seção do formulário fica em branco.

Na saída de emergência, L-4, M-2, M-6 e M-7 (NT 04/2023) não estão na Tabela 1 nem na Tabela 2 da NT 12/2025; H-2/H-3 têm larguras especiais que o cálculo ainda não modela.

## Padronização da tabela de exigências da PB (`medidas_seguranca`)

A linha `('PB','medidas_seguranca')` do Supabase (NT 04/2023) foi comparada campo a campo com a do MA (formato que o motor de normas lê):

| Parte | Situação | Tratamento |
|---|---|---|
| `medidas` grupos A–E (`medidas` direto no grupo) | Igual ao MA | — |
| `medidas` grupos F, G, H, I, J, M-3, M-5 (divisão na chave da subtabela: `F['F-3_F-9'].medidas`) | Layout diferente do MA (`F['F1_F2'].medidas['F-1']`) | Código aceita os dois (`_medidasDaDivisaoNormal`) |
| `M-4_M-7` (exigência fixa `true` / `{ exigido }`) | Sem condição de altura | Código aceita (`_condSatisfeita`) |
| K (volume), M-1 (extensão), M-2 (tanques/plataformas), L e M-6 (Comissão Técnica / norma específica) | Critério que o app não coleta | Tratados como "sem dados": mínimo de referência + sinalização para o RT |
| `tabela5_edificacoesPequenas` (medida → coluna) | Formato diferente da `tabela_simplificada` (grupo/divisão → medida) | SQL `20261016130000_padroniza_medidas_seguranca_pb.sql` acrescenta `tabela_simplificada` gerada a partir dela |
| `limiares` (930 m² / 12 m, "menor ou igual") | MA usa "<" | SQL acrescenta `limiares.inclusivo = true`; código respeita |
| `notasEspecificas` por grupo, `tabelaAltura`, `tabela7_subsolos`, `tabelaCargaIncendio` | Extras da PB | Não lidos pelo motor hoje (sem efeito no cálculo) |

O SQL só acrescenta chaves — nada existente é apagado. Se a `tabela5_edificacoesPequenas` for corrigida no banco, a `tabela_simplificada` precisa ser regerada.

## Observações complementares (padrão para todos os estados)

Toda página de medida tem, no fim do bloco de cada estrutura, o campo **"Observações complementares"** (`components/ui/ObservacoesComplementares.jsx`, dados em `utils/observacoes.js`):

- Segurança estrutural e Compartimentação continuam usando os campos que já existiam (`obsSegEstrutural`, `obsCompartimentacao`) — só o rótulo mudou (era "Observações do responsável técnico").
- CMAR, Saídas de emergência, Brigada, Alarme, Detecção, Extintores e Gerenciamento de risco: `estrutura.observacoes[medida]`. Gerenciamento de risco não tem bloco por estrutura: os campos de todas ficam listados juntos num box da página.
- Hidrantes continua com um campo único do sistema ("Observações complementares"), por ser um sistema só por projeto.
- **Memorial do MA**: cada observação entra no trecho da própria estrutura (em Saídas e Extintores, logo após o título da estrutura, antes dos pavimentos; no Plano de Emergência, numa subseção no fim, com o nome de cada estrutura).
- **Formulário da PB**: o campo de observações de cada seção lista as de todas as estruturas (com o nome da estrutura quando há mais de uma). Os rótulos impressos do formulário ("OBSERVAÇÕES LIVRES:") seguem o modelo do CBMPB.

## Tipo de projeto (técnico × simplificado) — todos os estados

Box **"Tipo de projeto"** na Etapa 2, logo após "Terreno e área construída" (`components/steps/TipoProjetoBox.jsx`). Só informa: o enquadramento é automático (`data/tipoProjeto.js`), pela área e altura de cada estrutura contra os limiares da tabela de medidas do estado — o mesmo critério que escolhe entre a Tabela 5 e a Tabela 6. Uma estrutura acima do limite torna o projeto técnico; faltando área/altura, fica pendente.

| Estado | Técnico | Simplificado | Limite do simplificado |
|---|---|---|---|
| MA | Projeto Técnico (PT) | Projeto Técnico Simplificado (PTS) | área < 750 m² e altura < 12 m |
| PB | Projeto de Segurança contra Incêndio (PCI) | Projeto Técnico de Segurança Contra Incêndio Simplificado (PCIS) | área ≤ 930 m² e altura ≤ 12 m |

A ferramenta só gera esses dois tipos. No formulário da PB, a seção 2 marca PCI (com o tipo ao lado) e deixa PTIOT/PTOTEP em branco — o seletor manual de forma de apresentação foi removido. No memorial do MA, o tipo entra em "Sobre a Edificação → Dados do Imóvel".

## Estágio de construção (item 3.6) — box Situação

O estágio sai da **Situação** da Etapa 2: edificação **nova** marca "A edificação ainda será construída". Edificação **existente** (só em projeto da PB) abre, dentro do próprio box Situação, as três opções "as built" do formulário (`EstagioExistentePB`); com "adaptações da NT 16" ou "Resoluções Técnicas", abre o campo para descrevê-las. Uma escolha de existente não vale depois de trocar para "nova", e o texto das adaptações só entra no formulário com essas duas opções. A observação da natureza da ocupação (3.1) fica no box "Campos específicos da Paraíba" da etapa de Classificação.

## Base normativa só no Supabase

O site não lê mais nenhuma norma do código: tudo vem de `normas_dados` (Supabase). O projeto só abre depois que as normas do estado carregam (tela de "carregando"/"tentar de novo"); sistema não cadastrado para o estado = página da medida com aviso "norma não cadastrada", seção do memorial pendente, campos do formulário da PB em branco — nunca a norma de outro estado. Os arquivos `src/data/normas/<UF>/*.js` ficam só como fonte dos seeds e fixtures dos testes (`tests/helpers/normasDeTeste.mjs`).

## Fluxo próprio da PB (estados/PB)

O MA e a PB preenchem de formas diferentes: o MA tem páginas de medida detalhadas (Revit, quantitativos, distribuição por pavimento) e gera o memorial em texto; a PB só preenche o formulário do CBMPB com os dimensionamentos padrão da norma. Por isso cada estado tem o próprio fluxo, sobre um núcleo comum (Configuração, classificação, carga de incêndio, normas e cálculos).

- `src/estados/registro.js`: qual página cada medida abre por estado. Projeto da PB → `estados/PB/paginas.jsx`; sem entrada → páginas de `src/pages/medidas` (MA). Rotas, menu lateral e dashboard continuam os mesmos (`/medida/:sistKey`).
- `src/estados/ExtensaoConfig.jsx`: campos do estado nas etapas comuns (PB: estágio "as built" no box Situação, observação da natureza da ocupação, classe de GLP).
- `src/estados/PB/PaginaPB.jsx`: layout de cada página da PB — Exigível/Não exigível, campos do formulário, observações complementares por estrutura e a prévia da seção como sai no documento.
- `src/estados/PB/campos.jsx`: os campos (state.memorialPB). `src/estados/PB/formulario.js`: o formulário. `src/estados/PB/saidas.js`: resumo do item 10 a partir do dimensionamento da página de Saída de Emergência (comum aos estados, com a NT 12/2025); o Anexo A é o texto desse dimensionamento.
- `src/estados/fluxos.js`: estados com fluxo próprio — a auditoria não cobra deles os campos das páginas do MA.
- Saídas de emergência e hidrantes usam a página de dimensionamento comum (em todos os estados), com a norma do estado e um espaço `extra` no fim para os campos próprios do estado. As demais medidas da PB não leem as páginas do MA: iluminação (tipo, fluxo, altura), alarme/detecção (centrais, tipos de detector), compartimentação (elementos), saídas e hidrantes (tipo, vazão/pressão, RTI, mangueiras, bombas, Anexo B) vêm de `state.memorialPB`.

## Trabalho futuro (combinado, não fazer agora)

- **Carregamento sob demanda** (`React.lazy`): hoje o site sai em 2 arquivos JS (~860 KB, ~200 KB gzip) e todo projeto baixa as páginas de todos os estados. Dividir por estado e por página de medida/documento (o registro `estados/registro.js` passa a apontar para o carregamento da página), além da landing e do Paged.js. Medir antes/depois.
- **Números de norma ainda no código → Supabase**: nota 5 da brigada (grupos de 20/15/10), "80% da população", faixas de carga da RTI (300/800/1200 MJ/m²), distância entre pontos de luz = 4 × altura.
- **Textos do formulário da PB → `memorial_formulario`**: rótulos das linhas, atestos e tipos de hidrante — atualizar o modelo do CBMPB sem deploy. As regras de decisão continuam no código (com teste); código das medidas NÃO vai para o banco (segurança e testes).
