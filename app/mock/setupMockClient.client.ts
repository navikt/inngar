import {ws} from "msw";
import {setupWorker} from "msw/browser";

console.log("Setting up msw handlers...")

const server = setupWorker(
    // Denne må mockes client-side, ikke serverside
    ws.link('wss://modiacontextholder.ansatt.dev.nav.no/ws/Z994381').addEventListener('connection', () => {
        console.log("Websocket sier Hei")
    }),
)

server.start()

console.log("MSW handlers ready")