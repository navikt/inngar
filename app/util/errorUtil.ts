import { getActiveSpanContext } from "../../server/onlyServerOtelUtils"
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
