import type { KanStarteOppfolging } from "~/api/veilarboppfolging"

export enum BrukerStatus {
    INGEN_BRUKER_VALGT = "INGEN_BRUKER_VALGT",
    IKKE_UNDER_OPPFOLGING = "IKKE_UNDER_OPPFOLGING",
    KREVER_MANUELL_GODKJENNING = "KREVER_MANUELL_GODKJENNING",
    ALLEREDE_UNDER_OPPFOLGING = "ALLEREDE_UNDER_OPPFOLGING",
    ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT = "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT",
    ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING = "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING",
    IKKE_TILGANG = "IKKE_TILGANG",
    UGYLDIG_BRUKER_FREG_STATUS = "UGYLDIG_BRUKER_FREG_STATUS",
}

export const finnBrukerStatus = (kanStarteOppfolging: KanStarteOppfolging) => {
    switch (kanStarteOppfolging) {
        case "JA":
            return BrukerStatus.IKKE_UNDER_OPPFOLGING
        case "JA_MED_MANUELL_GODKJENNING":
        case "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT":
        case "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR":
            return BrukerStatus.KREVER_MANUELL_GODKJENNING
        case "ALLEREDE_UNDER_OPPFOLGING":
            return BrukerStatus.ALLEREDE_UNDER_OPPFOLGING
        case "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT":
            return BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT
        case "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING":
            return BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING
        case "DOD":
        case "UKJENT_STATUS_FOLKEREGISTERET":
        case "INGEN_STATUS_FOLKEREGISTERET":
        case "IKKE_LOVLIG_OPPHOLD":
            return BrukerStatus.UGYLDIG_BRUKER_FREG_STATUS
        default:
            return BrukerStatus.IKKE_TILGANG
    }
}
