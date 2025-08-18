import { cron, Patterns } from "@elysiajs/cron";
import Elysia from "elysia";
import axios from "axios"; // Use axios or any HTTP client to call the endpoint

export const verifyJobPlugin = new Elysia({
    name: "cron_Verify"
})
    .use(
        cron({
            name: 'verifyTask',
            pattern: Patterns.EVERY_10_SECONDS, // Runs daily at midnight; adjust as necessary
            async run() {
                console.log('Running verification job...');
                try {
                    // Call the existing endpoint to remove expired memberships
                    const response = await axios.get(`${Bun.env.ACTIVE_API_ORIGIN}/jobs/verifyTask`);

                    console.log('Verification Task', response.data);
                } catch (err) {
                    console.error("Error while calling the verifyTask endpoint:", err);
                }
            }
        })
    );
