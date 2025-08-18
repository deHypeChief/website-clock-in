import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import { Attendance } from "../_model";
import { AttendanceValidator } from "../_setup";
import { Visitor } from "../../visitors/_model";
import { Employee } from "../../employees/_model";
import { SessionClient } from "../../auth/_model";

const visitorClock = new Elysia({ prefix: "/visitor" })
    .use(isSessionAuth("visitor"))
    .post("/clock", async ({ set, body, session }) => {
        try {
            const visitor = await Visitor.findOne({ sessionClientId: session._id })
            if (!visitor) return ErrorHandler.ValidationError(set, "Visitor profile not found");
            const isInspection = body?.visitType === 'inspection';
            let host: any = null;
            if (!isInspection) {
                if (!body.hostEmployeeId) return ErrorHandler.ValidationError(set, "Host employee is required for regular visits");
                host = await Employee.findById(body.hostEmployeeId)
                if (!host) return ErrorHandler.ValidationError(set, "Host employee not found");
            }

            const record = await Attendance.create({
                actorType: 'visitor',
                actorId: visitor._id,
                hostEmployeeId: host?._id,
                visitType: isInspection ? 'inspection' : 'regular',
                action: body.action,
                timestamp: new Date()
            })

            return SuccessHandler(set, `Visitor clock ${body.action}`, record, true)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error clocking visitor", error)
        }
    }, AttendanceValidator.visitorClock)

export default visitorClock
