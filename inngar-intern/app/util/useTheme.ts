import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

const VISITTKORT_THEME_SELECTOR = ".aksel-theme.dark"
const VISITTKORT_PRESENT_SELECTOR = ".aksel-theme"

const getThemeFromVisittkort = (): Theme | null => {
    const visittkort = document.querySelector("ao-visittkort")

    const shadowRoot = visittkort?.shadowRoot
    if (!shadowRoot) return null

    if (shadowRoot.querySelector(VISITTKORT_THEME_SELECTOR)) {
        return "dark"
    }

    if (shadowRoot.querySelector(VISITTKORT_PRESENT_SELECTOR)) {
        return "light"
    }

    return null
}

const getThemeFromDom = (): Theme => {
    const visittkortTheme = getThemeFromVisittkort()
    if (visittkortTheme) return visittkortTheme

    const htmlTheme = document.documentElement.getAttribute("data-theme")
    if (htmlTheme === "dark" || htmlTheme === "light") return htmlTheme

    return "light"
}

const applyTheme = (theme: Theme) => {
    if (document.documentElement.getAttribute("data-theme") !== theme) {
        document.documentElement.setAttribute("data-theme", theme)
    }
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
        const visittkortObserver = new MutationObserver(updateThemeFromDom)

        let observedShadowRoot: ShadowRoot | null = null

        const observeVisittkort = () => {
            const visittkort = document.querySelector("ao-visittkort")
            const shadowRoot = visittkort?.shadowRoot ?? null

            if (shadowRoot && shadowRoot !== observedShadowRoot) {
                visittkortObserver.disconnect()
                visittkortObserver.observe(shadowRoot, {
                    subtree: true,
                    childList: true,
                    attributes: true,
                    attributeFilter: ["class"],
                })
                observedShadowRoot = shadowRoot
                updateThemeFromDom()
                return
            }
        }

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        })

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
