import Elysia from "elysia";
import visitorClock from "./controllers/visitorClock.route";
import adminRecords from "./controllers/adminRecords.route";
import reports from "./controllers/reports.route";
import employeeKioskClock from "./controllers/employeeKioskClock.route";
import employeePublicStatus from "./controllers/employeePublicStatus.route";
import visitorStatus from "./controllers/visitorStatus.route";
import visitorKioskClock from "./controllers/visitorKioskClock.route";

const attendancePlugin = new Elysia({ prefix: "/attendance" })
    .use(employeeKioskClock)
    .use(employeePublicStatus)
    .use(visitorStatus)
    .use(visitorKioskClock)
    .use(visitorClock)
    .use(adminRecords)
    .use(reports)

export default attendancePlugin;
