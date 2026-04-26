# Brand & Design System Guardia — Fonte de verdade

Documento de referência para **todo** agente que mexer em componentes, estilos
ou copy do design system. Compilado a partir das páginas-spec em
`wip/preview/` (branding, tokens, colors-*, type-*, spacing-*, iconography*,
ai-first, personas, components-react).

Qualquer decisão que contradiga este arquivo precisa ser discutida antes de
virar código.

---

## 1. Identidade visual

**Tagline:** "Tempo para focar no que importa"

**Três pilares visuais:**
1. **Símbolo G** — proteção + transparência (geométrico, modular)
2. **Três blocos** — referência a seta/direção + linguagem visual estilo Tetris
3. **Paleta dupla** — Violeta (autoridade, profundidade) + Laranja (energia, ação)

**Personalidade (5 traços):**
1. Confiante · Respeitoso (nunca condescendente)
2. Próximo · Profissional
3. Preciso · Humano
4. Ambicioso · Viável (vende transformação, sem falsas promessas)
5. Discreto no processo · Alto nos resultados

**Voz (4 fundamentos):** Direto · Estratégico · Afirmativo · Claro.

**Frases proibidas:** "Substituir contadores", "Contabilidade automática",
"Software de contabilidade", afirmações de velocidade pura ("10× mais rápido"),
"inovação pela inovação".

---

## 2. Paleta de cores

### 2.1 Cores de marca (rampas 100/200/500/700/900)

| Cor    | Significado                   | 100     | 200     | 500 ⭐   | 700     | 900     |
| ------ | ----------------------------- | ------- | ------- | ------- | ------- | ------- |
| Yellow | Confiança e transparência     | #FFF3CE | #FFE490 | #FFC30A | #B28807 | #664E04 |
| Orange | Eficiência e agilidade        | #F8E3CC | #F1C08C | #E07400 | #9C5100 | #592E00 |
| Pink   | Acolhimento e inclusão        | #F7DFE6 | #EEB8C8 | #DB6286 | #99445D | #572735 |
| Violet | Profundidade e excelência     | #DBD0E1 | #AF97BD | #4F186D | #37104C | #1F092B |
| Gray   | Estabilidade e integridade    | #D7D7D9 | #A6A6AA | #3A3A44 | #28282F | #17171B |

Tokens CSS: `--guardia-<cor>-<tom>` (ex: `--guardia-orange-500`).
Utilitárias Tailwind: `bg-guardia-orange-500`, `text-guardia-violet-700`, etc.

### 2.2 Mono

| Token          | Hex     | Uso                           |
| -------------- | ------- | ----------------------------- |
| `--mono-white` | #FDFDFD | Superfícies, plots, fundos    |
| `--mono-black` | #0E1016 | Texto e eixos de alto contraste |

### 2.3 Signal (Lighthouse) — **exclusivas para data-viz**

Nunca use para UI chrome (botões, banners, etc). Para estados semânticos da UI,
prefira os tokens `--success`, `--warning`, `--danger`, `--info`.

| Token             | Hex     | Uso              |
| ----------------- | ------- | ---------------- |
| `--signal-green`  | #00BF63 | Positivo, saúde  |
| `--signal-yellow` | #FFDE59 | Atenção          |
| `--signal-red`    | #FF3131 | Negativo crítico |
| `--signal-blue`   | #004AAD | Informativo      |

### 2.4 Tokens semânticos

Dois vocabulários coexistem. Use o Guardia em UI nova; o shadcn-compat é o que
os 45 componentes herdados já consomem.

**Guardia-native (preferível):**

| Token             | Mapeia para                | Uso                                   |
| ----------------- | -------------------------- | ------------------------------------- |
| `--bg`            | mono-white / violet-900    | Fundo da página                       |
| `--bg-subtle`     | #F7F5F9                    | Fundos com viés violeta               |
| `--surface`       | #fff / violet-700          | Superfície de card/panel              |
| `--fg`            | violet-500 / violet-100    | Texto primário                        |
| `--fg-muted`      | gray-500 / violet-200      | Texto secundário                      |
| `--fg-subtle`     | gray-200                   | Texto terciário                       |
| `--border-guardia`| #E7E3EC / violet-700       | Borda padrão                          |
| `--border-strong` | violet-200 / violet-500    | Borda destacada                       |
| `--ring-guardia`  | orange-500                 | Anel de foco                          |
| `--link`          | violet-700 / orange-500    | Link padrão                           |
| `--link-hover`    | orange-500 / orange-200    | Link hover                            |
| `--action`        | violet-500 / orange-500    | Ação primária (autoridade)            |
| `--action-hover`  | violet-700                 | Ação primária hover                   |
| `--accent-brand`  | orange-500 / violet-100    | CTA / destaque                        |
| `--accent-brand-hover` | orange-700            | CTA hover                             |
| `--success` + `--success-soft` | signal-green + #D6F5E6 | Estado positivo            |
| `--warning` + `--warning-soft` | signal-yellow + #FFF3CE | Estado de atenção         |
| `--danger` + `--danger-soft`   | signal-red + #FFE0E0 | Estado de erro               |
| `--info` + `--info-soft`       | signal-blue + #D9E3F7 | Estado informativo          |

**shadcn-compat (usado pelos componentes atuais):**

| Token           | Equivalência Guardia            |
| --------------- | ------------------------------- |
| `--primary`     | accent-brand (laranja)          |
| `--secondary`   | action (violeta)                |
| `--destructive` | danger (signal-red)             |
| `--muted`       | bg-subtle                       |
| `--accent`      | accent-brand (alias do primary) |
| `--border`      | border-guardia                  |
| `--ring`        | ring-guardia (laranja)          |

### 2.5 Política de contraste — AA por padrão, AAA opt-in

**O DS atende WCAG 2.1 AA em todas as combinações documentadas.** AAA
(contraste ≥ 7:1) é atendido onde a combinação de tokens alcança esse patamar
naturalmente — listado explicitamente abaixo.

**Quando AAA é exigido** (texto corrido crítico, formulários de compliance),
escolha combinações AAA:

- `text-foreground` sobre `bg-background` → 11.24:1 (AAA)
- `bg-guardia-violet-500 text-white` → 7.85:1 (AAA) — Button `variant="secondary"`
- `bg-guardia-orange-700 text-white` → 7.5:1 (AAA)
- `bg-signal-yellow text-guardia-violet-900` → 13:1 (AAA) — Badge `warning solid`

**Tokens que NÃO atingem AAA** (atendem AA para texto grande ≥ 18pt ou ≥ 14pt bold):

| Combinação | Ratio | Usado em |
| ---------- | ----- | -------- |
| `bg-primary` (orange-500) + `text-white` | 3.15:1 | Button `variant="default"`, Badge `appearance="solid" variant="accent"` |
| `bg-guardia-pink-500` + `text-white` | 3.44:1 | Avatar fallback `color="pink"` |
| `bg-primary` + `text-secondary` (orange + violet) | 3.96:1 | — |

→ Para AAA em botões de texto pequeno, use `variant="secondary"` (violeta) ou aumente o size (`lg`).

**Comportamentos AAA atendidos automaticamente:**

- `prefers-reduced-motion` respeitado (spinner do Button, transições)
- Foco visível com contraste ≥ 3:1 (anel laranja sobre violet-900)
- Navegação completa por teclado (Radix + primitivos próprios)
- `aria-label`, `aria-busy`, `role` setados onde aplicável
- `size="icon"` do Button dispara warning em dev se faltar `aria-label`
- `AvatarImage` cai para `AvatarFallback` automaticamente se o `src` quebra
- `initials()` normaliza acentos (NFD) para evitar glifos faltantes

### 2.6 Regras de contraste — referência

**Aprovados AAA:**
- Yellow-500 + Black → 13.06:1
- Gray-500 + White → 11.24:1
- Violet-500 + Violet-100 → 7.85:1
- Yellow-100 + Violet-700 → ≥7:1
- Orange-700 + White → 7.5:1

**Aprovados AA:**
- Pink-500 + Black → 6.10:1

**Só texto grande (18pt+ ou 14pt+ bold):**
- Orange-500 + Violet-500 → 3.96:1
- Pink-500 + White → 3.44:1
- Orange-500 + White → 3.15:1

**Proibidos:**
- ❌ Yellow-500 + White (1.61:1) — use Violet-500 ou Gray-500 como texto

---

## 3. Tipografia

### 3.1 Famílias

| Família | Uso                                                     | Origem                 |
| ------- | ------------------------------------------------------- | ---------------------- |
| Lastica | **Exclusiva** para logos, selos, marks oficiais        | Self-hosted (docs)     |
| Poppins | UI, produto, website, copy, documentos                 | Google Fonts CDN       |
| Roboto  | Fallback oficial (emails nativos, ambientes restritos) | Google Fonts CDN       |

**Lastica nunca aparece em UI do pacote.** Se precisar usar em docs (página de
branding ilustrando o logotipo), referenciar o TTF em `docs/public/fonts/`.

Tokens CSS:
- `--font-sans` → Poppins, Roboto, ui-sans-serif
- `--font-secondary` → Roboto, Poppins
- `--font-display` → Lastica, Poppins (só docs/branding)
- `--font-mono` → JetBrains Mono

### 3.2 Escala tipográfica oficial (10 níveis)

| Token          | Size | Weight  | LH   | LS      | Uso                    |
| -------------- | ---- | ------- | ---- | ------- | ---------------------- |
| `text-display` | 56px | 700     | 1.15 | -0.02em | Hero / display         |
| `text-h1`      | 40px | 700/600 | 1.15 | -0.02em | H1 / título primário   |
| `text-h2`      | 32px | 600     | 1.2  | -0.015em| H2 / seção             |
| `text-h3`      | 24px | 600     | 1.3  | -0.01em | H3 / subseção          |
| `text-h4`      | 20px | 500     | 1.35 | 0       | H4 / subdivisão        |
| `text-body-lg` | 18px | 400     | 1.5  | 0       | Body large / lede      |
| `text-body`    | 16px | 400     | 1.5  | 0       | Body padrão            |
| `text-body-sm` | 14px | 400     | 1.5  | 0       | Body apoio             |
| `text-caption` | 12px | 400     | 1.4  | 0       | Caption / metadata     |
| `text-mono`    | 14px | 400     | 1.65 | 0       | Código / tabelas       |

### 3.3 Pesos

100 / 200 / 300 / **400 (regular)** / 500 / **600 (títulos, botões)** / **700 (destaques)** / 800 / 900.

### 3.4 Letter spacing

| Token             | Valor    | Uso                     |
| ----------------- | -------- | ----------------------- |
| `tracking-tight`  | -0.02em  | Títulos grandes         |
| `tracking-snug`   | -0.01em  | Títulos médios          |
| `tracking-normal` | 0        | Body padrão             |
| `tracking-wide`   | 0.02em   | Labels de UI            |
| `tracking-eyebrow`| 0.14em   | Uppercase eyebrows      |

### 3.5 Regras

- Ênfase usa **SemiBold (600) ou itálico** — nunca sublinhado.
- Itálico disponível apenas em Poppins 400 e 500.
- Body corrido nunca abaixo de `text-body-sm` (14px).
- Avisos/legendas nunca abaixo de `text-caption` (12px).
- Evite mais de 3 pesos distintos na mesma tela.

---

## 4. Spacing, radii, shadows

### 4.1 Spacing — base 4px

`0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 px`

Tokens Tailwind 4 nativos (`p-1`, `gap-4`, etc). Regras frequentes:

- Entre ícone e texto → 8px (`gap-2`)
- Entre label e input → 6px (`gap-1.5`)
- Entre campos num form → 16px (`gap-4`)
- Entre seções de página → 40–64px (`gap-10`/`gap-16`)
- Padding-inline container responsivo: 24px mobile → 64px desktop

### 4.2 Radii — Guardia canon

| Token           | Valor   | Uso                                      |
| --------------- | ------- | ---------------------------------------- |
| `rounded-xs`    | 2px     | Chips, tags, code inline                 |
| `rounded-sm`    | 3px     | Checkbox, badge quadrado                 |
| `rounded-md`    | 6px     | Input, button, select (**padrão**)       |
| `rounded-lg`    | 8px     | Card, popover, menu, accordion           |
| `rounded-xl`    | 10px    | Dialog, drawer                           |
| `rounded-2xl`   | 14px    | Containers grandes, empty-state icons    |
| `rounded-full`  | 9999px  | Switch, progress, badge-pill, avatar     |

### 4.3 Shadows — tint violeta (`rgba(47,14,64,α)`)

| Token        | Uso                              |
| ------------ | -------------------------------- |
| `shadow-xs`  | Divisão sutil entre superfícies  |
| `shadow-sm`  | Cards em repouso                 |
| `shadow-md`  | Popovers, menus                  |
| `shadow-lg`  | Dropdowns, tooltips              |
| `shadow-xl`  | Dialog, drawer                   |
| `shadow-brand` | CTA highlight (tint laranja)   |

---

## 5. Motion

| Token               | Valor                         | Uso                            |
| ------------------- | ----------------------------- | ------------------------------ |
| `ease-standard`     | cubic-bezier(0.2, 0, 0, 1)    | Padrão UI                      |
| `ease-emphasis`     | cubic-bezier(0.3, 0, 0, 1)    | Chamadas de atenção            |
| `ease-in`           | cubic-bezier(0.4, 0, 1, 1)    | Saída                          |
| `ease-out`          | cubic-bezier(0, 0, 0.2, 1)    | Entrada                        |
| `duration-instant`  | 80ms                          | Hover, focus                   |
| `duration-fast`     | 160ms                         | Toggle, swap                   |
| `duration-base`     | 220ms                         | Padrão transitions             |
| `duration-slow`     | 320ms                         | Overlays, panels               |
| `duration-slower`   | 480ms                         | Transições de página           |

---

## 6. Iconografia

### 6.1 Biblioteca

- **Lucide** (outline style, ISC license) — `lucide-react` já instalado.
- Grid 24×24px, padding interno 2px.
- Stroke 1.75–2px.
- Cor via `currentColor` — **nunca** inline.
- Estilo outline (nunca filled, exceto em estado active explícito).

### 6.2 Tamanhos em uso

| Tamanho | Contexto                                   |
| ------- | ------------------------------------------ |
| 16px    | UI densa (ações secundárias, listas curtas)|
| 20px    | UI padrão (inputs, botões)                 |
| 24px    | UI primária e site                         |
| 32px    | Seções de site, decks                      |
| 48px    | Hero, posters                              |
| 64px    | Hero headlines, posters                    |

### 6.3 Naming

- Referência: `kebab-case` (ex: `arrow-left-right`)
- Import React: `PascalCase` (ex: `ArrowLeftRight`)
- Mesmo ícone para mesma ação em toda UI.
- Não compor ícones manualmente — use sempre os pre-built da lib.

### 6.4 Grupos

Actions · Navigation · Feedback · Guardia Core (accent orange) · Agent AI
(accent violeta) · Data · Files · Time · Users · Communications · System.

---

## 7. Produto AI-first

O produto é arquitetado como **conversa-first** com um agente (Isac). As
decisões de UI derivam disso.

### 7.1 Sete princípios

1. **Conversa como interface primária** — chat é a superfície principal; telas
   emergem do diálogo, não de navegação.
2. **Intenção > funcionalidade** — usuário declara objetivo, agente decompõe;
   features não são itens de menu.
3. **Transparência do raciocínio** — execução observável em tempo real (plano,
   passos, fontes, decisões). Nada de spinners opacos.
4. **Controle graduado** — autonomia é espectro. Pausar, intervir, corrigir,
   redirecionar sem quebrar a conversa.
5. **Artefatos sob demanda** — tabelas, charts, relatórios aparecem quando
   servem a decisão. Não são menus permanentes.
6. **Auditabilidade nativa** — toda ação versionada (input, contexto, decisão,
   resultado).
7. **Memória estruturada** — contexto é externalizado e recuperado pelo agente,
   não empilhado em estado de tela.

### 7.2 Layout padrão

**Desktop:** duas colunas — esquerda: conversa (chat + input); direita:
workspace (tabelas, charts, forms, aprovações — reativo ao diálogo).

**Mobile:** conversa em cima, workspace embaixo (stack, swipeable).

### 7.3 Padrões **proibidos**

- ❌ Sidebar com lista empilhada de features
- ❌ Modais de formulário antes da conversa (não peça input antes de diálogo)
- ❌ Loaders opacos / spinners genéricos (streame o raciocínio)
- ❌ Dashboards permanentes (dashboards são efêmeros, gerados sob demanda)
- ❌ Orquestração de ferramentas pelo usuário (agente orquestra)
- ❌ Autonomia binária (sem níveis e override)

### 7.4 Implicações para o DS

Priorizar: mensagens de chat legíveis, streamáveis · blocos de plano visíveis ·
traces de execução em tempo real · artefatos inline (não painéis separados) ·
controles de aprovação inline (yes/no/edit) · navegação mínima · streaming de
raciocínio em vez de spinners.

---

## 8. Personas

Todas convergem no eixo: **TEMPO EM OPERAÇÃO** ↔ **TEMPO NO QUE IMPORTA**.

| Persona                                 | Fardo operacional            | O que importa                       |
| --------------------------------------- | ---------------------------- | ----------------------------------- |
| Contador em início de carreira (18–25)  | Execução repetitiva          | Análise, julgamento, assessoria     |
| Contador que quer crescer (30–45)       | Operações de cliente         | BD, service design, time            |
| Contador que quer se aposentar (50+)    | Dependência do fundador      | Negócio independente, saída         |
| Fundador em aceleração                  | Gargalo financeiro           | Produto, vendas, captação           |
| Fundador abarrotado                     | Caos financeiro              | Papel de fundador                   |
| Investidor                              | Distração do fundador        | Execução de empresa, captura        |

Cada mensagem, feature e interação deve quantificar **quanto tempo retorna pro
que importa**.

---

## 9. Convenções de componentes React

Ver `wip/preview/components-react.html` (HTML grande). Padrões principais:

- **Nome:** PascalCase no export, kebab-case no slug de pasta
- **Variants:** `class-variance-authority` (cva), `defaultVariants` sempre
  declarado
- **Props:** tipagem extendendo HTML nativo (`React.InputHTMLAttributes<...>`),
  `forwardRef` para integração com react-hook-form
- **Composição:** sub-componentes com dot-notation (`Card.Header`, `Card.Title`,
  `Card.Content`) quando o componente tem slots
- **Ícones:** via prop `leadingIcon` / `trailingIcon` recebendo `ReactNode`
- **Estados:** `loading`, `disabled`, `invalid`, `state="error|success|default"`
- **Acessibilidade:** foco visível (`focus-visible:ring-2 focus-visible:ring-ring`),
  `aria-invalid` em erros, `aria-describedby` em helper text, `disabled` desliga
  pointer events

---

## 10. Checklist de branding compliance (por PR de componente)

- [ ] Zero cores hardcoded — só tokens Guardia ou shadcn-compat
- [ ] Se usou cor de marca → rampa completa se aplicável (hover mais escuro)
- [ ] Se usou estado semântico → `--success|warning|danger|info` (e
      `*-soft` para fundos)
- [ ] Tipografia via tokens (`text-body`, `text-h3`, etc), não valores absolutos
- [ ] Spacing via escala (4px base), não `px-[13px]`
- [ ] Radii via token (`rounded-md` para controles, `rounded-lg` para cards, etc)
- [ ] Sombras via token (`shadow-sm` / `shadow-md` / ...)
- [ ] Motion via tokens (`duration-base ease-standard` para transições UI)
- [ ] Ícones via `lucide-react`, tamanho de 16/20/24, cor via `currentColor`
- [ ] Light e dark testados no Storybook
- [ ] Contraste AA validado em todas variantes
- [ ] Lastica **não** aparece
- [ ] Signal colors só em contexto de data-viz
