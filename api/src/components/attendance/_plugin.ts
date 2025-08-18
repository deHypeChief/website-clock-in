import Elysia from "elysia";
import employeeClock from "./controllers/employeeClock.route";
import visitorClock from "./controllers/visitorClock.route";
import adminRecords from "./controllers/adminRecords.route";
import reports from "./controllers/reports.route";
import employeeStatus from "./controllers/employeeStatus.route";
import visitorStatus from "./controllers/visitorStatus.route";
import visitorKioskClock from "./controllers/visitorKioskClock.route";

const attendancePlugin = new Elysia({ prefix: "/attendance" })
    .use(employeeClock)
    .use(employeeStatus)
    .use(visitorStatus)
    .use(visitorKioskClock)
    .use(visitorClock)
    .use(adminRecords)
    .use(reports)

export default attendancePlugin;
