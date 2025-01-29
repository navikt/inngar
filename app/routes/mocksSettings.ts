import type { Route } from "./+types/mocksSettings"
import { commitSession, getSession } from "~/mock/mockSession";

export interface MockSettings {
  oppfolgingsEnhet: string;
}

export const action = async ({ request }: Route.ActionArgs) => {
  const payload = Object.fromEntries(
      await request.formData(),
  ) as unknown as MockSettings
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const cookieHeader = request.headers.get("Cookie");

  // const cookie = (await mockSettingsCookie.parse(cookieHeader)) || {};

  console.log(`setting session: oppfolgingsEnhet:${payload.oppfolgingsEnhet}`)
  session.set("oppfolgingsEnhet", payload.oppfolgingsEnhet);

  return new Response("Ok", { status: 200, headers: {
      // "Set-Cookie": await mockSettingsCookie.serialize(cookie),
      "Set-Cookie": await commitSession(session),
    }, })
}