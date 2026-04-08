import type { Route } from "./+types/home"
import { startOppfolging } from "~/api/veilarboppfolging"
import { apps } from "common"
import { getOboToken } from "common/server"
import { StartOppfolgingEksternForm } from "~/startOppfolging/StartOppfolgingEksternForm"

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ]
}

export default function Home() {
    return <StartOppfolgingEksternForm />
}

export const action = async (args: Route.ActionArgs) => {
    const tokenOrResponse = await getOboToken(
        args.request,
        apps.veilarboppfolging,
    )
    if (tokenOrResponse.ok == true) {
        return startOppfolging(tokenOrResponse.token)
    } else {
        throw Error(
            "Klarte ikke start oppfølging (klarte ikke veksle inn obo-token)",
        )
    }
}
