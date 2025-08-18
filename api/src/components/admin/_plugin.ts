import Elysia from "elysia";
import registerAdmin from "./controllers/registerAdmin.route";
import signAdmin from "./controllers/signAdmin.route";
import passwordReset from "./controllers/passwordReset.route";
import passwordChange from "./controllers/passwordChange.route";

const adminPlugin = new Elysia({
    prefix: "/admins"
})
    .use(registerAdmin)
    .use(signAdmin)
    .use(passwordReset)
    .use(passwordChange)

export default adminPlugin;