import Elysia from "elysia"
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";

const logout = new Elysia()
    .get("/logout", async ({ set, cookie: { sessionAccess, sessionRefresh } }) => {
        try {
            // Explicitly expire cookies with matching attributes to ensure deletion
            const isProduction = Bun.env.NODE_ENV === 'production'
            const common: {
                httpOnly: boolean;
                path: string;
                secure: boolean;
                sameSite: "none" | "lax" | "strict" | boolean | undefined;
                maxAge: number;
            } = {
                httpOnly: true,
                path: "/",
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                maxAge: 0
            }

            sessionAccess.set({ value: "", ...common })
            sessionRefresh.set({ value: "", ...common })

            return SuccessHandler(
                set,
                "You have been logged out successfully"
            );
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error fetching loging out",
                error
            );
        }
    }, {
        detail: {
            tags: ['Auth Session']
        }
    });

export default logout;