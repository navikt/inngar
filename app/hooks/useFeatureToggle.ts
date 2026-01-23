import { useEffect, useState } from "react"
import { logger } from "../../server/logger.ts"

export function useFeatureToggle(featureName: string): boolean {
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        logger.info("Henter toggle...")
        fetch(`/veilarbaktivitet/api/feature?feature=${featureName}`)
            .then((res) => res.json())
            .then((data) => {
                setEnabled(data === true || data?.enabled === true)
            })
            .catch(() => {
                logger.warn("Klarte ikke hente feature-toggles")
                setEnabled(false)
            })
    }, [featureName])

    return enabled
}
