import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Visitor } from "../_model";

const adminVisitorCrud = new Elysia({ prefix: "/admin" })
    .use(isSessionAuth("admin"))
    .get("/visitors", async ({ set }) => {
        try {
            const visitors = await Visitor.find().populate("sessionClientId");
            return SuccessHandler(set, "Visitors fetched", visitors)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error fetching visitors", error)
        }
    }, { detail: { tags: ['Admin', 'Visitor'] } })
    .get("/visitors/:id", async ({ set, params }) => {
        try {
            const visitor = await Visitor.findById((params as any).id).populate("sessionClientId");
            if (!visitor) return ErrorHandler.ValidationError(set, "Visitor not found");
            return SuccessHandler(set, "Visitor fetched", visitor)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error fetching visitor", error)
        }
    }, { detail: { tags: ['Admin', 'Visitor'] } })
    .patch("/visitors/:id", async ({ set, params, body }) => {
        try {
            const updated = await Visitor.findByIdAndUpdate((params as any).id, body as any, { new: true });
            if (!updated) return ErrorHandler.ValidationError(set, "Visitor not found");
            return SuccessHandler(set, "Visitor updated", updated)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error updating visitor", error)
        }
    }, { detail: { tags: ['Admin', 'Visitor'] } })
    .delete("/visitors/:id", async ({ set, params }) => {
        try {
            const deleted = await Visitor.findByIdAndDelete((params as any).id);
            if (!deleted) return ErrorHandler.ValidationError(set, "Visitor not found");
            return SuccessHandler(set, "Visitor deleted", deleted)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error deleting visitor", error)
        }
    }, { detail: { tags: ['Admin', 'Visitor'] } })

export default adminVisitorCrud
