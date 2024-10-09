import { $ } from "bun"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"

const output = await $`cd static/layers-osrs && bun install && bun start`.text()
console.log(output)

const app = new Hono()

app.use("/*", serveStatic({ root: "./static/" }))

export default app
