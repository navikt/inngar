import { Env, getEnv } from "~/util/getEnv"

export const env = getEnv()

export const urls = {
  aktivitetsplan: {
    [Env.dev]: "https://aktivitetsplan.ekstern.dev.nav.no/",
    [Env.prod]: "https://aktivitetsplan.nav.no",
    [Env.local]: "/",
  },
  minside: {
    [Env.dev]: "https://www.ansatt.dev.nav.no/minside",
    [Env.prod]: "https://nav.no/minside",
    [Env.local]: "/",
  },
  dialog: {
    [Env.dev]: "https://pto.ekstern.dev.nav.no/arbeid/dialog/",
    [Env.prod]: "https://nav.no/arbeid/dialog",
    [Env.local]: "/",
  },
  samtykkeSkjemaUrl: {
    [Env.prod]: "https://www.nav.no/samtykke-foresatte",
    [Env.dev]: "https://www.nav.no/samtykke-foresatte",
    [Env.local]: "https://www.nav.no/samtykke-foresatte",
  },
  kontaktOss: {
    [Env.prod]: "https://www.nav.no/kontaktoss",
    [Env.dev]: "https://www.nav.no/kontaktoss",
    [Env.local]: "https://www.nav.no/kontaktoss",
  },
}
