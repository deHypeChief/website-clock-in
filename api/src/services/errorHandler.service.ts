import { StatusMap } from "elysia";
import { ElysiaCookie } from "elysia/dist/cookies";
import { HTTPHeaders } from "elysia/dist/types";

class ErrorHandler {
    // Main function to handle different types of errors
    static handleError(set: {
        headers: HTTPHeaders; status?: number | string;
        redirect?: string; cookie?: Record<string, ElysiaCookie>
    },
        errorType: "Validation" | "Unauthorized" | "Forbidden" | "NotFound" | "Server",
        message: string, errorDetails?: any) {
        // Set the status code based on the error type
        const statusCodes: Record<string, number> = {
            Validation: 400,
            Unauthorized: 401,
            Forbidden: 403,
            NotFound: 404,
            Server: 500,
        };
        set.status = statusCodes[errorType] || 500;

        // Log the error with detailed information
        this.logError(errorType, message, errorDetails);

        // Return the error response
        return {
            success: false,
            type: `${errorType} Error`,
            message,
            ...(errorType === "Server" && { error: {
                message: errorDetails?.message,
                stack: errorDetails?.stack,
            } }),
        };
    }

    // Function to log errors with more details
    private static logError(type: string, message: string, error?: any) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ${type}: ${message}`);
        if (error) {
            console.error("Error Details:", {
                message: error.message,
                stack: error.stack,
                error,
            });
        }
    }

    // Error shorthand methods
    static ValidationError(set: { headers: HTTPHeaders; status?: number | string; redirect?: string; cookie?: Record<string, ElysiaCookie> }, message: string, errorDetails?: any) {
        return this.handleError(set, "Validation", message, errorDetails);
    }

    static UnauthorizedError(set: { headers: HTTPHeaders; status?: number | string; redirect?: string; cookie?: Record<string, ElysiaCookie> }, message: string, errorDetails?: any) {
        return this.handleError(set, "Unauthorized", message, errorDetails);
    }

    static ForbiddenError(set: { headers: HTTPHeaders; status?: number | string; redirect?: string; cookie?: Record<string, ElysiaCookie> }, message: string, errorDetails?: any) {
        return this.handleError(set, "Forbidden", message, errorDetails);
    }

    static NotFoundError(set: { headers: HTTPHeaders; status?: number | string; redirect?: string; cookie?: Record<string, ElysiaCookie> }, message: string, errorDetails?: any) {
        return this.handleError(set, "NotFound", message, errorDetails);
    }

    static ServerError(set: { headers: HTTPHeaders; status?: number | string; redirect?: string; cookie?: Record<string, ElysiaCookie> }, message: string, errorDetails?: any) {
        return this.handleError(set, "Server", message, errorDetails);
    }
}

export default ErrorHandler;
