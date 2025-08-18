import Elysia from "elysia";
// import jobs from "./controllers";


const cronPlugin = new Elysia({
    prefix: "/jobs" 
})
    // .use(jobs)

export default cronPlugin