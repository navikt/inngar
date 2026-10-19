export const maksBegrunnelseLengde = 500

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
  begrunnelse: string,
): Skjemafeil {
  return {
    bekreftet: bekreftet
      ? undefined
      : "Du må bekrefte før du kan avslutte oppfølgingen.",
    begrunnelse:
      begrunnelse.length > maksBegrunnelseLengde
        ? "Du må korte ned teksten til 500 tegn"
        : undefined,
  }
}
