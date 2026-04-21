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
import { EnvType, loadUmami, loggBesok, loggBesokUnder18, loggKnappKlikket } from "common"
import { getEnv } from "~/util/envUtil.ts"
import { useEffect } from "react"

const env = getEnv()
const samtykkeSkjemaUrl = {
  [EnvType.prod]: "https://www.nav.no/samtykke-foresatte",
  [EnvType.dev]: "https://www.nav.no/samtykke-foresatte",
  [EnvType.local]: "https://www.nav.no/samtykke-foresatte",
}

export const Under18Advarsel = () => {
  const bliKontaktetFetcher = useFetcher()

  useEffect(() => {
    loadUmami(getEnv().type)
      .then(() => {
        loggBesokUnder18();
      })
      .catch((e) => {
        console.warn("Kunne ikke laste Umami-scriptet:", e)
      })
  }, [])

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
                onClick={() => loggKnappKlikket("Jeg er under 18 år og ønsker at en veileder tar kontakt")}
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
