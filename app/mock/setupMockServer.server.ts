import { handlers } from "~/mock/handlers"
import { setupServer } from "msw/node"

console.log("Setting up msw handlers...")

const server = setupServer(...handlers)
server.listen({
    onUnhandledRequest: (req, e) => {
        if (req.url.includes(".json")) {
            return
        }
        e.warning()
    },
})

console.log("MSW handlers ready")
