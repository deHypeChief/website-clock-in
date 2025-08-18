import nodemailer from 'nodemailer';
import ora from 'ora';
import chalk from 'chalk';

// Create the transport object
const mailConfig = nodemailer.createTransport({
    service: Bun.env.EMAIL_SERVICE,
    auth: {
        user: Bun.env.EMAIL,
        pass: Bun.env.EMAIL_PASSWORD,
    },
});

// Create a spinner for loading indication
const spinner = ora({ text: 'Connecting to SMTP...', color: 'blue' }).start();

// Attempt to verify the connection
mailConfig.verify((error) => {
    if (error) {
        // Stop the spinner and show an error message with color
        spinner.fail(
            chalk.bold.redBright('❌ SMTP Connection Failed: ') +
            chalk.whiteBright(`Error: ${error}`) +
            chalk.dim(` | Code: ${((error as any).code ?? 'Unknown')}`)
        );
    } else {
        // Stop the spinner and show a success message with color
        spinner.succeed(
            chalk.bold.greenBright('✅ SMTP Connection Successful!') +
            chalk.dim(' | Server: ' + Bun.env.EMAIL_SERVICE)  //update with env
        );
    }
});

export default mailConfig;
