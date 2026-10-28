
export const begrunnelseEtiketter = {
  IJOBB: "I Jobb",
  ALDERSPENSJON: "Alderspensjon",
  UFØRERTRYGD: "Uførertrygd",
  FORELDREPERMISJON: "Foreldrepermisjon",
  STUDIER: "Studier",
  ANNET: "Annet",
} as const satisfies Record<string, string>

export type Begrunnelse = keyof typeof begrunnelseEtiketter
export const begrunnelser = Object.keys(begrunnelseEtiketter) as Begrunnelse[]

export type Skjemafeil = {
  bekreftet?: string
  begrunnelse?: string
}

export type AvsluttOppfolgingResultat =
  | { status: "vellykket" }
  | { status: "kanIkkeAvsluttes" | "feilet" }
  | { status: "ugyldig"; feil: Skjemafeil }

export function validerSkjema(
  bekreftet: boolean,
  begrunnelse: Begrunnelse | "",
): Skjemafeil {
  return {
    bekreftet: bekreftet
      ? undefined
      : "Du må bekrefte før du kan avslutte oppfølgingen.",
    begrunnelse:
      begrunnelse !== "" && begrunnelser.includes(begrunnelse)
        ? undefined
        : "Du må velge en årsak.",
  }
}
