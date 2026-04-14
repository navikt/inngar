import type { Route } from "./+types/home";
import {
  getKanStarteOppfolgingEkstern,
  startOppfolging,
} from "~/api/veilarboppfolging";
import { apps } from "common";
import { getOboToken } from "common/server";
import { KanStarteOppfolgingPage } from "~/startOppfolging/KanStarteOppfolgingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = async (args: Route.LoaderArgs) => {
  const tokenOrResponse = await getOboToken(
    args.request,
    apps.veilarboppfolging,
  );
  if (tokenOrResponse.ok == true) {
    return getKanStarteOppfolgingEkstern(tokenOrResponse.token);
  } else {
    throw Error(`Klarte ikke hente oppfølgingsstatus: 
            Status: ${tokenOrResponse.errorResponse.status}, 
            StatusText: ${tokenOrResponse.errorResponse.statusText}`);
  }
};

export default function Home({ loaderData }: Route.ComponentProps) {
  return <KanStarteOppfolgingPage kanStarteOppfolging={loaderData} />;
}

export const action = async (args: Route.ActionArgs) => {
  const tokenOrResponse = await getOboToken(
    args.request,
    apps.veilarboppfolging,
  );
  if (tokenOrResponse.ok == true) {
    return startOppfolging(tokenOrResponse.token);
  } else {
    throw Error(`Klarte ikke start oppfølging: 
            Status: ${tokenOrResponse.errorResponse.status}, 
            StatusText: ${tokenOrResponse.errorResponse.statusText}`);
  }
};
