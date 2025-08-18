import { CookieOptions } from "elysia";

const isProduction = Bun.env.NODE_ENV === "production"

export const SessionAuthConfig = {  
    accessToken: {
        name: "SESSION_ACCESS_TOKEN",
        jwtExp: "15m",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        cookie: {
            httpOnly: true,
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: "/",
            secure: isProduction,
            sameSite: "lax"
        } as CookieOptions,
    },
    refreshToken: {
        name: "SESSION_REFRESH_TOKEN",
        jwtExp: "14d",
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        cookie: {
            httpOnly: true,
            maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
            path: "/",
            secure: isProduction,
            sameSite: "lax"
        } as CookieOptions,
    },
}