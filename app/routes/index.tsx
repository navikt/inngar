import type { Route } from "./+types/index";
import {Button} from "@navikt/ds-react";
import {data, Form} from "react-router";
import { logger } from "../logger";
import Decorator from "~/components/decorator";
import {useState} from "react";

export async function clientLoader({  }) {

    if(import.meta.env.DEV) {
        import('../mock/setupMockClient')
    }
}

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

export function HydrateFallback() {
    return <p>Loading...</p>;
}

type FnrState = { loading: true } | { loading: false, fnr?: string | undefined | null }

export default function Index() {
    const [fnrState, setState] = useState<FnrState>({ loading: true })
    return <div>
        <Decorator onFnrChanged={(fnr) => {
            setState({ loading: false, fnr })
        }} />
        <Form method="post">
          <input name="fnr" defaultValue="1234567890" value={!fnrState.loading ? fnrState.fnr : undefined}/>
          <Button>Start arbeidsoppfølging</Button>
        </Form>
  </div>;
}
