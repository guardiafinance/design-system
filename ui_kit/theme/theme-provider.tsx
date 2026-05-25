import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "ui-theme",
    ...props
}: ThemeProviderProps) {
    // WHY: localStorage is read in useEffect (post-mount), never in the useState
    // initializer, so SSR / static prerender (Next.js `output: "export"`, RSC)
    // never touches a browser-only global. First paint shows `defaultTheme`; the
    // persisted value applies after hydration.
    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(storageKey) as Theme | null
            setTheme(stored || defaultTheme)
        } catch {
            // WHY: localStorage can throw under Safari "Block all cookies",
            // strict CSP, or private browsing — fall back to defaultTheme
            // instead of leaving the consumer stuck in an inconsistent state.
            setTheme(defaultTheme)
        }
    }, [storageKey, defaultTheme])

    useEffect(() => {
        const root = window.document.documentElement

        root.removeAttribute("data-theme")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.setAttribute("data-theme", systemTheme)
            return
        }

        root.setAttribute("data-theme", theme)
    }, [theme])

    // WHY: memoized so context consumers do not re-render when the provider's
    // parent re-renders but `theme` is unchanged. The inner setTheme catches
    // QuotaExceededError + private-browsing throws (same rationale as the
    // hydration effect) so the in-memory state still updates even when the
    // persistence write fails.
    const value = useMemo<ThemeProviderState>(
        () => ({
            theme,
            setTheme: (next: Theme) => {
                try {
                    window.localStorage.setItem(storageKey, next)
                } catch {
                    // ignore: storage unavailable; keep in-memory update
                }
                setTheme(next)
            },
        }),
        [theme, storageKey],
    )

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
