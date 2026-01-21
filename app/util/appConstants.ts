export interface App {
    name: string
    namespace: string
    preserveContextPath: boolean
}

export const apps = {
    veilarboppfolging: {
        name: "veilarboppfolging",
        namespace: "poao",
        preserveContextPath: true,
    },
    aoOppfolgingskontor: {
        name: "ao-oppfolgingskontor",
        namespace: "dab",
        preserveContextPath: true,
    },
    veilarbportefolje: {
        name: "veilarbportefolje",
        namespace: "obo",
        preserveContextPath: true,
    },
    veilarbperson: {
        name: "veilarbperson",
        namespace: "obo",
        preserveContextPath: true,
    },
    veilarbdialog: {
        name: "veilarbdialog",
        namespace: "dab",
        preserveContextPath: true,
    },
    veilarbveileder: {
        name: "veilarbveileder",
        namespace: "obo",
        preserveContextPath: true,
    },
    veilarbvedtaksstotte: {
        name: "veilarbvedtaksstotte",
        namespace: "obo",
        preserveContextPath: true,
    },
    "obo-unleash": {
        name: "obo-unleash",
        namespace: "obo",
        preserveContextPath: false,
    },
    modiacontextholder: {
        name: "modiacontextholder",
        namespace: "personoversikt",
        preserveContextPath: true,
    },
}

export const toAppUrl = (targetApp: App, url: URL | string): string => {
    const pathname = typeof url === "string" ? url : url.pathname
    return `http://${targetApp.name}.${targetApp.namespace}${pathname}`
}
