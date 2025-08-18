import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import { Attendance } from "../_model";
import { AttendanceValidator } from "../_setup";
import { Employee } from "../../employees/_model";

const employeeClock = new Elysia({ prefix: "/employee" })
    .use(isSessionAuth("employee"))
    .post("/clock", async ({ set, body, session }) => {
        try {
            const employee = await Employee.findOne({ sessionClientId: session._id })
            if (!employee) return ErrorHandler.ValidationError(set, "Employee profile not found");

            const record = await Attendance.create({
                actorType: 'employee',
                actorId: employee._id,
                action: body.action,
                timestamp: new Date()
            })

            return SuccessHandler(set, `Employee clock ${body.action}`, record, true)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error clocking employee", error)
        }
    }, AttendanceValidator.employeeClock)

export default employeeClock
