import { mockSettings } from "../mock/mockSettings"
import type {
    ArenaResponseKoder,
    KanStarteOppfolging,
} from "~/api/veilarboppfolging"

export interface MockSettings {
    oppfolgingsEnhet: "Arena" | "Ingen" | "GT_PDL" | "Error"
    kanStarteOppfolging: KanStarteOppfolging
    over18: "Over18" | "Under18"
    aktivBruker: "nei" | "ja"
    registrerArenaSvar: ArenaResponseKoder
    fnr: string | null
    kanOverstyreKontor: boolean
}

export const action = async ({ request }: { request: Request }) => {
    const payload = Object.fromEntries(
        await request.formData(),
    ) as unknown as MockSettings

    mockSettings.oppfolgingsEnhet = payload.oppfolgingsEnhet
    mockSettings.over18 = payload.over18
    mockSettings.aktivBruker = payload.aktivBruker
    mockSettings.registrerArenaSvar = payload.registrerArenaSvar
    mockSettings.kanStarteOppfolging = payload.kanStarteOppfolging
    mockSettings.kanOverstyreKontor = payload.kanOverstyreKontor

    return new Response("Ok", { status: 200 })
}
