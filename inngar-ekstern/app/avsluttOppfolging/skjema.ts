export const gyldigeBegrunnelser = [
  "IJOBB",
  "ALDERSPENSJON",
  "UFØRERTRYGD",
  "FORELDREPERMISJON",
  "STUDIER",
  "ANNET",
] as const

export type Begrunnelse = (typeof gyldigeBegrunnelser)[number]

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
      begrunnelse !== "" && gyldigeBegrunnelser.includes(begrunnelse)
        ? undefined
        : "Du må velge en årsak.",
  }
}
