import Elysia from "elysia";
import authPlugin from "../components/auth/_plugin";
import userPlugin from "../components/users/_plugin";
import adminPlugin from "../components/admin/_plugin";
import notificationsPlugin from "../components/notification/_plugin";
import cronPlugin from "../components/jobs/_plugin";
import { verifyJobPlugin } from "../middleware/cron.middleware";
import employeePlugin from "../components/employees/_plugin";
import visitorPlugin from "../components/visitors/_plugin";
import attendancePlugin from "../components/attendance/_plugin";
import settingsPlugin from "../components/settings/_plugin";

const routes = new Elysia()
    .get("/", () => "Server is up and running 🦊", { detail: { tags: ['Server Status'] } })
    .use(authPlugin)
    .use(adminPlugin)
    .use(userPlugin)
    .use(employeePlugin)
    .use(visitorPlugin)
    .use(attendancePlugin)
    .use(settingsPlugin)
    .use(notificationsPlugin)
    .use(cronPlugin)
    // .use(verifyJobPlugin)


export default routes;
