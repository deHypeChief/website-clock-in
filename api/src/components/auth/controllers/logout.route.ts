import Elysia from "elysia"
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";

const logout = new Elysia()
    .get("/logout", async ({ set, cookie: { sessionAccess, sessionRefresh } }) => {
        try {
            // Clear the session cookie
            sessionAccess.remove();
            sessionRefresh.remove();

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