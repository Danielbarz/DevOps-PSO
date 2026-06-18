import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";

export const authPlugin = new Elysia({ name: "auth-plugin" }).use(
	jwt({
		name: "jwt",
		secret: JWT_SECRET,
	})
);
