const express = require('express');
const ethers = require('ethers');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // The backend verifier key
const HABA_PER_KM = 100; // Reward calculation rate: 100 HABA per 1 Kilometer

// Haversine formula to calculate true distance between coordinate pairs
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

app.post('/api/verify-walk', async (req, res) => {
    try {
        const { userAddress, coordinates, startTimestamp, endTimestamp, sessionId } = req.body;

        if (!coordinates || coordinates.length < 2) {
            return res.status(400).json({ error: "Invalid walk session data" });
        }

        let totalDistance = 0;
        let isSpoofed = false;

        for (let i = 0; i < coordinates.length - 1; i++) {
            const p1 = coordinates[i];
            const p2 = coordinates[i + 1];

            const distance = calculateHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
            const timeDiff = (p2.timestamp - p1.timestamp) / 1000; // in seconds

            if (timeDiff <= 0) continue;

            const speedKmh = (distance / timeDiff) * 3600;

            // Anti-Cheat: Reject if speed exceeds human running capability (> 25 km/h) 
            // or is zero (teleporting scripts or mock generators)
            if (speedKmh > 25 || speedKmh < 0.5) {
                isSpoofed = true;
                break;
            }
            totalDistance += distance;
        }

        const totalTimeHours = (endTimestamp - startTimestamp) / 3600000;
        const averageSpeed = totalDistance / totalTimeHours;

        if (isSpoofed || averageSpeed > 25 || totalDistance <= 0) {
            return res.status(400).json({ error: "Walk verification failed. Cheat patterns detected." });
        }

        // Calculate token amount (18 decimals)
        const tokenRewardDecimals = ethers.parseUnits((totalDistance * HABA_PER_KM).toFixed(2), 18);
        const kmScaled = Math.round(totalDistance * 100); // Scaled uint256 for solidity

        // Cryptographically sign the payout payload
        const wallet = new ethers.Wallet(PRIVATE_KEY);
        
        // Encode payload using ABI standard identical to smart contract
        const messageHash = ethers.solidityPackedKeccak256(
            ["address", "uint256", "uint256", "bytes32"],
            [userAddress, kmScaled, tokenRewardDecimals.toString(), sessionId]
        );
        
        const signature = await wallet.signMessage(ethers.toBeArray(messageHash));

        res.json({
            success: true,
            kilometers: totalDistance.toFixed(2),
            tokenAmount: tokenRewardDecimals.toString(),
            sessionId,
            signature
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal validation error" });
    }
});

app.listen(PORT, () => console.log(`🚀 Validation Backend live on port ${PORT}`));
