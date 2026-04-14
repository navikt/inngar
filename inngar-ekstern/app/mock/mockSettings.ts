import type { KanStarteOppfolgingEkstern } from "~/api/veilarboppfolging";

export interface MockSettings {
  kanStarteOppfolgingEkstern: KanStarteOppfolgingEkstern | "Error";
}

export const mockSettings: MockSettings = {
  kanStarteOppfolgingEkstern: "ALLEREDE_UNDER_OPPFOLGING",
};
