import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import url from "node:url"
import type { ServerBuild } from "react-router"
import { createRequestHandler } from "@react-router/express"
import compression from "compression"
import express from "express"
import morgan from "morgan"
import sourceMapSupport from "source-map-support"
import getPort from "get-port"
import process from "node:process"
import { logger } from "./logger.ts"

process.on("unhandledRejection", (e) => {
    logger.error(`unhandledRejection: ${e?.toString()}`)
})

sourceMapSupport.install({
    retrieveSourceMap: function (source) {
        let match = source.startsWith("file://")
        if (match) {
            let filePath = url.fileURLToPath(source)
            let sourceMapPath = `${filePath}.map`
            if (fs.existsSync(sourceMapPath)) {
                return {
                    url: source,
                    map: fs.readFileSync(sourceMapPath, "utf8"),
                }
            }
        }
        return null
    },
})

run()

function parseNumber(raw?: string) {
    if (raw === undefined) return undefined
    let maybe = Number(raw)
    if (Number.isNaN(maybe)) return undefined
    return maybe
}

async function run() {
    let port = parseNumber(process.env.PORT) ?? (await getPort({ port: 3000 }))

    let buildPathArg = process.argv[2]

    if (!buildPathArg) {
        logger.error(`
  Usage: react-router-serve <server-build-path> - e.g. react-router-serve build/server/index.js`)
        process.exit(1)
    }

    let buildPath = path.resolve(buildPathArg)

    let build: ServerBuild = await import(url.pathToFileURL(buildPath).href)

    let onListen = () => {
        let address =
            process.env.HOST ||
            Object.values(os.networkInterfaces())
                .flat()
                .find((ip) => String(ip?.family).includes("4") && !ip?.internal)
                ?.address

        if (!address) {
            logger.info(`http://localhost:${port}`)
        } else {
            logger.info(`http://inngar.dab:${port} (http://${address}:${port})`)
        }
    }

    let app = express()
    app.disable("x-powered-by")
    app.use(compression())
    app.use(
        path.posix.join(build.publicPath, "assets"),
        express.static(path.join(build.assetsBuildDirectory, "assets"), {
            immutable: true,
            maxAge: "1y",
        }),
    )
    app.use(build.publicPath, express.static(build.assetsBuildDirectory))
    app.use(express.static("public", { maxAge: "1h" }))
    app.use(
        morgan("combined", {
            stream: {
                write: (message) => {
                    logger.debug(message.trim())
                },
            },
        }),
    )

    app.all(
        "*",
        createRequestHandler({
            build,
            mode: process.env.NODE_ENV,
        }),
    )

    let server = process.env.HOST
        ? app.listen(port, process.env.HOST, onListen)
        : app.listen(port, onListen)

    ;["SIGTERM", "SIGINT"].forEach((signal) => {
        process.once(signal, () => server?.close(logger.error))
    })
}
