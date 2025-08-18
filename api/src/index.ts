import { Elysia } from "elysia";
import chalk from "chalk";
import ora from "ora";
import connectDB from "./configs/db.config";
import routes from "./utils/routes";
import swaggerConfig from "./configs/swagger.config";
import swagger from "@elysiajs/swagger";
import { allowedOrigins } from "./configs/origin.config";
import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";

const server = async () => {
	// Start the total startup timer
	const start = Date.now();

	// Spinner for DB + server startup
	const spinner = ora({ text: "Connecting to database...", color: "cyan" }).start();

	// 🌐 Connect DB
	try {
		await connectDB();
		spinner.text = "Starting the server...";
	} catch (err) {
		spinner.fail(chalk.redBright("❌ Failed to connect to the database!"));
		throw err;
	}

	// 🚀 Start Elysia app
	const app = new Elysia({
		serve: { idleTimeout: 100 }, // 30 seconds idle timeout
	})
		.use(
			staticPlugin({
				prefix: '/static',
				assets: './static',
			})
		)
	.use(swagger(swaggerConfig))
	.use(cors({ origin: allowedOrigins, credentials: true }))
		.use(routes)
		.listen(Bun.env.PORT || 3000);
	
	// 🎉 Final success message
	const startupTime = Date.now() - start;
	spinner.succeed(
		chalk.bold.greenBright(`🟢 Server Ready: `) +
		chalk.cyanBright(`http://${app.server?.hostname || "localhost"}:${app.server?.port || 3000}`) +
		chalk.dim(` | Booted in ${(startupTime / 1000).toFixed(2)}s`)
	);

	return app;
};

// Boot the server
server().catch((err) => {
	console.error(chalk.bold.redBright("❌ Server crashed on startup:"), err);
	process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
	console.log(chalk.yellowBright('\n📴 Shutting down gracefully...'));
	
	try {		
		console.log(chalk.greenBright('✅ Server shutdown complete'));
		process.exit(0);
	} catch (error) {
		console.error(chalk.redBright('❌ Error during shutdown:'), error);
		process.exit(1);
	}
});

export default server;
