import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { authModule } from "./modules/auth";
import { bookmarksModule } from "./modules/bookmarks";
import { crawlerModule } from "./modules/crawler";
import { papersModule } from "./modules/papers";

// Inisialisasi aplikasi Elysia
const app = new Elysia()
    .use(cors())
    .use(authModule)
    .use(bookmarksModule)
    .use(crawlerModule)
    .use(papersModule)
    .get("/health", () => ({ 
        status: "ok",
        timestamp: new Date().toISOString() 
    }));

// Ambil port dari environment variable, default ke 3000
const PORT = Number(process.env.PORT) || 3000;

/**
 * LOGIKA RUNTIME:
 * Jika di production (saat di-bundle oleh tsdown), kita tidak memanggil .listen()
 * agar server bisa dijalankan oleh adapter atau runner yang tepat.
 * Jika di development, kita jalankan .listen() agar bisa langsung diakses.
 */
if (process.env.NODE_ENV !== "production") {
    app.listen({ port: PORT, hostname: "0.0.0.0" }, (server) => {
        console.log(`API Server running at http://${server?.hostname}:${server?.port}`);
    });
}

// Ekspor sebagai default untuk digunakan oleh runtime produksi
export default app;
