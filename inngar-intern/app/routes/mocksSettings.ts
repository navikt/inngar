import { mockSettings } from "../mock/mockSettings"
import type {
    ArenaResponseKoder,
    KanStarteOppfolging,
} from "~/api/veilarboppfolging"

export interface MockSettings {
    kanStarteOppfolging: KanStarteOppfolging
    over18: "Over18" | "Under18"
    aktivBruker: "nei" | "ja"
    registrerArenaSvar: ArenaResponseKoder
    fnr: string | null
    startOppfolgingFeiler: "true" | "false"
    harVeilederLeseTilgangTilBruker: "ja" | "nei"
}

export const action = async ({ request }: { request: Request }) => {
    const payload = Object.fromEntries(
        await request.formData(),
    ) as unknown as MockSettings

    mockSettings.over18 = payload.over18
    mockSettings.aktivBruker = payload.aktivBruker
    mockSettings.registrerArenaSvar = payload.registrerArenaSvar
    mockSettings.kanStarteOppfolging = payload.kanStarteOppfolging
    mockSettings.startOppfolgingFeiler = payload.startOppfolgingFeiler
    mockSettings.harVeilederLeseTilgangTilBruker = payload.harVeilederLeseTilgangTilBruker

    return new Response("Ok", { status: 200 })
}
