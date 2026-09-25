# Dashboard do projeto

## Modo e objetivo

**Operate.** Tela de operação para o projetista entender, em poucos segundos, o estado técnico do projeto e a próxima ação necessária. A visão geral deve resumir os dados existentes sem inventar completude ou substituir as telas de configuração, dimensionamento ou documentação.

## Hierarquia

1. Identidade e estado da configuração do projeto.
2. Identificação do projeto com dados administrativos e responsáveis.
3. Resumo técnico em card stack, na visão geral ou filtrado por edificação.
4. Sistemas aplicados alinhados ao resumo e no mesmo recorte da seleção, com estado derivado dos dados persistidos.
5. Acesso à documentação gerada.

## Regras

- Usar vermelho como sinal e ação, não como preenchimento dominante.
- Não exibir progresso falso para sistemas sem uma fonte confiável de conclusão.
- Distinguir sistema obrigatório de opcional habilitado.
- A identificação deve refletir os dados já cadastrados e oferecer acesso direto à configuração para edição.
- Priorizar densidade legível e comparação rápida; evitar uma coleção uniforme de cartões.
- Manter o conteúdo funcional em larguras menores, reorganizando colunas sem esconder dados essenciais.

## Contrato de estado

- O percentual principal mede somente a configuração da base técnica. Ele não representa a conclusão do projeto, dos sistemas ou da documentação.
- Em projetos completos, a configuração considera identificação, edificação, responsável técnico, classificação, carga de incêndio e medidas de segurança. Na modalidade de apenas dimensionamento, identificação e responsável técnico ficam fora desse cálculo.
- Um sistema só pode aparecer como concluído quando houver evidência persistida própria. Dados parciais podem produzir o estado em andamento; na ausência de evidência, o estado permanece “A desenvolver”.
- A identificação apresenta nome, localização, proprietário e responsável pelo uso. Projetos completos também mostram responsável técnico e registro/ART; na modalidade de apenas dimensionamento, esses campos dão lugar à modalidade.
- O Resumo técnico é um card stack posicionado ao lado de Sistemas aplicados. A pilha começa por “Visão geral do projeto” e acrescenta um card para cada edificação cadastrada.
- Cada card apresenta nome da edificação, área construída, quantidade de pavimentos com a altura como informação secundária e risco de incêndio com a carga de incêndio como informação secundária. Na visão geral, área e pavimentos representam os totais do projeto, enquanto altura e carga de incêndio usam os maiores valores encontrados.
- A seleção do card controla o Resumo técnico e a lista Sistemas aplicados. Ao selecionar uma edificação, os campos do card usam os dados vinculados a ela; situação e norma continuam sendo dados do projeto.
- Em “Visão geral”, a lista de sistemas consolida todas as edificações. No recorte de uma edificação, ela mostra somente os sistemas aplicáveis à estrutura selecionada, deriva desse mesmo recorte a indicação de “Obrigatório” ou “Opcional habilitado” e atualiza as contagens de sistemas aplicáveis e obrigatórios. Contagens de lançamentos vinculados a uma estrutura também devem considerar apenas a edificação selecionada.
- A pilha oferece apenas as edificações cadastradas e preserva “Visão geral do projeto” como opção agregada.
- O acesso aos documentos permanece indisponível enquanto não houver qualquer dado técnico do projeto.

## Navegação e adaptação

- Linhas de sistema e chamadas documentais são atalhos para as respectivas telas; a identificação leva à configuração, enquanto a seleção do card muda em conjunto o Resumo técnico e Sistemas aplicados.
- Arraste horizontal, setas anterior/próxima (dentro do próprio card) e as teclas de seta esquerda/direita trocam a seleção. O card ativo recebe foco por teclado e os cartões de fundo ficam ocultos da árvore de acessibilidade.
- A mudança de seleção é anunciada por uma região de status com `aria-live="polite"` e `aria-atomic="true"`, informando o card ativo e a quantidade de sistemas aplicáveis. Os controles mantêm nomes acessíveis e foco visível. O rótulo "Resumo técnico" não aparece como texto visível acima da pilha — a seção mantém o nome acessível via `aria-label`.
- Resumo técnico e Sistemas aplicados ficam lado a lado a partir de 1050 px: a coluna do Resumo técnico tem largura fixa (até 320 px, o essencial pro card) e Sistemas aplicados ocupa o espaço restante, mais folgado. A pilha de cards não carrega painel próprio (borda/fundo), só o card ativo é a superfície visível, com altura natural (o suficiente pra caber nome e as três métricas sem cortar nada, sem esticar pra acompanhar a lista de sistemas). As métricas do card empilham na vertical (nome no topo, as três métricas abaixo) em qualquer largura. A lista de sistemas usa duas colunas.
- A partir de 1050 px para baixo, Resumo técnico e Sistemas aplicados empilham em uma coluna cada, e o Resumo técnico volta a ocupar a largura total.
- Em até 720 px, o menu lateral permanece recolhido em trilho de ícones, as seções seguem em uma coluna e o nome longo do projeto pode truncar no cabeçalho para preservar a conta e o estado de sincronização.
- Em até 720 px, a lista de sistemas volta a uma coluna. Setas de navegação do card oferecem alvos de toque maiores.
- O menu lateral só lista medidas obrigatórias ou opcionais habilitadas, usando a mesma fonte de verdade apresentada no dashboard.
