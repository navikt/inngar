enum FDselsnummerHelper {
    ORDINÆRT,
    DOLLY,
    D_NUMMER,
    TEST_NORGE,
}

export function isUnder18(fodselsnummer: string): boolean {
    const fnr = tilOrdinærtFødselsnummerFormat(fodselsnummer)

    const dag = parseInt(fnr.substring(0, 2))
    const maaned = parseInt(fnr.substring(2, 4))
    const aar = parseInt(fnr.substring(4, 6))

    // Dette vil fungere så lenge vi ikke har brukere på over 100 år
    const innevaerendeAar = new Date().getFullYear() - 2000
    const aarhundre = aar > innevaerendeAar ? 1900 : 2000

    const fodselsaar = aarhundre + aar
    const fodselsdato = new Date(fodselsaar, maaned - 1, dag)
    const dagensdato = new Date()

    const alder = dagensdato.getFullYear() - fodselsdato.getFullYear()
    const harHattBursdag =
        dagensdato.getMonth() > fodselsdato.getMonth() ||
        (dagensdato.getMonth() === fodselsdato.getMonth() &&
            dagensdato.getDate() >= fodselsdato.getDate())

    return (harHattBursdag ? alder : alder - 1) < 18
}

function fødselsnummerType(fnr: string): FDselsnummerHelper {
    const førsteMånedssiffer = parseInt(fnr.charAt(2))
    const førsteSiffer = parseInt(fnr.charAt(0))

    if (førsteMånedssiffer >= 8) {
        return FDselsnummerHelper.TEST_NORGE
    } else if (førsteMånedssiffer >= 4) {
        return FDselsnummerHelper.DOLLY
    } else if (førsteSiffer >= 4) {
        return FDselsnummerHelper.D_NUMMER
    } else {
        return FDselsnummerHelper.ORDINÆRT
    }
}

function tilOrdinærtFødselsnummerFormat(fnr: string): string {
    switch (fødselsnummerType(fnr)) {
        case FDselsnummerHelper.ORDINÆRT:
            return fnr
        case FDselsnummerHelper.DOLLY:
            return nedjusterFørsteMånedssiffer(fnr, 4)
        case FDselsnummerHelper.TEST_NORGE:
            return nedjusterFørsteMånedssiffer(fnr, 8)
        case FDselsnummerHelper.D_NUMMER:
            return nedjusterFørsteSiffer(fnr, 4)
    }
}

function nedjusterFørsteSiffer(fnr: string, nedjusterMed: number): string {
    const korrigertFørsteSiffer = parseInt(fnr.charAt(0)) - nedjusterMed
    return (
        fnr.substring(0, 0) +
        korrigertFørsteSiffer.toString() +
        fnr.substring(1)
    )
}

function nedjusterFørsteMånedssiffer(
    fnr: string,
    nedjusterMed: number,
): string {
    const indexFørsteMånedssiffer = 2
    const korrigertFørsteMånedssiffer =
        parseInt(fnr.charAt(indexFørsteMånedssiffer)) - nedjusterMed
    return (
        fnr.substring(0, indexFørsteMånedssiffer) +
        korrigertFørsteMånedssiffer.toString() +
        fnr.substring(indexFørsteMånedssiffer + 1)
    )
}
