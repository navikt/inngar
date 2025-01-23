export interface App {
    name: string
    namespace: string
}

export const apps = {
    veilarboppfolging: { name: "veilarboppfolging", namespace: "poao" },
    veilarbportefolje: { name: "veilarbportefolje", namespace: "obo" },
    veilarbperson: { name: "veilarbperson", namespace: "obo" },
    veilarbdialog: { name: "veilarbdialog", namespace: "dab" },
    modiacontextholder: { name: "modiacontextholder", namespace: "personoversikt" },
}

export const toAppUrl = (targetApp: App, url: URL | string): string => {
    const pathname = typeof url === "string" ? url : url.pathname
    return `http://${targetApp.name}.${targetApp.namespace}${pathname}`
}