import Elysia from "elysia";
import SuccessHandler from "../../../services/successHandler.service";
import ErrorHandler from "../../../services/errorHandler.service";
import { Admin } from "../_model";

const checkAdminExists = new Elysia()
    .get("/exists", async ({ set }) => {
        try {
            const count = await Admin.countDocuments({ adminTitle: /ADMIN/i });
            return SuccessHandler(set, "Admin existence status", { exists: count > 0 }, true);
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error checking admin existence", error);
        }
    });

export default checkAdminExists;
