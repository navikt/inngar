import { apps, logger, toUrl } from "common"
import { headersWithAuth } from "common/server"
import type { AvsluttOppfolgingResultat } from "~/avsluttOppfolging/skjema"

const url = toUrl(
  apps.veilarboppfolging,
  "/veilarboppfolging/api/v3/oppfolging/avslutt-egen-oppfolging",
)

export async function avsluttEgenOppfolging(
  token: string,
  begrunnelse: string,
): Promise<AvsluttOppfolgingResultat> {
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: headersWithAuth(token),
      body: JSON.stringify({ begrunnelse }),
      redirect: "error",
    })
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
    logger.error("Avslutt egen oppfølging: nettverksfeil")
    return { status: "feilet" }
  }

  if (response.status === 204) return { status: "vellykket" }
  if (response.status === 409) return { status: "kanIkkeAvsluttes" }

  logger.error(
    { status: response.status },
    "Avslutt egen oppfølging: uventet HTTP-status",
  )
  return { status: "feilet" }
}
