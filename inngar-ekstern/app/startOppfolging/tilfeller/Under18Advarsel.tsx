import {
  BodyShort,
  Button,
  Heading,
  InfoCard,
  Link,
  LinkCard,
} from "@navikt/ds-react"
import { useFetcher } from "react-router"
import { urls } from "~/startOppfolging/urls"
import { EnvType, loggKnappKlikket } from "common"
import { getEnv } from "~/util/envUtil.ts"

const env = getEnv()
const samtykkeSkjemaUrl = {
  [Env.prod]: "https://www.nav.no/samtykke-foresatte",
  [Env.dev]: "https://www.nav.no/samtykke-foresatte",
  [Env.local]: "https://www.nav.no/samtykke-foresatte",
}

export const Under18Advarsel = () => {
  const bliKontaktetFetcher = useFetcher()
  return (
    <div className="gap-8 flex flex-col">
      <Heading size={"large"}>
        Du må ha samtykke for å kunne motta arbeidsrettet oppfølging
      </Heading>
      <InfoCard data-color="warning">
        <InfoCard.Header>
          <InfoCard.Title>
            Du må registreres for oppfolging av en veileder
          </InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <BodyShort>
            Du er under 18 år og trenger samtykke fra foresatte for å kunne få
            arbeidsrettet oppfølging. Ta kontakt med oss hvis du trenger hjelp
            til dette.
          </BodyShort>
          <br />
          <BodyShort>
            Du kan få tak i{" "}
            <Link href={samtykkeSkjemaUrl[env]}>samtykkeskjema her</Link> som
            dine foresatte må fylle ut og sende inn til Nav.
          </BodyShort>
          <br />
          <BodyShort>
            Ønsker du at en veileder hos oss skal kontakte deg?
          </BodyShort>
          <br />
          <div>
            <bliKontaktetFetcher.Form method="post">
              <input type="hidden" name="intent" value="bliKontaktet" />
              <Button
                iconPosition={"right"}
                loading={bliKontaktetFetcher.state !== "idle"}
                disabled={bliKontaktetFetcher.state !== "idle"}
              >
                Ja, kontakt meg
              </Button>
            </bliKontaktetFetcher.Form>
          </div>
        </InfoCard.Content>
      </InfoCard>
      <div className="gap-2 flex flex-col">
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor href={urls.samtykkeSkjemaUrl[env]}>
              Samtykke fra foresatte
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            Les om hvorfor vi må ha samtykke og finn lenke til samtykkeskjema
          </LinkCard.Description>
        </LinkCard>
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor href={urls.kontaktOss[env]}>
              Kontakt oss
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>Ta kontakt med Nav</LinkCard.Description>
        </LinkCard>
      </div>
    </div>
  )
}
