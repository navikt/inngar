import type { Route } from "./+types/home"
import {
  bliKontaktet,
  getKanStarteOppfolgingEkstern,
  startOppfolging,
} from "~/api/veilarboppfolging"
import { apps } from "common"
import { getOboToken } from "common/server"
import { KanStarteOppfolgingPage } from "~/startOppfolging/KanStarteOppfolgingPage"
import { redirect } from "react-router"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export const loader = async (args: Route.LoaderArgs) => {
  const tokenOrResponse = await getOboToken(
    args.request,
    apps.veilarboppfolging,
  )
  if (tokenOrResponse.ok == true) {
    return getKanStarteOppfolgingEkstern(tokenOrResponse.token)
  } else {
    throw Error(`Klarte ikke hente oppfølgingsstatus: 
            Status: ${tokenOrResponse.errorResponse.status}, 
            StatusText: ${tokenOrResponse.errorResponse.statusText}`)
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <KanStarteOppfolgingPage kanStarteOppfolging={loaderData} />
}

export const action = async (args: Route.ActionArgs) => {
  const formData = await args.request.formData()
  const intent = formData.get("intent")

  const tokenOrResponse = await getOboToken(
    args.request,
    apps.veilarboppfolging,
  )
  if (tokenOrResponse.ok != true) {
    throw Error(`Token-utveksling feilet: 
            Status: ${tokenOrResponse.errorResponse.status}, 
            StatusText: ${tokenOrResponse.errorResponse.statusText}`)
  }

  if (intent === "bliKontaktet") {
    const result = await bliKontaktet(tokenOrResponse.token)
    if (result.ok) {
      return redirect(`/blir-kontaktet?frist=${encodeURIComponent(result.body.frist)}`)
    } else {
      throw Error(`Klarte ikke sende bli-kontaktet-forespørsel: ${result.error}`)
    }
  } else {
    const result = await startOppfolging(tokenOrResponse.token)
    if (result.ok) {
      return redirect("/oppfolging-startet")
    } else {
      throw Error(`Klarte ikke starte oppfølging: ${result.error}`)
    }
  }
}
