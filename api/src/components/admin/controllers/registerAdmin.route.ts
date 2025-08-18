import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { SessionClient } from "../../auth/_model";
import { Admin } from "../_model";
import { AdminValidator } from "../_setup";

const registerAdmin = new Elysia()
    .post("/register", async ({ set, body, query }) => {
        const { email, password, fullName } = body;
        const { role } = query;

        try {
            const validRoles = ["admin", "developer", "creator"]
            if (!validRoles.includes(role)) {
                return ErrorHandler.ValidationError(set, "Invalid role provided");
            }
            const checkEmail = await SessionClient.findOne({ email })
            if (checkEmail) {
                return ErrorHandler.ValidationError(set, "The email provided is already in use.")
            }

            const newClient = await SessionClient.create({
                email,
                password,
                fullName,
                role: [role],
            })

            if (!newClient) {
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating admin session"
                );
            }

            // check adminlist
            const adminList = await Admin.find()
            const noAdmin = !adminList.some(
                admin => admin.adminTitle && admin.adminTitle.toUpperCase() === "SUPER ADMIN"
            );

            const newAdmin = await Admin.create({
                sessionClientId: newClient._id,
                adminTitle: noAdmin && role === "admin"  ? "Super Admin".toUpperCase() : role.toUpperCase(),
                permissions: noAdmin ? ["all"] : "read",
                isSuperAmdin: noAdmin,
            })

            if (!newAdmin) {
                await SessionClient.findByIdAndDelete(newClient._id)
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating admin"
                );
            }

            return SuccessHandler(
                set,
                "Admin Created",
                {
                    ...newAdmin.toObject(),
                    sessionClientId: newAdmin.sessionClientId.toString(),
                    _id: (newAdmin._id as string | { toString(): string }).toString()
                },
                true
            );

        } catch (error) {
            return ErrorHandler.ServerError(set, "Error registering admin");
        }
    }, AdminValidator.create);

export default registerAdmin