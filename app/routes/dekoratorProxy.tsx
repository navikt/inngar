import type { Route } from "./+types/dekoratorProxy";
import { loggerServer } from "~/logger";

const target = "http://modiacontextholder.personoversikt";

export async function loader({ request }: Route.LoaderArgs) {
    const newUrl = new URL(request.url);
    newUrl.host = target;

    const newRequest = new Request(newUrl.toString(), new Request(request));
    return await fetch(newRequest);
}

export async function action({ request }: Route.ActionArgs) {
    const newUrl = new URL(request.url);
    newUrl.host = target;

    const newRequest = new Request(newUrl.toString(), new Request(request));
    return await fetch(newRequest);
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs
) {
    if (!request.signal.aborted) {
        loggerServer.error(error)
    }
}