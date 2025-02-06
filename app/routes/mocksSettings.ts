import type { Route } from "./+types/mocksSettings"
import { mockSettings } from "~/mock/mockSettings"

export interface MockSettings {
    oppfolgingsEnhet: "Arena" | "Ingen" | "GT_PDL" | "Error" | "UnderOppfolging"
    over18: "Over18" | "Under18"
    aktivBruker: "nei" | "ja"
    registrerArenaSvar:
        | "OK_REGISTRERT_I_ARENA"
        | "FNR_FINNES_IKKE"
        | "KAN_REAKTIVERES_FORENKLET"
        | "BRUKER_ALLEREDE_ARBS"
        | "BRUKER_ALLEREDE_IARBS"
        | "UKJENT_FEIL"
}

export const action = async ({ request }: Route.ActionArgs) => {
    const payload = Object.fromEntries(
        await request.formData(),
    ) as unknown as MockSettings

    mockSettings.oppfolgingsEnhet = payload.oppfolgingsEnhet
    mockSettings.over18 = payload.over18
    mockSettings.aktivBruker = payload.aktivBruker
    mockSettings.registrerArenaSvar = payload.registrerArenaSvar

    return new Response("Ok", { status: 200 })
}
