import type { Route } from "./+types/mocksSettings"
import { mockSettings } from "~/mock/mockSettings"

export interface MockSettings {
  oppfolgingsEnhet: 'Arena' | 'Ingen' | 'GT_PDL' | 'Error' | 'UnderOppfolging';
}

export const action = async ({ request }: Route.ActionArgs) => {
  const payload = Object.fromEntries(
      await request.formData(),
  ) as unknown as MockSettings

  mockSettings.oppfolgingsEnhet = payload.oppfolgingsEnhet;

  return new Response("Ok", { status: 200 })
}