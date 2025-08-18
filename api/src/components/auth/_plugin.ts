import Elysia from "elysia";
import getSessions from "./controllers/getSessions.route";
import { adminAuthStatus, employeeAuthStatus, visitorAuthStatus } from "./controllers/authStatus.route";
import manageOTP from "./controllers/otp.routes";
import logout from "./controllers/logout.route";

const authPlugin = new Elysia({
    prefix: "/auth"
})
    .use(getSessions)
    .use(adminAuthStatus)
    .use(employeeAuthStatus)
    .use(visitorAuthStatus)
    .use(manageOTP)
    .use(logout)

export default authPlugin
