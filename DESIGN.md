---
name: FireUtils
description: Engenharia de incêndio conectada do modelo à documentação.
colors:
  brand-primary: "#EA1330"
  app-action: "#C0152A"
  background: "#0E0F13"
  surface: "#16171D"
  surface-raised: "#1D1E24"
  ink: "#E6E9ED"
  ink-muted: "rgba(255,255,255,.70)"
  line: "rgba(255,255,255,.11)"
  success: "#1D9E75"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5.75rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(1.7rem, 2.4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: ".75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  panel: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "16px 18px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "54px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "clamp(34px, 4vw, 54px)"
---

# Design System: FireUtils

## Overview

**Creative North Star: "Conexão Técnica"**

O FireUtils transforma a precisão de um ambiente de projeto em uma interface digital clara e contínua. A identidade é escura, concentrada e profissional; o vermelho aparece como sinal de fluxo, seleção ou ação, enquanto linhas finas e superfícies tonais organizam informações densas sem criar ruído.

A experiência deve parecer parte do trabalho de engenharia: títulos firmes, conteúdo escaneável, controles previsíveis e movimento direcional que demonstra continuidade entre Revit, plataforma e documentação.

**Key Characteristics:**

- Campo quase preto com superfícies próximas, separadas por tom e linhas discretas.
- Vermelho usado para conduzir atenção, nunca para preencher a tela.
- Space Grotesk nos títulos e Inter na operação cotidiana.
- Geometria técnica precisa e movimento com propósito.
- Boa leitura e hierarquia preservadas em desktop e mobile.

## Colors

A paleta combina um campo escuro frio com texto claro e um vermelho vivo que funciona como sinal operacional e assinatura da marca.

**The Signal Red Rule.** O vermelho marca ação, estado ativo, risco ou percurso. Elementos secundários permanecem neutros para preservar seu valor de sinal.

**The Tonal Surface Rule.** A profundidade nasce primeiro da diferença entre fundo, superfície e superfície elevada; linhas e sombras entram apenas quando ajudam a separar funções.

## Typography

**Display Font:** Space Grotesk (com sans-serif como fallback)  
**Body Font:** Inter (com sans-serif como fallback)

**Character:** Space Grotesk dá presença técnica aos títulos; Inter mantém formulários, dados e descrições legíveis em alta densidade. Títulos usam peso médio ou semibold e tracking contido, nunca inferior a -0.04em.

### Hierarchy

- **Display:** peso 500, escala fluida e linha compacta para mensagens principais.
- **Title:** peso 600 para títulos de telas, painéis e etapas.
- **Body:** peso 400, linha 1.6–1.7 e medida curta para instruções.
- **Label:** peso 500 para campos, estados e ações auxiliares.

**The Two-Voice Rule.** Space Grotesk comunica estrutura; Inter comunica operação. Monoespaçada fica reservada a dados, medidas e notação técnica.

## Layout

As páginas combinam trilhos estruturais e áreas de trabalho flexíveis. Superfícies públicas podem usar composição editorial ampla; telas operacionais priorizam navegação estável, leitura por colunas e conteúdo central com largura controlada.

O ritmo usa múltiplos de 4 e 8 pixels. Elementos relacionados ficam próximos; mudanças de contexto recebem separação generosa. Em telas estreitas, colunas viram sequência vertical e a ação principal deve permanecer no primeiro viewport sempre que a tarefa permitir.

## Elevation & Depth

O sistema é tonal por padrão. Sombras largas e suaves aparecem apenas em painéis de alta prioridade ou elementos que realmente se elevam; não são combinadas com bordas fortes. Transparência e blur são permitidos quando revelam camadas do ambiente, nunca como decoração isolada.

**The One Separator Rule.** Um contêiner usa contraste tonal, linha ou sombra como separador principal. Evite empilhar os três com a mesma intensidade.

## Shapes

Controles e cartões operacionais usam cantos discretos de 4 a 8 pixels. Painéis de entrada ou apresentação podem chegar a 16 pixels quando precisam se distinguir do ambiente. Linhas são finas, precisas e com baixa opacidade; pílulas ficam restritas a estados e pequenos indicadores.

## Components

### Buttons

- A ação principal usa o vermelho da marca, texto branco, altura confortável e raio de 8 pixels.
- Hover eleva levemente e intensifica a sombra; active retorna ao plano.
- Focus visible usa contorno vermelho com distância suficiente do componente.
- Estados de carregamento preservam o rótulo da ação e mostram progresso sem alterar a largura.

### Cards / Containers

- Superfícies operacionais são tonais, com bordas muito discretas ou sem borda.
- Painéis protagonistas usam raio de até 16 pixels e sombra ambiente com deslocamento vertical.
- Cards não devem virar a estrutura padrão de toda página; conteúdo e tarefa definem os agrupamentos.

### Inputs / Fields

- Campos usam fundo mais escuro que o painel, altura entre 52 e 54 pixels e raio de 8 a 10 pixels.
- Ícones são lineares e consistentes; placeholder e texto auxiliar mantêm contraste mínimo de 4.5:1.
- Foco combina mudança de linha, contorno visível e leve elevação tonal.
- Erro e sucesso usam mensagem textual, ícone e cor; nunca dependem apenas da cor.

### Navigation

- Navegação é direta, com rótulos em português e estado ativo inequívoco.
- No mobile, ações secundárias podem reduzir o texto, mas mantêm nome acessível.

### Technical Flow

O percurso Revit → FireUtils → Memorial é representado por linha geométrica e sinal vermelho móvel. Essa linguagem pode aparecer em transições e explicações de fluxo, desde que represente uma relação real do produto.

## Do's and Don'ts

### Do:

- **Do** usar vermelho para guiar atenção e indicar ação ou estado.
- **Do** manter textos auxiliares com contraste mínimo de 4.5:1.
- **Do** reduzir narrativas no mobile quando elas empurrarem a tarefa principal para baixo da dobra.
- **Do** respeitar `prefers-reduced-motion` em toda animação contínua ou de entrada.
- **Do** usar dados, interfaces e capacidades reais do FireUtils.

### Don't:

- **Don't** transformar toda informação em cartões iguais.
- **Don't** usar brilhos, blur ou gradientes como substitutos para hierarquia.
- **Don't** usar vermelho em grandes massas sem função operacional.
- **Don't** inventar cobertura normativa, clientes, preços ou resultados comerciais.
- **Don't** reduzir tipografia funcional a tamanhos que exijam esforço visual.
