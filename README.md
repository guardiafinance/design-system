[![Build and Test](https://github.com/guardiafinance/design-system/actions/workflows/pull-request.yml/badge.svg)](https://github.com/guardiafinance/design-system/actions/workflows/pull-request.yml)
[![Publish Package](https://github.com/guardiafinance/design-system/actions/workflows/publish.yml/badge.svg)](https://github.com/guardiafinance/design-system/actions/workflows/publish.yml)
[![Deploy Docs](https://github.com/guardiafinance/design-system/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/guardiafinance/design-system/actions/workflows/deploy-docs.yml)

# Guardia Design System

A base de design e código que sustenta todos os produtos Guardia Finance.

- 🎨 **Tokens e componentes** alinhados à marca Guardia (laranja primário, roxo institucional)
- 🧱 **45 componentes** acessíveis construídos sobre [Radix UI](https://www.radix-ui.com/)
- ⚡ **Tailwind CSS 4** (CSS-first `@theme inline`, sem `tailwind.config.ts`)
- 🧪 **Testado** com Vitest + Testing Library (cobertura mínima 70%)
- 📚 **Documentado** com Storybook 8.6 + site Astro
- 🚀 **Empacotado** com Rslib (Rust via Rspack) e publicado no GitHub Packages

## 📦 Instalação

### 1. Autentique no GitHub Packages

Crie um **Personal Access Token** com o scope `read:packages` e configure o `.npmrc`:

```ini
@guardiafinance:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 2. Instale o pacote

```bash
npm install @guardiafinance/design-system
# peer deps
npm install react@^19 react-dom@^19 react-router@^7 zod@^4
```

### 3. Importe os estilos

No arquivo raiz da aplicação:

```ts
import "@guardiafinance/design-system/styles.css";
// Poppins é carregada automaticamente via Google Fonts pelo CSS do pacote.
```

### 4. Use os componentes

```tsx
import { Button, Card, Badge, ThemeProvider } from "@guardiafinance/design-system";

export function App() {
    return (
        <ThemeProvider defaultTheme="light">
            <Card>
                <Card.Header>
                    <Card.Title>Saldo total</Card.Title>
                    <Badge variant="secondary">Real-time</Badge>
                </Card.Header>
                <Card.Content>
                    <Button>Ver transações</Button>
                </Card.Content>
            </Card>
        </ThemeProvider>
    );
}
```

## 🧱 Stack

| Camada                | Tecnologia                                   |
| --------------------- | -------------------------------------------- |
| Framework             | React 19                                     |
| Linguagem             | TypeScript 5.7 (strict)                      |
| Estilos               | Tailwind CSS 4 (CSS-first `@theme inline`)   |
| Primitivos A11y       | Radix UI                                     |
| Variantes             | [class-variance-authority](https://cva.style)|
| Formulários           | react-hook-form + [zod](https://zod.dev)     |
| Gráficos              | [Recharts](https://recharts.org)             |
| Ícones                | [lucide-react](https://lucide.dev) + custom  |
| Build                 | [Rslib](https://lib.rsbuild.dev/) (Rspack)   |
| Testes                | [Vitest](https://vitest.dev) + Testing Library |
| Documentação          | Storybook 8.6 + Astro                        |

## 🎨 Tokens de cor

Duas camadas:

- **Semânticos** (`--primary`, `--background`, `--foreground`, `--destructive`, `--ring`…) — usados pelos componentes. Trocar o tema é reassinar essas variáveis.
- **Marca** (`--brand-orange`, `--brand-purple`, `--ink-*`) — reservados a comunicação e elementos brand.

Ative o dark mode via atributo:

```html
<html data-theme="dark">
```

Ou use `<ThemeToggle />` / `<ThemeProvider />`.

## 🧩 Componentes disponíveis

**Primitivos** — Button · Badge · BadgeSelect · Avatar · Label · Separator · Skeleton · Typography

**Formulários** — Input · Textarea · Select · MultiSelect · Checkbox · RadioGroup · Switch · Toggle · ToggleGroup · InputOTP · Form · Calendar

**Navegação** — Accordion · Breadcrumb · Collapsible · Menubar · Navbar · NavigationMenu · Pagination · Sidebar · Tabs

**Overlays** — Dialog · AlertDialog · Drawer · Sheet · Popover · Tooltip · DropdownMenu · ContextMenu

**Feedback** — Alert · Sonner (Toast)

**Dados** — Chart (Recharts wrappers) · Table (TanStack)

**Conteúdo** — Card · ScrollArea · CustomIcons

👉 Explorar:
- **Docs (Astro)** — [guardiafinance.github.io/design-system](https://guardiafinance.github.io/design-system)
- **Storybook (Chromatic)** — [69e15f3b0534f646ac88774b-cpmytvatdp.chromatic.com](https://69e15f3b0534f646ac88774b-cpmytvatdp.chromatic.com/)
- **Chromatic Library** (visual review) — [chromatic.com/library?appId=69e15f3b0534f646ac88774b](https://www.chromatic.com/library?appId=69e15f3b0534f646ac88774b)

## 🛠 Desenvolvimento

```bash
git clone https://github.com/guardiafinance/design-system.git
cd design-system
npm install

# Build da lib (Rslib)
npm run build
npm run dev                # watch mode

# Storybook
npm run storybook          # → http://localhost:6006
npm run build-storybook

# Testes
npm run test
npm run test:watch
npm run test:coverage

# Lint & format
npm run typecheck
npm run lint
npm run format

# Docs (Astro)
cd docs
npm install
npm run dev                # → http://localhost:4321
npm run build              # → docs/dist
```

### Estrutura do repositório

```
.
├── ui_kit/
│   ├── components/        ← 45 componentes, cada um em sua pasta
│   ├── lib/utils.ts       ← cn() helper
│   ├── styles/index.css   ← Tailwind 4 + tokens
│   ├── theme/             ← ThemeProvider, ThemeToggle
│   └── index.tsx          ← barrel export
├── docs/                  ← site Astro publicado em /design-system/
│   ├── src/pages/
│   └── src/data/components.ts  ← single source of truth dos componentes
├── assets/
│   ├── fonts/             ← Poppins (18 pesos) + Lastica, self-hosted
│   └── logo/              ← isotipos e logotipos em 12 variações
├── .storybook/
├── .github/workflows/
├── rslib.config.ts
├── eslint.config.mjs
├── vitest.config.ts
└── package.json
```

### Adicionar um componente

1. Crie `ui_kit/components/<nome>/index.tsx` + `<Nome>.stories.tsx`.
2. Adicione um teste em `<nome>.test.tsx`.
3. Registre o export em `ui_kit/components/index.ts`.
4. Adicione uma entrada em `docs/src/data/components.ts` — uma página
   `/componentes/<slug>` é gerada automaticamente.

## 🧪 Testes

Rodamos [Vitest](https://vitest.dev) em ambiente jsdom com
[Testing Library](https://testing-library.com). Setup em `vitest.setup.ts`:

```bash
npm run test               # roda tudo uma vez
npm run test:watch         # watch + UI
npm run test:coverage      # coverage report (threshold 70%)
```

## 🚢 Publicação

A publicação é feita pelo workflow `publish.yml`:

1. Bump de versão em um PR.
2. Ao mergear em `master`, o CI publica `@guardiafinance/design-system@x.y.z`
   no GitHub Packages.
3. Chromatic tira snapshots visuais em cada PR.

## 🤝 Contribuição

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) — resumo:

- Branch de feature a partir de `master`.
- `npm run lint && npm run test && npm run typecheck` antes do push.
- PR com descrição, screenshots do Storybook/Chromatic quando pertinente.
- Patches que afetam a API pública precisam de nota no `CHANGELOG.md`.

## 📄 Licença

Propriedade da **Guardia Finance**. Uso interno apenas.
