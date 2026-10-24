import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

const VISITTKORT_THEME_SELECTOR = ".aksel-theme.dark"
const VISITTKORT_PRESENT_SELECTOR = ".aksel-theme"
const THEME_OVERRIDE_ATTRIBUTE = "data-theme-override"

const isTheme = (value: string | null): value is Theme => {
    return value === "dark" || value === "light"
}

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
    const themeOverride = document.documentElement.getAttribute(
        THEME_OVERRIDE_ATTRIBUTE,
    )
    if (isTheme(themeOverride)) return themeOverride

    const visittkortTheme = getThemeFromVisittkort()
    if (visittkortTheme) return visittkortTheme

    const htmlTheme = document.documentElement.getAttribute("data-theme")
    if (isTheme(htmlTheme)) return htmlTheme

    return "light"
}

const applyTheme = (theme: Theme) => {
    if (document.documentElement.getAttribute("data-theme") !== theme) {
        document.documentElement.setAttribute("data-theme", theme)
    }
}

export const setThemeOverride = (theme: Theme) => {
    document.documentElement.setAttribute(THEME_OVERRIDE_ATTRIBUTE, theme)
    applyTheme(theme)
}

export const clearThemeOverride = () => {
    document.documentElement.removeAttribute(THEME_OVERRIDE_ATTRIBUTE)
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
            attributeFilter: ["data-theme", THEME_OVERRIDE_ATTRIBUTE],
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
