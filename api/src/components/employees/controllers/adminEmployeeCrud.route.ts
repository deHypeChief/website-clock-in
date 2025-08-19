import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Employee } from "../_model";
import { SessionClient, Session } from "../../auth/_model";

const adminEmployeeCrud = new Elysia({ prefix: "/admin" })
    .use(isSessionAuth("admin"))
    .get("/employees", async ({ set, query }) => {
        try {
            const { q } = (query || {}) as any;
            let filter: any = {};
            let sessionIds: any[] | undefined;
            if (q && typeof q === 'string') {
                const regex = new RegExp(q, 'i');
                // Try match denormalized fields first
                filter.$or = [
                    { fullName: regex },
                    { employeeId: regex },
                    { department: regex }
                ];
                // Also search SessionClient.fullName and include those IDs
                const sessions = await SessionClient.find({ fullName: regex }).select('_id');
                sessionIds = sessions.map(s => s._id);
            }
            const q1 = await Employee.find(filter).populate("sessionClientId");
            if (sessionIds && sessionIds.length > 0) {
                const extra = await Employee.find({ sessionClientId: { $in: sessionIds } }).populate("sessionClientId");
                // merge unique
                const map = new Map<string, any>();
                [...q1, ...extra].forEach(e => map.set((e as any)._id.toString(), e));
                return SuccessHandler(set, "Employees fetched", Array.from(map.values()))
            }
            const employees = q1;
            return SuccessHandler(set, "Employees fetched", employees)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error fetching employees", error)
        }
    }, { detail: { tags: ['Admin', 'Employee'] } })
    .get("/employees/:id", async ({ set, params }) => {
        try {
            const employee = await Employee.findById((params as any).id).populate("sessionClientId");
            if (!employee) return ErrorHandler.ValidationError(set, "Employee not found");
            return SuccessHandler(set, "Employee fetched", employee)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error fetching employee", error)
        }
    }, { detail: { tags: ['Admin', 'Employee'] } })
    .patch("/employees/:id", async ({ set, params, body }) => {
        try {
            const emp = await Employee.findById((params as any).id);
            if (!emp) return ErrorHandler.ValidationError(set, "Employee not found");
            const payload = body as any;
            // Update own fields
            if (payload.employeeId) emp.employeeId = payload.employeeId;
            if (payload.department !== undefined) emp.department = payload.department;
            if (payload.title !== undefined) emp.title = payload.title;
            if (payload.fullName !== undefined) emp.fullName = payload.fullName;

            // If session client fields provided, update referenced doc
            if (payload.sessionClientId && typeof payload.sessionClientId === 'object') {
                const scUpdate: any = {};
                if (payload.sessionClientId.fullName || payload.sessionClientId.name) {
                    scUpdate.fullName = payload.sessionClientId.fullName || payload.sessionClientId.name;
                    // keep denormalized in sync
                    emp.fullName = scUpdate.fullName;
                }
                if (payload.sessionClientId.email) scUpdate.email = payload.sessionClientId.email;
                if (payload.sessionClientId.password) scUpdate.password = payload.sessionClientId.password;
                if (Object.keys(scUpdate).length > 0) {
                    await SessionClient.findByIdAndUpdate(emp.sessionClientId, scUpdate, { new: false });
                }
            }

            const saved = await emp.save();
            const populated = await saved.populate('sessionClientId');
            return SuccessHandler(set, "Employee updated", populated)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error updating employee", error)
        }
    }, { detail: { tags: ['Admin', 'Employee'] } })
    .delete("/employees/:id", async ({ set, params }) => {
        try {
            const emp = await Employee.findById((params as any).id);
            if (!emp) return ErrorHandler.ValidationError(set, "Employee not found");

            const sessionClientId = (emp as any).sessionClientId;

            // Delete the employee first
            await Employee.findByIdAndDelete((params as any).id);

            // Cascade delete: remove associated sessions and session client
            if (sessionClientId) {
                try {
                    await Session.deleteMany({ sessionClientId });
                } catch (_) { /* no-op */ }
                await SessionClient.findByIdAndDelete(sessionClientId);
            }

            return SuccessHandler(set, "Employee and linked session client deleted", { employeeId: (emp as any)._id, sessionClientId })
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error deleting employee", error)
        }
    }, { detail: { tags: ['Admin', 'Employee'] } })

export default adminEmployeeCrud
