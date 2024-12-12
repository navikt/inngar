import type { Route } from "./+types/index";
import {Button} from "@navikt/ds-react";
import {data, Form} from "react-router";
import { logger } from "../logger";
import Decorator from "~/components/decorator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs
) {
    if (!request.signal.aborted) {
        logger.error(error)
    }
}

const veilarboppfolgingUrl = "http://poao.veilarboppfolging"

export const action = async (args: Route.ActionArgs) => {
    const formdata = await args.request.formData()
    const fnr = formdata.get("fnr")

    if (typeof fnr !== "string") {
      throw data({ message: "fnr må være en string" }, { status: 400 })
    }
    if (!fnr) {
      throw data({message: "Fant ikke fnr" }, { status: 400 })
    }

    try {
      await fetch(`${veilarboppfolgingUrl}/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode`, {
        method: "POST",
        body: JSON.stringify({ fnr })
      })
    } catch (e) {
        logger.error("Kunne ikke opprette oppfolgingsperiode i veilarboppfolging", e)
        throw data({ message: "Kunne ikke opprette oppfolgingsperiode i veilarboppfolging" }, { status: 500 })
    }
}

export const loader = () => {
    logger.info("Hei")
    return {}
}

// export const clientLoader = async () => {
//     console.log("Client loader")
//     return { data: 1 }
// }
// clientLoader.hydrate = true as const

export function HydrateFallback() {
    return <p>Loading...</p>;
}

export default function Index() {
    logger.info("Log")
    return <div>
        <Decorator />
        <Form method="post">
          <input name="fnr" defaultValue="1234567890"/>
          <Button>Start arbeidsoppfølging</Button>
        </Form>
        <script
          src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/bundle.js"></script>
        <link
          rel="stylesheet"
          href="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/index.css"
        />
  </div>;
}
