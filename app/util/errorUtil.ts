import { data } from "react-router"

export const dataWithTraceId = <T extends Record<any, any>>(
    payload: T,
    init?: number | ResponseInit,
) => {
    return data(
        {
            ...payload,
        },
        init,
    )
}
