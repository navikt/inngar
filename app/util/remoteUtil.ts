import {useEffect, useState} from "react";

export const ClientOnlyChild = ({ children }: { children: any }) => {
    const [rendered, setRendered] = useState(false)
    useEffect(() => {
        setRendered(true)
    }, [])
    if (rendered) return children
    else return null
}