/**
 * Flat ESLint config (ESLint 9).
 * Runs against ui_kit/ and .storybook/, ignores dist, docs, wip.
 */
import js from "@eslint/js";
import ts from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default ts.config(
    {
        ignores: [
            "dist/**",
            "docs/**",
            "wip/**",
            "storybook-static/**",
            "coverage/**",
            "node_modules/**",
        ],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        // Arquivos de configuracao em CommonJS (.cjs) — Storybook, PostCSS.
        // Permite require/module/__dirname/process e desliga a regra
        // typescript-eslint que so faz sentido em modulos ESM.
        files: ["**/*.cjs"],
        languageOptions: {
            sourceType: "commonjs",
            globals: { ...globals.node },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    {
        files: ["ui_kit/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "jsx-a11y": jsxA11y,
        },
        settings: {
            react: { version: "detect" },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    prettier,
);
