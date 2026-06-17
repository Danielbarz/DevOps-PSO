import { cors } from "@elysiajs/cors";
import { db } from "@scholar-seek/db";
import { Elysia } from "elysia";
import { authModule } from "./modules/auth";
import { bookmarksModule } from "./modules/bookmarks";
import { crawlerModule } from "./modules/crawler";
import { papersModule } from "./modules/papers";

const app = new Elysia()
    .use(cors())
    .use(authModule)
    .use(bookmarksModule)
    .use(crawlerModule)
    .use(papersModule)
    .get("/health", () => ({ status: "ok" }));

const PORT = Number(process.env.PORT) || 3000;
app.listen({ port: PORT, hostname: "0.0.0.0" }, (server) => {
    console.log(`API Server running at http://${server?.hostname}:${server?.port}`);
});
