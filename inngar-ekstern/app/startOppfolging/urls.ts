import { EnvType } from "common"
import { getEnv } from "~/util/envUtil.ts"

export const env = getEnv()

export const urls = {
  aktivitetsplan: {
    [EnvType.dev]: "https://aktivitetsplan.ekstern.dev.nav.no/",
    [EnvType.prod]: "https://aktivitetsplan.nav.no",
    [EnvType.local]: "/",
  },
  minside: {
    [EnvType.dev]: "https://www.ansatt.dev.nav.no/minside",
    [EnvType.prod]: "https://nav.no/minside",
    [EnvType.local]: "/",
  },
  dialog: {
    [EnvType.dev]: "https://pto.ekstern.dev.nav.no/arbeid/dialog/",
    [EnvType.prod]: "https://nav.no/arbeid/dialog",
    [EnvType.local]: "/",
  },
  samtykkeSkjemaUrl: {
    [EnvType.prod]: "https://www.nav.no/samtykke-foresatte",
    [EnvType.dev]: "https://www.nav.no/samtykke-foresatte",
    [EnvType.local]: "https://www.nav.no/samtykke-foresatte",
  },
  kontaktOss: {
    [EnvType.prod]: "https://www.nav.no/kontaktoss",
    [EnvType.dev]: "https://www.nav.no/kontaktoss",
    [EnvType.local]: "https://www.nav.no/kontaktoss",
  },
}
