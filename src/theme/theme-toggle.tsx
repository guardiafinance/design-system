import { Moon, Sun } from "lucide-react"
import { Button } from "../components/button"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const handleToggle = () => {
        try {
            setTheme(theme === "light" ? "dark" : "light")
        } catch (error) {
            console.warn('ThemeToggle: Error toggling theme')
        }
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleToggle}
            className="relative"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    )
}
