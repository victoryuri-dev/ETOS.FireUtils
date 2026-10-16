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
| **2. Forma de apresentação** | ✅ | Novo: `memorialPB.formaApresentacao` (PCI / PTIOT / PTOTEP). |
| **3.1 Natureza da ocupação** | ✅ | Divisões de todas as estruturas, com os rótulos da NT 04/2023 do banco. Observação livre nova (`obsNatureza`). A-1 não tem linha no formulário: cai na observação. |
| **3.2 Altura (Tipo I–V)** | ✅ | Maior altura entre as estruturas, com a tabela do próprio formulário (até 30 m). |
| **3.3 Área construída** | ✅ | `areaConstruidaTotal`; com várias estruturas, uma linha por estrutura (nome + área). |
| **3.4 Risco e validade** e **3.5 Nível de carga** | ✅ | Maior carga de incêndio do projeto (≤300 / ≤1200 / >1200 MJ/m²). Na PB a carga é por levantamento até a NT 02/2023 ser cadastrada. |
| **3.4.1 Classe de GLP (NBR 15514)** | ✅ | Novo: `memorialPB.glpClasse`, só com o risco especial GLP marcado. |
| **3.6 Estágio da construção** | ✅ | Novo: `memorialPB.estagioConstrucao` + `adaptacoes`. Sem escolha, edificação nova = "ainda será construída". |
| **4. Medidas de proteção** | ✅ | `sistemas[].ativo`. Espuma e resfriamento ainda não existem no app (sempre em branco). |
| **5. Riscos especiais** | ✅ | Lista por estado (`riscosEspeciaisDoEstado`); a PB acrescenta tendas/coberturas inflamáveis, estrutura montada, geradores e sistemas elétricos montados (Etapa 6). |
| **6. Acesso de viatura** | 🔜 | A regra que decide a exigência é outra (20 m até a via / 50 m de caminhamento, NT 14/2023 CBMPB). Faixa de estacionamento (a–h) é nova. Hoje: só o Exigível. |
| **7. Segurança estrutural** | ✅ | Grupo, divisão, classe e TRRF de `trrf_calc`. ⚠️ Usa a tabela de TRRF do MA até a NT 08 da PB ser cadastrada. |
| **8. Compartimentação** | ✅ | Área máxima (a mais restritiva) e elementos marcados na tela de Compartimentação; característica de cada elemento nova (`especificacaoCompart`). ⚠️ Tabela de área máxima do MA até a NT 36 da PB. |
| **9. CMAR** | ✅ | Linha marcada pelo grupo/divisão; observação nova. |
| **10. Saídas de emergência** | ✅ | População e larguras de `se_calc`; distâncias por divisão. Tipo de escada: `memorialPB.tipoEscada` (a PB ainda não tem a tabela de tipos de escada). 4 atestos e observação novos. |
| **11.1 Plano de emergência** | ✅ | Novo: `memorialPB.planoModelo` (item 6 / Anexo B da NT 13/2023) + observação. |
| **12. Brigada** | ✅ | Quantidade, divisão, risco e nível de `brigada_calc` (⚠️ Tabela A.1 do MA até a NT 17/2024 da PB). Carga horária e intervalo entre simulados manuais (sem tabela da NT 17 ainda); 2 atestos. |
| **13. Iluminação** | 🔜 | Hoje só o tipo de sistema (bloco / central à bateria / gerador). Falta o tipo **UPS**, a altura de instalação e os ~40 atestos (13.1 a 13.4). |
| **14. Alarme e detecção** | ✅ | Local da central (`centralLocal`); raio e altura dos detectores do tipo adotado (limites da norma usados no dimensionamento). Itens 14.1 viraram atestos. |
| **15. Sinalização** | 🔜 | Atestos e placas M-1/M-2 (dá para tirar do quantitativo). |
| **16. Extintores** | ✅ | Linha pelo nível de carga; nível III com escolha do RT (`extintorNivelIII`); linhas especiais pelos riscos (G-3, GLP, central de gás, fogos). |
| **17. Hidrantes** | 🔜 | Tipos 1–5 da NT 15/2016 PB, vazão/pressão do Revit, RTI, NSTH, lances e tipo de mangueira, atestos da bomba. Hoje: só o Exigível. |
| **18. Chuveiros automáticos (SPK)** | 🔜 | Não há tela no app. Hoje: só o Exigível. |
| **19. SPDA** | 🔜 | Sem regra de exigência no app (análise de risco NBR 5419): "Exigível" só quando o RT adota. |
| **20. Isolamento de risco (NT 20/2023)** | 🔜 | Novo, por par de edificações. Hoje: em branco. |
| **Anexos A–D / assinatura** | ✅ | A = texto de Saídas do memorial do MA (quando ativa); B = Hidrantes + memorial de cálculo (quando ativo); C e D só a orientação do formulário. Assinatura com nome, graduação (`rtEspecialidade`) e CREA/CAU. |

## Normas da PB que ainda faltam cadastrar

Classificação e exigências da NT 04/2023 já estão no Supabase. A PB fica liberada para projeto completo também pelo formulário do código (`memorial_formulario`), mesmo que a linha `medidas_seguranca` não seja encontrada — nesse caso o memorial avisa no topo do documento. Faltam:

1. **NT 02/2023**: carga de incêndio por CNAE (`carga_incendio`).
2. **NT 08** (TRRF), **NT 36** (compartimentação), **NT 17/2024** (brigada, inclusive carga horária), **NT 14/2023** (acesso de viatura), **NT 15/2016** (hidrantes), **NT 12/2025** (tipos de escada, Anexo C).

Enquanto não entram, as seções 7, 8 e 12 usam as tabelas do Maranhão (mesma base IT/CBPMESP).

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
