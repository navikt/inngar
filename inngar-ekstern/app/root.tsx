import { isRouteErrorResponse, Links, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router"
import type { Route } from "./+types/root"
import "./app.css"
import { type DecoratorComponentsReact, fetchDecoratorReact } from "@navikt/nav-dekoratoren-moduler/ssr"
import "@navikt/ds-css"

export const loader = async () => {
  const decorator = await fetchDecoratorReact({
    env: "dev", // Change to "prod" for production
    params: {
      context: "privatperson",
      language: "nb",
      chatbot: false,
    },
  });

  return { decorator };
};

// export const clientLoader = (serverLoader) => {
//   console.log("Client loader")
//   return
// }

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
];

export async function Layout({ children }: { children: React.ReactNode }) {
  const { decorator } = useLoaderData<typeof loader>();
  const { Scripts: DecoratorScripts, Header, Footer, HeadAssets } = decorator as unknown as DecoratorComponentsReact;

  if (!Header) {
    return <div>Ingen header i client</div>
  }

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadAssets />
        <Links />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
        <DecoratorScripts />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
