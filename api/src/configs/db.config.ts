import mongoose from "mongoose";
import chalk from "chalk";
import ora from "ora";

const connectDB = async () => {
    const dbSpinner = ora({ text: "Connecting to MongoDB...", color: "blue" }).start();

    const startTime = Date.now(); // Track connection time

    try {
        const conn = await mongoose.connect(Bun.env.MONGO_URI!);

        // Calculate the time taken for connection
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

        // On success, stop the spinner and display the success message with connection time
        dbSpinner.succeed(
            chalk.bold.greenBright(`✅ Database: `) +
            chalk.cyanBright(`Connected to ${conn.connection.host}`) +
            chalk.dim(` | Time: ${elapsedTime}s`)
        );
    } catch (error) {
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

        dbSpinner.fail(
            chalk.bold.redBright(`❌ Database: `) +
            chalk.yellowBright(`Connection failed: `) +
            (error instanceof Error
                ? chalk.whiteBright(`${error.message} (Code: ${(error as any).code ?? "Unknown"})`)
                : chalk.whiteBright("Unknown error")) +
            chalk.dim(` | Time: ${elapsedTime}s`)
        );

        process.exit(1); 
    }
};

export default connectDB;
