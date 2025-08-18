import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../_model";
import SuccessHandler from "../../../services/successHandler.service";
import { isSessionAuth } from "../../../middleware/authSession.middleware";

// update the auth
const getSessions = new Elysia()
    .use(isSessionAuth("admin"))
    .get("/sessions", async ({ set }) => {
        try {
            const sessions = await SessionClient.find().select("-password");

            return SuccessHandler(
                set,
                "Sessions clients fetched successfully",
                sessions
            );
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error fetching sessions clients",
                error
            );
        }
    }, {
        detail: {
            tags: ['Auth Session']
        }
    })

export default getSessions