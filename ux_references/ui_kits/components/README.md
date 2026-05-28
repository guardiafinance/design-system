# Guardia · Components (React + TypeScript)

Kit neutro de 45 componentes React tipados, reutilizáveis entre o Control Center, a plataforma contábil e as landing pages.

> **Consumo em produção**: o target do repo é **Rsbuild** (não Babel). Os playgrounds deste kit usam `@babel/standalone` apenas porque rodam como HTML estático sem servidor. No repo real (`control-center-web`, `plataforma-contabil`), importe cada componente com `import { Button } from "@/components/Button"` e deixe o Rsbuild fazer o bundle; o CSS acompanha via `import "./index.css"` no topo do `index.tsx` ou via `@import` no CSS raiz.

## Estrutura

```
ui_kits/components/
├── _shared/
│   ├── Icon.tsx          ← <Icon name size /> (~80 glifos Lucide-style)
│   └── tokens.ts         ← re-exporta vars do colors_and_type.css como constantes TS
├── Button/
│   ├── Button.tsx
│   ├── Button.css
│   └── Button.playground.html
├── Input/
│   ├── Input.tsx
│   ├── Input.css
│   └── Input.playground.html
└── … (44 total)
```

Cada componente é **independente**: um `.tsx`, um `.css` dedicado e um `playground.html` exibindo todas as variantes.

## Stack técnica

- **React 18.3.1**
- **TypeScript** — no repo real, compilado pelo **Rsbuild**. Nos playgrounds deste kit, `@babel/standalone` (preset `typescript,react`) apenas como workaround de HTML estático.
- **CSS por componente** — isolado por prefixo `grd-<slug>-` (ex.: `grd-btn-*`, `grd-input-*`). Todos os ~500 seletores usam esse prefixo para não colidir com estilos globais do app host.
- **Ícones** — `<Icon />` compartilhado em `_shared/Icon.tsx`

## Como usar num playground / app

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>

<link rel="stylesheet" href="../../colors_and_type.css">
<link rel="stylesheet" href="_shared/shared.css">
<link rel="stylesheet" href="Button/Button.css">

<script type="text/babel" data-presets="typescript,react" src="_shared/Icon.tsx"></script>
<script type="text/babel" data-presets="typescript,react" src="Button/Button.tsx"></script>
```

Cada componente expõe seu default export no `window` *apenas dentro dos playgrounds Babel inline*, que não compartilham escopo. No repo com Rsbuild, você remove essa linha final e usa `export default Button` + `import` normalmente.

## Convenções

1. **Prefixo CSS** `grd-<slug>-` para evitar colisões com classes globais do host (ex.: `grd-btn`, `grd-dlg`, `grd-dt-row`).
2. **Props tipadas**: `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`.
3. **Compound components** quando fizer sentido: `<Tabs>`, `<Tabs.List>`, `<Tabs.Trigger>`, `<Tabs.Content>`.
4. **`displayName`** sempre definido para inspeção no React DevTools.
5. **Tokens via CSS vars** — nunca hex hard-coded; sempre `var(--violet-500)` etc.

## Índice (44 componentes)

**Primitivos (10)** · Button · IconButton · ButtonGroup · Badge · Chip · Avatar · Label · Separator · Spinner · Skeleton

**Forms (10)** · Input · Textarea · Select · Combobox · Checkbox · Radio · Switch · Slider · DatePicker · FileUpload

**Overlays & feedback (9)** · Dialog · Drawer · Popover · Menu · Tooltip · Toast · Alert · EmptyState · ConfidenceIndicator

**Navegação (7)** · Tabs · Breadcrumbs · Pagination · SidebarNav · TopBar · Command · Accordion

**Dados & conteúdo (8)** · Card · MetricCard · DataTable · Chart · Timeline · Progress · AgentCard · ChatMessage · Reconciliation

Cada componente tem um playground em `ui_kits/components/<Nome>/<Nome>.playground.html`.
