import { mockSettings, type MockSettings } from "~/mock/mockSettings";

export const action = async ({ request }: { request: Request }) => {
  const payload = Object.fromEntries(
    await request.formData(),
  ) as unknown as MockSettings;

  mockSettings.kanStarteOppfolgingEkstern = payload.kanStarteOppfolgingEkstern;

  return new Response("Ok", { status: 200 });
};
