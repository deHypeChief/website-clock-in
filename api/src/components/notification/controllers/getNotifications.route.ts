import Elysia from "elysia"
import ErrorHandler from "../../../services/errorHandler.service"
import { isSessionAuth } from "../../../middleware/authSession.middleware"
import { NotifyAdmin, NotifyUser } from "../_model"
import SuccessHandler from "../../../services/successHandler.service"

export const getAllNotification = new Elysia()
    .use(isSessionAuth("user"))
    .get("/user", async ({ set, session }) => {
        try {
            const notifyUser = await NotifyUser.findOne({ sessionId: session._id })

            return SuccessHandler(
                set,
                "User Notification found",
                {
                    notifications: notifyUser
                }
            );
        } catch (error) {
            throw ErrorHandler.ServerError(
                set,
                "Error getting notifications ",
                error
            )
        }
    }, {
        detail: {
            tags: ['Notifications'],
            description: "Get notifications for signed users"
        }
    })

export const getAllNotificationAdmin = new Elysia()
    .use(isSessionAuth("admin"))
    .get("/admin", async ({ set, session }) => {
        try {
            const notifyAdmin = await NotifyAdmin.findOne({ sessionId: session._id })

            return SuccessHandler(
                set,
                "Admin Notification found",
                {
                    notifications: notifyAdmin
                }
            );
        } catch (error) {
            throw ErrorHandler.ServerError(
                set,
                "Error getting admin notifications ",
                error
            )
        }
    }, {
        detail: {
            tags: ['Notifications'],
            description: "Get notifications for signed admins"
        }
    })