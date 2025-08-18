const paystackFee = 100
const paystackRate = 1.5
const huttspotFee = 100


class ChargeHandler {
    static DepositCharge(amount: number) {
        const huttSecure = amount * (paystackRate / 100) + paystackFee + huttspotFee
        return {
            amount: amount + huttSecure,
            huttSecure
        }
    }
    static WithdrawalCharge(amount: number) {
        const huttSecure = amount * (paystackRate / 100) + paystackFee + huttspotFee
        return {
            amount: amount - huttSecure,
            huttSecure
        }
    }
}

export default ChargeHandler