import { data, type ShouldRevalidateFunction } from "react-router"
import { apps, logger } from "common"
import { getOboToken } from "common/server"
import type { Route } from "./+types/avsluttOppfolgingPage"
import { avsluttEgenOppfolging } from "~/api/avsluttOppfolging.server"
import { AvsluttOppfolgingPage } from "~/avsluttOppfolging/AvsluttOppfolgingPage"
import {
  validerSkjema,
  type AvsluttOppfolgingResultat,
  type Begrunnelse,
} from "~/avsluttOppfolging/skjema"

export const meta: Route.MetaFunction = () => [
  { title: "Avslutt arbeidsrettet oppfølging – Nav" },
]

export const loader = async ({ request }: Route.LoaderArgs) => {
  const resultat = await getOboToken(request, apps.veilarboppfolging)
  if (!resultat.ok) throw resultat.errorResponse
  return null
}

export const action = async ({ request }: Route.ActionArgs) => {
  const tokenResultat = await getOboToken(request, apps.veilarboppfolging)
  if (!tokenResultat.ok) {
    logger.warn(
      { status: tokenResultat.errorResponse.status },
      "Avslutt egen oppfølging: token-utveksling feilet",
    )
    return data<AvsluttOppfolgingResultat>(
      { status: "feilet" },
      { status: tokenResultat.errorResponse.status },
    )
  }

  const formData = await request.formData()
  const begrunnelse = formData.get("begrunnelse")
  if (typeof begrunnelse !== "string") {
    return data<AvsluttOppfolgingResultat>(
      {
        status: "ugyldig",
        feil: { begrunnelse: "Begrunnelsen må være tekst." },
      },
      { status: 400 },
    )
  }
  const feil = validerSkjema(
    formData.get("bekreftet") === "bekreftet",
    begrunnelse as Begrunnelse,
  )
  if (feil.bekreftet || feil.begrunnelse) {
    return data<AvsluttOppfolgingResultat>(
      { status: "ugyldig", feil },
      { status: 400 },
    )
  }

  return avsluttEgenOppfolging(tokenResultat.token, begrunnelse)
}

export const clientAction = async ({
  serverAction,
}: Route.ClientActionArgs): Promise<AvsluttOppfolgingResultat> => {
  try {
    return await serverAction<typeof action>()
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
    return { status: "feilet" }
  }
}

// Auth-feil ved innsending skal vises i skjemaet, ikke erstattes av loader-feil.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  defaultShouldRevalidate,
}) => formMethod?.toUpperCase() !== "POST" && defaultShouldRevalidate

export default AvsluttOppfolgingPage
