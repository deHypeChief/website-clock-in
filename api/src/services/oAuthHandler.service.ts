import { SessionClient } from "../components/auth/_model";
import { googleOAuth } from "../configs/oAuth.config";



type OAuthRedirectParams =
    | { type: "google" | "instagram" }
    | { type: "x"; xUsername: string };

class OAuthHandler {
    public static async getRedirect(params: OAuthRedirectParams) {
        let oAuth, message;

        switch (params.type) {
            case "google":
                oAuth = await this.linkGoogle();
                message = "Redirect to Google";
                break;

            default:
                throw new Error("Unsupported OAuth type");
        }

        return {
            message,
            oAuth
        };
    }

    public static async linkGoogle() {
        const googleAuthURL = googleOAuth.getAuthURL();
        return { googleAuthURL };
    }
}


export default OAuthHandler