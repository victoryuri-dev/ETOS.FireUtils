# ETOS Fire Utils — Guia de Arquitetura React

## Estrutura de pastas

```
src/
├── data/
│   └── divisoes.js          ← FONTE DE VERDADE normativa
├── context/
│   └── ProjetoContext.jsx   ← Estado global + todas as actions
├── hooks/
│   └── useWizard.js         ← Logica de navegacao entre etapas
├── components/
│   ├── layout/              ← Estrutura visual (Header, Sidebar, StepsNav)
│   ├── steps/               ← Uma pasta por etapa do wizard
│   └── ui/                  ← Componentes atomicos (Icon, Button...)
└── pages/
    └── ConfiguracaoPage.jsx ← Monta o wizard completo
```

---

## Regra 1 — Dados normativos ficam em `data/divisoes.js`

Nunca escreva um CNAE, carga ou label de divisao diretamente num componente.
Importe sempre de `divisoes.js`:

```js
import { divLabel, divCNAE, divCarga, getCargaLabel } from '../data/divisoes'
```

Para adicionar uma divisao nova:
```js
// Em DIV_DATA, adicione:
'J-1': { label: 'J-1 — Nova divisao', cnae: '1234-5/67', carga: 500 },

// Em GRUPOS, adicione o grupo (se novo):
{ letra: 'J', nome: 'Novo grupo', divisoes: ['J-1'] },
```

---

## Regra 2 — Estado global fica no Context + Reducer

Nunca use `useState` para dados que mais de um componente precisa ver.
O fluxo e sempre:

```
Evento (click/input)
    ↓
dispatch({ type: 'NOME_DA_ACTION', ...payload })
    ↓
reducer(state, action) → novo state
    ↓
React re-renderiza os componentes que usam esse dado
```

### Como ler o estado em qualquer componente:
```jsx
const { state, dispatch } = useProjeto()
// state.nome, state.pavimentos, state.cargaState, etc.
```

### Como atualizar um campo simples:
```jsx
dispatch({ type: 'SET_FIELD', field: 'nome', value: 'Meu Projeto' })
```

### Como adicionar uma nova action:
Em `ProjetoContext.jsx`, adicione um `case` no reducer:
```js
case 'MINHA_ACTION':
  return { ...state, meuCampo: action.payload }
```

---

## Regra 3 — Cada etapa e um componente isolado

Cada `Step*.jsx` recebe o estado via `useProjeto()` e nao tem props.
Isso significa que voce pode reordenar, remover ou adicionar etapas
sem quebrar nada — basta atualizar `STEPS_CONFIG` e `STEP_COMPONENTS`
em `ConfiguracaoPage.jsx`.

### Como adicionar uma nova etapa:
```
1. Crie src/components/steps/Step9MinhaEtapa.jsx
2. Em ConfiguracaoPage.jsx:
   - Importe o componente
   - Adicione entrada em STEPS_CONFIG: { label: 'Minha Etapa', sub: 'Descricao' }
   - Adicione em STEP_COMPONENTS: { 9: Step9MinhaEtapa }
3. Atualize useWizard(9) para o novo total
```

---

## Regra 4 — CSS Module por componente de layout

Componentes de layout (Header, Sidebar, StepsNav) tem seu proprio `.module.css`.
Componentes de etapa compartilham `Steps.module.css`.
Estilos globais e tokens ficam em `index.css`.

Nunca use estilos inline para cores — use sempre as variaveis CSS:
```css
/* BOM */
color: var(--red);
background: var(--surface-2);

/* RUIM */
color: #C0152A;
background: #161618;
```

---

## Regra 5 — Logica reutilizavel vira custom hook

Se voce precisar da mesma logica em dois componentes, extraia para `hooks/`.

```js
// hooks/useGeomAlerts.js
export function useGeomAlerts(altura, area, subsolos) {
  // retorna array de alertas baseado nos valores
  return alerts
}
```

---

## Como adicionar uma nova pagina (ex: dimensionamento de hidrantes)

```
1. Crie src/pages/HidrantesPage.jsx
2. Instale react-router-dom: npm install react-router-dom
3. Em App.jsx, configure as rotas:
   <BrowserRouter>
     <Routes>
       <Route path="/" element={<ConfiguracaoPage/>}/>
       <Route path="/hidrantes" element={<HidrantesPage/>}/>
     </Routes>
   </BrowserRouter>
4. O estado do ProjetoContext esta disponivel em qualquer pagina
   desde que ela esteja dentro de <ProjetoProvider>
```

---

## Como fazer deploy no Vercel

```bash
# 1. Suba o projeto para o GitHub
git init && git add . && git commit -m "feat: initial react migration"
git remote add origin https://github.com/seu-usuario/etos-fire-utils.git
git push -u origin main

# 2. No vercel.com:
#    - New Project → Import from GitHub
#    - Framework: Vite (detectado automaticamente)
#    - Build Command: npm run build
#    - Output Directory: dist
#    - Clique Deploy
```

---

## Como adicionar banco de dados (Supabase)

```bash
npm install @supabase/supabase-js
```

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Para salvar um projeto:
await supabase.from('projetos').insert({ dados: state, user_id: user.id })

// Para carregar:
const { data } = await supabase.from('projetos').select('*').eq('user_id', user.id)
```

Crie um arquivo `.env` na raiz com as chaves do seu projeto Supabase:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```
