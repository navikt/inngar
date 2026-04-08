import { getActiveSpanContext } from "common/onlyServerOtelUtils.ts.ts"
import { data } from "react-router"

export const dataWithTraceId = <T extends Record<any, any>>(
    payload: T,
    init?: number | ResponseInit,
) => {
    const maybeContext = getActiveSpanContext()
    return data(
        {
            ...payload,
            traceId: maybeContext?.traceId,
        },
        init,
    )
}
