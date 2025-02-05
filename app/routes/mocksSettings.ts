import type { Route } from "./+types/mocksSettings"
import { mockSettings } from "~/mock/mockSettings"

export interface MockSettings {
  oppfolgingsEnhet: 'Arena' | 'Ingen' | 'GT_PDL' | 'Error' | 'UnderOppfolging';
  over18: 'Over18' | 'Under18' ;
}

export const action = async ({ request }: Route.ActionArgs) => {
  const payload = Object.fromEntries(
      await request.formData(),
  ) as unknown as MockSettings

  mockSettings.oppfolgingsEnhet = payload.oppfolgingsEnhet;
  mockSettings.over18 = payload.over18;

  return new Response("Ok", { status: 200 })
}