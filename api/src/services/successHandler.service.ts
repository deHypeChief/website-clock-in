import { ElysiaCookie } from "elysia/dist/cookies";
import { HTTPHeaders } from "elysia/dist/types";

export default function SuccessHandler(set: {
    headers: HTTPHeaders; status?: number | string;
    redirect?: string; cookie?: Record<string, ElysiaCookie>
}, message: string, data?: any, created?: boolean) {
    set.status = created ? 201 : 200;
    return {
        success: true,
        message,
        data
    }
}