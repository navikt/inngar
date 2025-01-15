import { handlers } from "~/mock/handlers"
import { setupServer } from "msw/node"

console.log("Setting up msw handlers...")

const server = setupServer(...handlers)
server.listen({
    onUnhandledRequest: (err, e) => {
        console.error("Error in mock server", err)
    },
})

console.log("MSW handlers ready")
