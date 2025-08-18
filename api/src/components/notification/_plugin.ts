import Elysia from "elysia"
import { getAllNotification, getAllNotificationAdmin } from "./controllers/getNotifications.route"

const notificationsPlugin = new Elysia({
    prefix: "/notification"
})
    .use(getAllNotification)
    .use(getAllNotificationAdmin)

export default notificationsPlugin