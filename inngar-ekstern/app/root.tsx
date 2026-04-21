import {
  isRouteErrorResponse,
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router"
import type { Route } from "./+types/root"
import "./app.css"
// @ts-ignore
import "@navikt/ds-css"
import { MockSettingsFormEkstern } from "~/mock/MockSettingsFormEkstern"
import { mockSettings } from "~/mock/mockSettings"
import { fetchDecoratorHtml } from "@navikt/nav-dekoratoren-moduler/ssr"
import { LocalAlert } from "@navikt/ds-react"
import { loadUmami, loggBesok } from "common"
import { useEffect } from "react"

function parseDecoratorLinks(html: string) {
  const links: Record<string, string>[] = []
  const tagRegex = /<link\s+([^>]*?)\/?>/gi
  let tagMatch
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const attrs: Record<string, string> = {}
    const attrRegex = /([\w-]+)="([^"]*)"/g
    let attrMatch
    while ((attrMatch = attrRegex.exec(tagMatch[1])) !== null) {
      const key = attrMatch[1] === "crossorigin" ? "crossOrigin" : attrMatch[1]
      attrs[key] = attrMatch[2]
    }
    links.push(attrs)
  }
  return links
}

export const loader = async () => {
  const decorator = await fetchDecoratorHtml({
    env: "dev", // Change to "prod" for production
    params: {
      context: "privatperson",
      language: "nb",
      chatbot: false,
    },
  })
  let other = {}
  if (import.meta.env.DEV) {
    other = { mockSettings: mockSettings }
  }

  return { decorator, ...other }
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData("root")
  const decorator = loaderData?.decorator
  const headLinks = decorator
    ? parseDecoratorLinks(decorator.DECORATOR_HEAD_ASSETS)
    : []

  useEffect(() => {
    loadUmami()
      .then(() => {
        loggBesok()
      })
      .catch((e) => {
        console.warn("Kunne ikke laste Umami-scriptet:", e)
      })
  }, [])

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {headLinks.map((attrs, i) => (
          <link key={i} {...attrs} />
        ))}
        <Links />
      </head>
      <body>
        {decorator && (
          <div
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: decorator.DECORATOR_HEADER }}
          />
        )}
        {children}
        {decorator && (
          <div
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: decorator.DECORATOR_FOOTER }}
          />
        )}
        {decorator && (
          <div
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: decorator.DECORATOR_SCRIPTS }}
          />
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  if (import.meta.env.DEV) {
    return (
      <>
        <Outlet />
        <MockSettingsFormEkstern
          mockSettings={(loaderData as any).mockSettings}
        />
      </>
    )
  }
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container flex flex-col items-center mx-auto">
      <LocalAlert status="error" className="max-w-paragraph-width">
        <LocalAlert.Header>
          <LocalAlert.Title>{message}</LocalAlert.Title>
        </LocalAlert.Header>
        <LocalAlert.Content>{details}</LocalAlert.Content>
      </LocalAlert>

      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
