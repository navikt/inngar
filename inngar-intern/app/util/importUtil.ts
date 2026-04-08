interface Manifest {
    "index.html": { file: string; css: string[] }
}

const importedApps: Record<string, boolean> = {}

export const importSubApp = async (url: string) => {
    // if (url in importedApps) return
    // importedApps[url] = true
    return fetch(`${url}/asset-manifest.json`)
        .then((res) => res.json())
        .then((manifest: Manifest) => {
            return {
                jsUrl: `${url}/${manifest["index.html"].file}`,
                cssUrl: `${url}/${manifest["index.html"].css[0]}`,
            }
        })
}
