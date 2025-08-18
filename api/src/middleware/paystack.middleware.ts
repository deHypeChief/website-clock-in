import Elysia from "elysia";
import PAYSTACK from "../configs/paystack.config";


export const paystack = (app: Elysia) => app
    .derive(async function handler({ set }) {

        async function paystack_Transaction(payConfig: {
            amount: string,
            email: string,
            currency?: string,
            reference?: string,
            callback_url?: string
        }) {
            const paystackResponse = await PAYSTACK.post("/transaction/initialize", payConfig)
            return paystackResponse.data
        }

        async function paystack_GetBanks(currency: string) {
            const paystackResponse = await PAYSTACK.get(`/bank?currency=${currency}`)
            return paystackResponse.data
        }

        async function paystack_ResolveAccount(accountNumber: string, bankCode: string) {
            const paystackResponse = await PAYSTACK.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
            return paystackResponse.data
        }

        async function paystack_CreateTransferRecipient(payload: {
            type: string,
            name: string,
            account_number: string,
            bank_code: string,
            currency: string
        }) {
            const paystackResponse = await PAYSTACK.post("/transferrecipient", payload)
            return paystackResponse.data
        }

        async function paystack_MakeTransfer(payload: {
            source: "balance",
            reason: string,
            amount: number,
            recipient: string
        }) {
            const paystackResponse = await PAYSTACK.post("/transferrecipient", payload)
            return paystackResponse.data
        }

        return {
            paystack_Transaction,
            paystack_GetBanks,
            paystack_ResolveAccount,
            paystack_CreateTransferRecipient,
            paystack_MakeTransfer
        }
    })