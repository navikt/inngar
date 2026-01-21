import { type App, apps } from "~/util/appConstants.ts"
import { toUrl } from "~/api/utils.ts"

const baseUrl = toUrl(apps.aoOppfolgingskontor, "/api/")

export interface Arbeidsoppfølgingskontor {
    kontorId: string,
    kontorNavn: string,
}

export const finnArbeidsoppfølgingskontor = (fnr: string): Promise<Arbeidsoppfølgingskontor> => {

}

/*
@Serializable
data class FinnKontorInputDto(
    val ident: IdentSomKanLagres,
    val erArbeidssøker: Boolean
)

@Serializable
data class FinnKontorOutputDto(
    val kontorId: KontorId,
    val kontorNavn: KontorNavn
)
 */