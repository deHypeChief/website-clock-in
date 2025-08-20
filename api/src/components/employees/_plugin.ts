import Elysia from "elysia"
import registerEmployee from "./controllers/registerEmployee.route"
import adminEmployeeCrud from "./controllers/adminEmployeeCrud.route";
import listPublicEmployees from "./controllers/listPublicEmployees.route";

const employeePlugin = new Elysia({
    prefix: "/employees"
})
    .use(registerEmployee)
    .use(listPublicEmployees)
    .use(adminEmployeeCrud)

export default employeePlugin;
