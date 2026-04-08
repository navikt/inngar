export type ArenaResponseKoder =
    | "OK_REGISTRERT_I_ARENA"
    | "FNR_FINNES_IKKE"
    | "KAN_REAKTIVERES_FORENKLET"
    | "BRUKER_ALLEREDE_ARBS"
    | "BRUKER_ALLEREDE_IARBS"
    | "UKJENT_FEIL"

export interface StartOppfolgingSuccessResponse {
    kode: ArenaResponseKoder
}

export interface StartOppfolgingErrorResponse {
    ok: false
    error: string
}

export interface StartOppfolgingSuccess {
    ok: true
    body: StartOppfolgingSuccessResponse
}