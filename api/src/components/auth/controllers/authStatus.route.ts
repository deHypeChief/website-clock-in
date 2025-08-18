import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Admin } from "../../admin/_model";
import { AdminValidator } from "../../admin/_setup";
import { EmployeeValidator } from "../../employees/_setup";
import { VisitorValidator } from "../../visitors/_setup";
import { Employee } from "../../employees/_model";
import { Visitor } from "../../visitors/_model";

const adminAuthStatus = new Elysia()
    .use(isSessionAuth("admin"))
    .get("/status/admin", async ({ set, session }) => {
        try {
            const adminSessionClient = await Admin.findOne({ sessionClientId: session._id })
                .select("-password");

            return SuccessHandler(set, "Admin Authenticated", {
                isAuthenticated: true,
                session,
                admin: adminSessionClient
            }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, "Error getting admin status", error);
        }
    }, AdminValidator.authStatus)

const employeeAuthStatus = new Elysia()
    .use(isSessionAuth("employee"))
    .get("/status/employee", async ({ set, session }) => {
        try {
            const employeeSessionClient = await Employee.findOne({ sessionClientId: session._id })
                .select("-password");

            return SuccessHandler(set, "Employee Authenticated", {
                isAuthenticated: true,
                session,
                employee: employeeSessionClient
            }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, "Error getting employee status", error);
        }
    }, EmployeeValidator.authStatus)

const visitorAuthStatus = new Elysia()
    .use(isSessionAuth("visitor"))
    .get("/status/visitor", async ({ set, session }) => {
        try {
            const visitorSessionClient = await Visitor.findOne({ sessionClientId: session._id })
                .select("-password");

            return SuccessHandler(set, "Visitor Authenticated", {
                isAuthenticated: true,
                session,
                visitor: visitorSessionClient
            }, true);
        } catch (error) {
            throw ErrorHandler.ServerError(set, "Error getting visitor status", error);
        }
    }, VisitorValidator.authStatus)

export { adminAuthStatus, employeeAuthStatus, visitorAuthStatus };
