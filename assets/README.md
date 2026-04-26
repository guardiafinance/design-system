# Guardia Design System — Assets

Arquivos estáticos da marca Guardia referenciados pelo pacote, pelo site
de docs em `docs/` e por apps host que queiram reusar a mesma identidade.

## Estrutura

```
assets/
└── logo/
    ├── guardia-logo-*.svg      ← isotipo (escudo isolado)
    └── guardia-logotipo-*.svg  ← logotipo (escudo + wordmark)
```

## Fontes

Não ficam em `assets/`. O design system usa:

- **Poppins** — UI primária. Carregada **via Google Fonts CDN** em
  `ui_kit/styles/index.css`. Não é self-hosted nem distribuída pelo pacote.
- **Roboto** — família secundária (uso em tabelas densas, copy técnica etc).
  Também via **Google Fonts CDN**, exposta pelo token `--font-secondary`.
- **Lastica** — display da marca. **É uma fonte paga**; usamos uma versão
  free apenas para ilustrar a identidade do logotipo nas páginas de
  branding. Fica em `docs/public/fonts/Lastica.ttf` e é consumida
  exclusivamente pelo site de docs — **nunca é redistribuída pelo pacote**.

## Logos

Todos os SVGs são fundo-transparente, otimizados. Convenção de nome:

- `guardia-logo-*` — marca isolada (favicons, espaços compactos)
- `guardia-logotipo-*` — escudo + wordmark (lockup principal)

Variantes de cor:
- `-orange-and-purple` / `-purple-and-orange` — lockup bicolor
- `-orange-transparent` / `-purple-transparent` — cor sólida única
- `-orange-rounded` / `-purple-rounded` — com badge arredondado
- `-mono-black` / `-mono-white` — monocromático (print, overlays, dark mode)
