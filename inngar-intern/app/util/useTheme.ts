import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

const getThemeFromDom = (): Theme => {
    if (document.body.classList.contains("dark")) return "dark"
    if (document.documentElement.classList.contains("dark")) return "dark"

    const bodyTheme = document.body.getAttribute("data-theme")
    if (bodyTheme === "dark") return "dark"

    const visittkort = document.querySelector("ao-visittkort")
    const visittkortTheme =
        visittkort?.getAttribute("data-theme") ??
        visittkort?.getAttribute("theme") ??
        visittkort?.getAttribute("color-scheme")
    if (visittkortTheme === "dark") return "dark"

    if (bodyTheme === "light") return "light"

    const htmlTheme = document.documentElement.getAttribute("data-theme")
    if (htmlTheme === "dark" || htmlTheme === "light") return htmlTheme

    return "light"
}

const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme)
}

export const useTheme = (): { theme: Theme } => {
    const [theme, setTheme] = useState<Theme>("light")

    useEffect(() => {
        const initial = getThemeFromDom()
        applyTheme(initial)
        setTheme(initial)

        const updateThemeFromDom = () => {
            const next = getThemeFromDom()
            applyTheme(next)
            setTheme(next)
        }

        const observer = new MutationObserver(updateThemeFromDom)

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        })

        const visittkortObserver = new MutationObserver(updateThemeFromDom)
        const observeVisittkort = () => {
            const visittkort = document.querySelector("ao-visittkort")
            if (visittkort) {
                visittkortObserver.observe(visittkort, {
                    attributes: true,
                    attributeFilter: [
                        "class",
                        "data-theme",
                        "theme",
                        "color-scheme",
                    ],
                })
            }
        }

        observeVisittkort()
        const delayedObserve = window.setTimeout(observeVisittkort, 0)

        return () => {
            observer.disconnect()
            visittkortObserver.disconnect()
            window.clearTimeout(delayedObserve)
        }
    }, [])

    return { theme }
}
