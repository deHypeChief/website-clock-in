import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Attendance } from "../_model";

function parseDate(dateStr?: string) {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
}

const reports = new Elysia({ prefix: "/admin" })
    .use(isSessionAuth("admin"))
    .get("/summary/daily", async ({ set, query }) => {
        try {
            const date = parseDate((query as any)?.date);
            const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            const result = await Attendance.aggregate([
                { $match: { timestamp: { $gte: start, $lt: end } } },
                { $group: { _id: { actorType: "$actorType", action: "$action" }, count: { $sum: 1 } } }
            ]);

            return SuccessHandler(set, "Daily summary", result)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error generating daily summary", error)
        }
    }, { detail: { tags: ['Attendance', 'Admin'] } })
    .get("/totals/employee/:employeeId", async ({ set, params, query }) => {
        try {
            const { employeeId } = params as any;
            const from = (query as any)?.from ? new Date((query as any).from) : undefined;
            const to = (query as any)?.to ? new Date((query as any).to) : undefined;
            const match: any = { actorType: 'employee', actorId: new (await import('mongoose')).default.Types.ObjectId(employeeId) };
            if (from || to) {
                match.timestamp = {} as any;
                if (from) (match.timestamp as any).$gte = from;
                if (to) (match.timestamp as any).$lte = to;
            }
            const result = await Attendance.aggregate([
                { $match: match },
                { $group: { _id: "$action", count: { $sum: 1 } } }
            ]);
            return SuccessHandler(set, "Employee totals", result)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error generating employee totals", error)
        }
    }, { detail: { tags: ['Attendance', 'Admin'] } })

export default reports
