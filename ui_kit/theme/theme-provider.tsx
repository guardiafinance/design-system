import React, { createContext, useContext, useEffect, useState } from "react"

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
        const stored = window.localStorage.getItem(storageKey) as Theme | null
        if (stored) setTheme(stored)
    }, [storageKey])

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

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            window.localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

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
