import mongoose from "mongoose";
import Referral from "../components/referral/_model";

export function generateRefToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Reward the grandparent referrer with bonus points (2nd level only).
 * @param userId The userId of the immediate referrer (Level 1)
 */
export const rewardReferralChain = async (
    userId: mongoose.Types.ObjectId,
    maxDepth: number = 1,
    rewardMap: number[] = [10000] // You can set custom rewards here
) => {
    try {
        const visited = new Set(); // Prevent circular referral loops
        let currentUserId = userId;

        for (let level = 0; level < maxDepth; level++) {
            const referral = await Referral.findOne({ userId: currentUserId });

            if (!referral?.referedBy || visited.has(referral.referedBy.toString())) break;

            const parent = await Referral.findOne({ userId: referral.referedBy });
            if (!parent) break;

            const reward = rewardMap[level] || 0;
            parent.points = (parent.points || 0) + reward;
            await parent.save();

            console.log(`Level ${level + 1}: Rewarded ${reward} points to ${parent.userId}`);

            // Track visited users to prevent infinite loops
            visited.add(referral.referedBy.toString());
            currentUserId = referral.referedBy;
        }
    } catch (error) {
        console.error("Error rewarding referral chain:", error);
    }
};
