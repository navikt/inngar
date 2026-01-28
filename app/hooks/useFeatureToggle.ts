import { useEffect, useState } from "react"
import { logger } from "../../server/logger.ts"

type FeatureToggles = "inngar.overstyr-kontor"
type Features = Record<FeatureToggles, boolean>

export function useFeatureToggle(featureName: FeatureToggles): boolean {
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        logger.info("Henter toggle...")
        fetch(`/veilarbaktivitet/api/feature?feature=${featureName}`)
            .then((res) => res.json())
            .then((data: Features) => {
                setEnabled(data === true || data?.[featureName] === true)
            })
            .catch(() => {
                logger.warn("Klarte ikke hente feature-toggles")
                setEnabled(false)
            })
    }, [featureName])

    return enabled
}
