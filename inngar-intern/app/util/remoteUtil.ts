import { type ReactElement, useEffect, useState } from "react"

export const ClientOnlyChild = ({
    children,
    placeholder,
}: {
    children: any
    placeholder: ReactElement
}) => {
    const [rendered, setRendered] = useState(false)
    useEffect(() => {
        setRendered(true)
    }, [])
    if (rendered) return children
    else return placeholder || null
}
