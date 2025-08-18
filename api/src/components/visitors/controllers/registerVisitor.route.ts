import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { SessionClient } from "../../auth/_model";
import { Visitor } from "../_model";
import { VisitorValidator } from "../_setup";

const registerVisitor = new Elysia()
    .post("/register", async ({ set, body }) => {
        const { email, password, fullName, profile, name, phone } = body as any;

        try {
            const checkEmail = await SessionClient.findOne({ email })
            if (checkEmail) {
                return ErrorHandler.ValidationError(set, "The email provided is already in use.")
            }

            const newClient = await SessionClient.create({
                email,
                password,
                fullName,
                role: ["visitor"],
                profile
            })

            if (!newClient) {
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating visitor session"
                );
            }

            const newVisitor = await Visitor.create({
                sessionClientId: newClient._id,
                name,
                phone
            })

            if (!newVisitor) {
                await SessionClient.findByIdAndDelete(newClient._id)
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating visitor"
                );
            }

            return SuccessHandler(
                set,
                "Visitor Created",
                {
                    visitor: newVisitor,
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error registering visitor",
                error
            );
        }
    }, VisitorValidator.create)

export default registerVisitor
