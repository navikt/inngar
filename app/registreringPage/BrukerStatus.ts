import type { KanStarteOppfolging } from "~/api/veilarboppfolging"

export enum BrukerStatus {
    INGEN_BRUKER_VALGT = "INGEN_BRUKER_VALGT",
    IKKE_UNDER_OPPFOLGING = "IKKE_UNDER_OPPFOLGING",
    ALLEREDE_UNDER_OPPFOLGING = "ALLEREDE_UNDER_OPPFOLGING",
    IKKE_TILGANG = "IKKE_TILGANG",
    UGYLDIG_BRUKER_FREG_STATUS = "UGYLDIG_BRUKER_FREG_STATUS",
}

export const finnBrukerStatus = (kanStarteOppfolging: KanStarteOppfolging) => {
    switch (kanStarteOppfolging) {
        case "JA":
            return BrukerStatus.IKKE_UNDER_OPPFOLGING
        case "ALLEREDE_UNDER_OPPFOLGING":
            return BrukerStatus.ALLEREDE_UNDER_OPPFOLGING
        case "DOD":
        case "UKJENT_STATUS_FOLKEREGISTERET":
        case "INGEN_STATUS_FOLKEREGISTERET":
        case "IKKE_LOVLIG_OPPHOLD":
            return BrukerStatus.UGYLDIG_BRUKER_FREG_STATUS
        default:
            return BrukerStatus.IKKE_TILGANG
    }
}
