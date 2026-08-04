import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

const getThemeFromBody = (): Theme =>
    document.body.classList.contains("dark") ? "dark" : "light"

const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme)
}

export const useTheme = (): { theme: Theme } => {
    const [theme, setTheme] = useState<Theme>("light")

    useEffect(() => {
        const initial = getThemeFromBody()
        applyTheme(initial)
        setTheme(initial)

        const observer = new MutationObserver(() => {
            const next = getThemeFromBody()
            applyTheme(next)
            setTheme(next)
        })

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        })

        return () => observer.disconnect()
    }, [])

    return { theme }
}
