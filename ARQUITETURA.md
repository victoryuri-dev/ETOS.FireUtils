# 📋 ETOS Fire Utils — Guia de Arquitetura React

> Documentação sobre estrutura, padrões e workflows da aplicação React

## 📑 Índice

1. [Estrutura de Pastas](#estrutura-de-pastas)
2. [5 Regras de Ouro](#5-regras-de-ouro)
3. [Fluxos Comuns](#fluxos-comuns)
4. [Deploying](#deploying)

---

## Estrutura de Pastas

```
src/
├── data/
│   └── divisoes.js              ← ⭐ FONTE DE VERDADE normativa
│
├── context/
│   └── ProjetoContext.jsx       ← 🌍 Estado global + todas as actions
│
├── hooks/
│   └── useWizard.js             ← 🎛️ Lógica de navegação entre etapas
│
├── components/
│   ├── layout/                  ← 🏗️ Estrutura visual (Header, Sidebar, StepsNav)
│   ├── steps/                   ← 📝 Uma pasta por etapa do wizard
│   └── ui/                      ← 🎨 Componentes atômicos (Icon, Button...)
│
└── pages/
    └── ConfiguracaoPage.jsx     ← 🚀 Monta o wizard completo
```

### Significado dos ícones
- **⭐** = Fonte única de verdade
- **🌍** = Compartilhado globalmente
- **🎛️** = Lógica de controle
- **🏗️** = Layout e estrutura
- **📝** = Conteúdo das etapas
- **🎨** = Componentes reutilizáveis
- **🚀** = Ponto de entrada

---

## 5 Regras de Ouro

### ✋ Regra 1 — Dados normativos em `data/divisoes.js`

**Princípio:** Nunca escreva um CNAE, carga ou label diretamente num componente.

**Por que?** Uma única fonte de verdade torna fácil atualizar dados em toda a app.

#### Importar dados normativos
```js
import { divLabel, divCNAE, divCarga, getCargaLabel } from '../data/divisoes'
```

#### Adicionar uma divisão nova

```js
// Em DIV_DATA, adicione:
'J-1': { 
  label: 'J-1 — Nova divisão', 
  cnae: '1234-5/67', 
  carga: 500 
},

// Em GRUPOS, adicione o grupo (se novo):
{ 
  letra: 'J', 
  nome: 'Novo grupo', 
  divisoes: ['J-1'] 
},
```

**Checklist:**
- [ ] Dados estão em `divisoes.js`
- [ ] Importações estão corretas
- [ ] Grupos estão atualizados

---

### 🌍 Regra 2 — Estado global via Context + Reducer

**Princípio:** Nunca use `useState` para dados que mais de um componente precisa ver.

**O fluxo de dados:**

```
┌─────────────────────────────────────────────────────┐
│  Evento (click/input/mudança)                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  dispatch({ type: 'NOME_DA_ACTION', ...payload })   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  reducer(state, action) → novo state                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  React re-renderiza componentes que usam esse dado  │
└─────────────────────────────────────────────────────┘
```

#### Ler o estado em qualquer componente

```jsx
const { state, dispatch } = useProjeto()

// Acessar valores
console.log(state.nome)           // nome do projeto
console.log(state.pavimentos)     // número de pavimentos
console.log(state.cargaState)     // estado da carga
```

#### Atualizar um campo simples

```jsx
dispatch({ 
  type: 'SET_FIELD', 
  field: 'nome', 
  value: 'Meu Projeto' 
})
```

#### Adicionar uma nova action

Em `ProjetoContext.jsx`, adicione um `case` no reducer:

```js
case 'MINHA_ACTION':
  return { 
    ...state, 
    meuCampo: action.payload 
  }
```

---

### 🧩 Regra 3 — Cada etapa é um componente isolado

**Princípio:** Cada `Step*.jsx` recebe estado via `useProjeto()` e **não recebe props**.

**Benefício:** Você pode reordenar, remover ou adicionar etapas sem quebrar nada.

#### Adicionar uma nova etapa

| Passo | O que fazer |
|-------|------------|
| 1️⃣ | Criar arquivo `src/components/steps/Step9MinhaEtapa.jsx` |
| 2️⃣ | Importar em `ConfiguracaoPage.jsx` |
| 3️⃣ | Adicionar em `STEPS_CONFIG`: `{ label: 'Minha Etapa', sub: 'Descrição' }` |
| 4️⃣ | Adicionar em `STEP_COMPONENTS`: `{ 9: Step9MinhaEtapa }` |
| 5️⃣ | Atualizar `useWizard(9)` para o novo total |

---

### 🎨 Regra 4 — CSS Modules e tokens de design

**Princípio:** Cada tipo de componente tem seu estilo organizado.

| Tipo de Componente | Arquivo CSS |
|-------------------|------------|
| **Layout** (Header, Sidebar, StepsNav) | `ComponenteName.module.css` |
| **Etapas** (Step1, Step2, ...) | `Steps.module.css` |
| **Globais** e tokens | `index.css` |

#### Nunca use cores hardcoded

```css
/* ✅ BOM */
color: var(--red);
background: var(--surface-2);
border: 1px solid var(--border);

/* ❌ RUIM */
color: #C0152A;
background: #161618;
border: 1px solid #333;
```

**Variáveis disponíveis:**
- `--red`, `--green`, `--blue` (cores semânticas)
- `--surface-1`, `--surface-2` (planos)
- `--border`, `--text`, `--text-muted` (textos)

---

### 🔧 Regra 5 — Lógica reutilizável vira custom hook

**Princípio:** Se a mesma lógica aparece em 2+ componentes, extraia para `hooks/`.

#### Exemplo: Hook para validações geométricas

```js
// hooks/useGeomAlerts.js
export function useGeomAlerts(altura, area, subsolos) {
  const alerts = []
  
  if (altura > 50) {
    alerts.push({ tipo: 'warning', msg: 'Altura acima do recomendado' })
  }
  
  if (area < 100) {
    alerts.push({ tipo: 'info', msg: 'Área pequena para o tipo de ocupação' })
  }
  
  return alerts
}
```

#### Usar o hook em um componente

```jsx
const StepGeometria = () => {
  const { state } = useProjeto()
  const alerts = useGeomAlerts(state.altura, state.area, state.subsolos)
  
  return (
    <div>
      {alerts.map((a, i) => <Alert key={i} {...a} />)}
    </div>
  )
}
```

---

## Fluxos Comuns

### 📄 Adicionar uma nova página

Exemplo: página de dimensionamento de hidrantes

```bash
# 1. Criar o arquivo da página
touch src/pages/HidrantesPage.jsx
```

```js
// src/pages/HidrantesPage.jsx
import { useProjeto } from '../context/ProjetoContext'

export default function HidrantesPage() {
  const { state, dispatch } = useProjeto()
  
  return (
    <div>
      <h1>Dimensionamento de Hidrantes</h1>
      {/* conteúdo aqui */}
    </div>
  )
}
```

```js
// App.jsx — configurar as rotas
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ConfiguracaoPage from './pages/ConfiguracaoPage'
import HidrantesPage from './pages/HidrantesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConfiguracaoPage />} />
        <Route path="/hidrantes" element={<HidrantesPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Nota:** O estado do `ProjetoContext` está disponível em qualquer página desde que ela esteja dentro de `<ProjetoProvider>`.

---

## Deploying

### 🚀 Deploy no Vercel

```bash
# 1. Suba o projeto para o GitHub
git init
git add .
git commit -m "feat: initial react migration"
git remote add origin https://github.com/seu-usuario/etos-fire-utils.git
git push -u origin main
```

Depois, no [Vercel](https://vercel.com):
1. New Project → Import from GitHub
2. Selecione o repositório
3. Framework: `Vite` (detectado automaticamente)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Clique em **Deploy**

---

### 🗄️ Adicionar banco de dados (Supabase)

#### Instalar cliente Supabase

```bash
npm install @supabase/supabase-js
```

#### Configurar cliente

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

#### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

#### Exemplos de uso

```js
// Salvar um projeto
await supabase
  .from('projetos')
  .insert({ 
    dados: state, 
    user_id: user.id 
  })

// Carregar projetos do usuário
const { data } = await supabase
  .from('projetos')
  .select('*')
  .eq('user_id', user.id)
```

---

## 📚 Referências rápidas

| Necessidade | Padrão | Arquivo |
|------------|--------|---------|
| Adicionar dado normativo | DIV_DATA + GRUPOS | `src/data/divisoes.js` |
| Novo estado global | case no reducer | `src/context/ProjetoContext.jsx` |
| Lógica reutilizável | custom hook | `src/hooks/useXxx.js` |
| Nova etapa do wizard | Step*.jsx | `src/components/steps/` |
| Componente atomico | componente | `src/components/ui/` |

---

*Última atualização: Setembro 2026*
