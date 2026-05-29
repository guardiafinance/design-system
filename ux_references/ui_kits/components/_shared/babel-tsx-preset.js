/**
 * Bootstrap do preset TypeScript para @babel/standalone no navegador.
 * Deve ser carregado IMEDIATAMENTE após babel.min.js e ANTES de qualquer
 * <script type="text/babel">.
 *
 * Por quê: o preset "typescript" nativo do Babel só é aplicado quando o
 * filename termina em .ts/.tsx. Em scripts inline o filename é "Inline
 * Babel script", fazendo o preset ser silenciosamente ignorado (bug
 * conhecido: github.com/babel/babel/issues/17419). Aqui registramos um
 * preset alternativo com { isTSX: true, allExtensions: true } que ignora
 * a extensão e processa qualquer bloco como TSX.
 *
 * Uso no playground:
 *   <script src="…/babel.min.js"></script>
 *   <script src="…/_shared/babel-tsx-preset.js"></script>
 *   <script type="text/babel" data-presets="tsx" src="./Foo.tsx"></script>
 */
(function () {
  if (typeof Babel === "undefined") {
    console.error("[babel-tsx-preset] Babel not loaded. Load @babel/standalone first.");
    return;
  }
  if (Babel.availablePresets.tsx) return; // idempotent
  Babel.registerPreset("tsx", {
    presets: [
      [Babel.availablePresets["typescript"], { isTSX: true, allExtensions: true }],
      [Babel.availablePresets["react"], {}],
    ],
  });
})();
