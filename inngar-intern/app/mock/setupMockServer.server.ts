import { handlers } from "./handlers"
import { setupServer } from "msw/node"

console.log("Setting up msw handlers for serverside mocking...")

const server = setupServer(...handlers)
server.listen({
    onUnhandledRequest: (req, e) => {
        if (req.url.includes(".json")) {
            return
        }
        e.warning()
    },
})

export default { server }

console.log("MSW handlers ready")
