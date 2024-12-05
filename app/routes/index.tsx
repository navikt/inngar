import type { Route } from "./+types/index";
import {Button} from "@navikt/ds-react";
import {data, Form} from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
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
      throw data({ message: "Kunne ikke opprette oppfolgingsperiode i veilarboppfolging" }, { status: 500 })
    }
}

export default function Index() {
  return <div>
    <Form method="post">
      <input name="fnr" defaultValue="1234567890" />
      <Button>Start arbeidsoppfølging</Button>
    </Form>
  </div>;
}
