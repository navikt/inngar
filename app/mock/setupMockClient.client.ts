import { ws } from "msw"
import { setupWorker } from "msw/browser"

console.log("Setting up msw handlers for clientside mocking...")

const server = setupWorker(
    // Denne må mockes client-side, ikke serverside
    ws
        .link("wss://modiacontextholder.ansatt.dev.nav.no/ws/Z994381")
        .addEventListener("connection", () => {
            console.log("Websocket sier Hei")
        }),
)

const mockedBackends = [
    "veilarbdialog",
    "veilarboppfolging",
    "veilarbperson",
    "veilarbportefolje",
    "veilarboppgave",
    "app",
    "root",
    "mock-settings",
    ".woff",
]

await server.start({
    onUnhandledRequest: (request, print) => {
        if (
            mockedBackends.some((backendName) =>
                request.url.includes(backendName),
            )
        ) {
            return
        }
        print.warning()
    },
})

console.log("MSW handlers ready")
