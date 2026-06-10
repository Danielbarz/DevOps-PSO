import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "node:path";

const app = new Elysia()
    // Sajikan file statis dari folder apps/web/dist
    .use(staticPlugin({
        assets: "apps/web/dist",
        prefix: "/"
    }))
    // Fallback ke index.html untuk client-side routing
    .get("/*", () => Bun.file(path.join("apps/web/dist", "index.html")))
    .listen(process.env.PORT || 3000);

console.log("Server berjalan di port 3000");