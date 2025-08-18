import mongoose from "mongoose";
import { NotifyAdmin, NotifyUser } from "../components/notification/_model";


class NotificationHandler {
    static async send(sessionId: mongoose.Types.ObjectId, type: string, message: string, title: string) {
        await NotifyUser.create({
            sessionClientId: sessionId,
            type: type,
            message: message,
            title: title
        })
    }

    static async sendAdmin(type: string, message: string, title: string) {
        await NotifyAdmin.create({
            type: type,
            message: message,
            title: title
        })
    }
}

export default NotificationHandler
