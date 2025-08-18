import Elysia from "elysia"
import registerVisitor from "./controllers/registerVisitor.route"
import signVisitor from "./controllers/signVisitor.route";
import adminVisitorCrud from "./controllers/adminVisitorCrud.route";

const visitorPlugin = new Elysia({
    prefix: "/visitors"
})
    .use(registerVisitor)
    .use(signVisitor)
    .use(adminVisitorCrud)

export default visitorPlugin;
