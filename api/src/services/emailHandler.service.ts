import mailConfig from "../configs/email.config";
import ora from 'ora';
import chalk from 'chalk';

class EmailHandler {
    static async send(to: string, subject: string, template: string) {
        const mailOptions = {
            from: Bun.env.EMAIL,
            to,
            subject,
            html: template,
        };

        await mailConfig.sendMail(mailOptions, (error, info) => {
            const spinner = ora({ text: 'Sending mail...', color: 'blue' }).start();
            if (error) {
                // Stop the spinner and show an error message with color
                spinner.fail(
                    chalk.bold.redBright('❌ Error sending mail: ') +
                    chalk.whiteBright(`Error: ${error.message}`) +
                    chalk.dim(` | Code: ${((error as any).code ?? 'Unknown')}`)
                );
            }

            // Stop the spinner and show a success message with color
            spinner.succeed(
                chalk.bold.greenBright('✅ Email Sent') +
                chalk.dim(' | Reciver : ' + to)  //update with env
            );
        });
    }


    static async convertImageToBase64(imageUrl: string): Promise<string> {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = response.headers.get('content-type') || 'image/png';
            return `data:${mimeType};base64,${base64}`;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error converting image to Base64: ${error.message}`);
            } else {
                throw new Error('Error converting image to Base64: Unknown error');
            }
        }
    }
}

export default EmailHandler