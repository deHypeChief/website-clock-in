import Elysia from "elysia";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { SessionClient } from "../../auth/_model";
import { User } from "../_model";
import { UserValidator } from "../_setup";

const adminHandleUsers = new Elysia({
    prefix: "/admin"
})
    .use(isSessionAuth("admin"))
    .get("/getUsers", async ({ set }) => {
        try {
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);


            const users = await User.find().populate("sessionClientId");

            // Metrics aggregation
            const metrics = await SessionClient.aggregate([
                {
                    $match: {
                        role: { $nin: ["admin"] }
                    }
                },
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        thisMonth: [
                            { $match: { createdAt: { $gte: startOfThisMonth } } },
                            { $count: "count" }
                        ],
                        lastMonth: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: startOfLastMonth,
                                        $lte: endOfLastMonth
                                    }
                                }
                            },
                            { $count: "count" }
                        ],
                        verified: [
                            { $match: { isEmailVerified: true } },
                            { $count: "count" }
                        ],
                        referrals: [
                            { $match: { refCount: { $gt: 0 } } },
                            { $count: "count" }
                        ]
                    }
                }
            ]);

            // Extract metrics safely
            const {
                total = [],
                thisMonth = [],
                lastMonth = [],
                verified = [],
                referrals = []
            } = metrics[0] || {};

            const totalUsers = total[0]?.count || 0;
            const thisMonthUsers = thisMonth[0]?.count || 0;
            const lastMonthUsers = lastMonth[0]?.count || 0;
            const verifiedUsers = verified[0]?.count || 0;
            const referralUsers = referrals[0]?.count || 0;

            const trendingChange = lastMonthUsers === 0
                ? 100
                : ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

            return SuccessHandler(
                set,
                "Users and analytics fetched",
                {
                    totalUsers,
                    users,
                    verifiedUsers,
                    referralUsers,
                    thisMonthUsers,
                    lastMonthUsers,
                    trendingChange: Number(trendingChange.toFixed(1)) // e.g., +12.5%
                }
            );

        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error fetching users and metrics",
                error
            );
        }
    }, UserValidator.getUser);

export default adminHandleUsers