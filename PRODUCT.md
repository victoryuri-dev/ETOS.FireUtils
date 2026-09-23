# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Engenheiros de incêndio e escritórios de projetos que trabalham com Revit e precisam conduzir projetos de prevenção e combate a incêndio entre modelagem, dimensionamento, classificação, medidas de segurança e documentação.

## Product Purpose

O FireUtils conecta o trabalho realizado no Revit a uma plataforma web que organiza os dados técnicos do projeto, apoia o dimensionamento dos sistemas, reúne as medidas de segurança e gera documentação para conferência. O sucesso é permitir que o profissional avance pelo projeto com menos etapas soltas e menos retrabalho.

## Positioning

O produto combina um plugin para Revit com uma plataforma web no mesmo fluxo: o modelo fornece informações técnicas, a plataforma organiza e dimensiona os sistemas e os dados cadastrados alimentam o memorial descritivo.

## Operating Context

O uso acontece durante a elaboração de projetos de segurança contra incêndio. O profissional alterna entre o Revit e a plataforma web, configura a edificação, seleciona medidas de segurança, importa ou revisa dimensionamentos e confere documentos como o memorial descritivo.

O acesso à plataforma é uma tarefa recorrente. A tela de login deve priorizar a entrada rápida de usuários existentes e manter a criação de conta como uma ação secundária disponível.

## Capabilities and Constraints

- Autenticação por e-mail e senha com Supabase.
- Criação de conta por e-mail, com confirmação quando exigida pelo provedor.
- Mensagens de erro e sucesso devem permanecer claras em português.
- O redirecionamento após o login é controlado pela rota e preserva a página de origem.
- A interface precisa funcionar bem em desktop e mobile.
- Não inventar cobertura normativa, preços, clientes ou resultados comerciais ainda não confirmados.

## Brand Commitments

- Nome: FireUtils.
- Cor principal: vermelho `#EA1330`.
- Identidade escura, técnica e precisa, coerente com a landing page e com a interface do produto.
- Preservar o logotipo e a linguagem visual que conecta Revit, engenharia e plataforma web.
- Voz direta, profissional e em português.

## Evidence on Hand

- Logotipos em `src/assets/fireutils-logo.png` e `src/assets/fireutils-landing.svg`.
- Vídeo real do plugin em `src/assets/revit-fireutils.mp4`.
- Landing page e previews do fluxo em `src/pages/LandingPage.jsx` e `src/pages/LandingPage.css`.
- Interface funcional da plataforma nas demais rotas do projeto.
- Não há depoimentos, clientes, preços ou benchmarks aprovados para uso promocional.

## Product Principles

1. Manter o projeto conectado do modelo à documentação.
2. Tornar informações técnicas densas fáceis de localizar e revisar.
3. Reduzir atrito em tarefas recorrentes sem esconder estados ou resultados.
4. Demonstrar o produto com dados e interfaces reais, sem promessas inventadas.
5. Preservar clareza e legibilidade em qualquer tamanho de tela.

## Accessibility & Inclusion

Controles devem ser acessíveis por teclado, possuir rótulos claros, foco visível, contraste suficiente e respeitar `prefers-reduced-motion`.
