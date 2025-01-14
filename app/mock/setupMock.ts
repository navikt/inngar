import {setupServer} from "msw/node";
import {handlers} from "~/mock/handlers";

console.log("Setting up msw handlers...")

const server = setupServer(
    ...handlers
)
server.listen({
    onUnhandledRequest: (err, e) => {
        console.error("Error", err)
    }
})

console.log("MSW handlers ready")