// // Simple pose matching approach
// // Compares live MediaPipe coordinates with model coordinates

// function normalizeKeyPoints(landmarks) {
//     if (!landmarks || landmarks.length === 0) return [];
    
//     // Get bounding box
//     const xs = landmarks.map(p => p.x);
//     const ys = landmarks.map(p => p.y);
//     const zs = landmarks.map(p => p.z);
    
//     const minX = Math.min(...xs);
//     const maxX = Math.max(...xs);
//     const minY = Math.min(...ys);
//     const maxY = Math.max(...ys);
//     const minZ = Math.min(...zs);
//     const maxZ = Math.max(...zs);
    
//     // Normalize to 0-1 range
//     return landmarks.map(point => ({
//         x: (point.x - minX) / (maxX - minX + 1e-8),
//         y: (point.y - minY) / (maxY - minY + 1e-8),
//         z: (point.z - minZ) / (maxZ - minZ + 1e-8),
//         visibility: point.visibility || 1
//     }));
// }

// function calculateDistance(point1, point2) {
//     const dx = point1.x - point2.x;
//     const dy = point1.y - point2.y;
//     const dz = point1.z - point2.z;
//     return Math.sqrt(dx * dx + dy * dy + dz * dz);
// }

// function calculateAngle(p1, p2, p3) {
//     // Calculate angle at p2 formed by p1-p2-p3
//     const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
//     const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
    
//     const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
//     const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
//     const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    
//     if (mag1 === 0 || mag2 === 0) return 0;
    
//     const cos_angle = dot / (mag1 * mag2);
//     return Math.acos(Math.max(-1, Math.min(1, cos_angle)));
// }

// function calculateBodyPartSimilarity(livePoints, modelPoints, indices) {
//     if (indices.length < 2) return 0;
    
//     let totalSimilarity = 0;
//     let comparisons = 0;
    
//     // Compare distances between key points
//     for (let i = 0; i < indices.length; i++) {
//         for (let j = i + 1; j < indices.length; j++) {
//             const idx1 = indices[i];
//             const idx2 = indices[j];
            
//             if (idx1 >= livePoints.length || idx2 >= livePoints.length ||
//                 idx1 >= modelPoints.length || idx2 >= modelPoints.length) {
//                 continue;
//             }
            
//             const liveDist = calculateDistance(livePoints[idx1], livePoints[idx2]);
//             const modelDist = calculateDistance(modelPoints[idx1], modelPoints[idx2]);
            
//             // Calculate similarity based on distance ratio
//             const ratio = Math.min(liveDist, modelDist) / (Math.max(liveDist, modelDist) + 1e-8);
//             totalSimilarity += ratio;
//             comparisons++;
//         }
//     }
    
//     // Compare angles if we have enough points
//     if (indices.length >= 3) {
//         for (let i = 0; i < indices.length - 2; i++) {
//             const idx1 = indices[i];
//             const idx2 = indices[i + 1];
//             const idx3 = indices[i + 2];
            
//             if (idx1 >= livePoints.length || idx2 >= livePoints.length || idx3 >= livePoints.length ||
//                 idx1 >= modelPoints.length || idx2 >= modelPoints.length || idx3 >= modelPoints.length) {
//                 continue;
//             }
            
//             const liveAngle = calculateAngle(livePoints[idx1], livePoints[idx2], livePoints[idx3]);
//             const modelAngle = calculateAngle(modelPoints[idx1], modelPoints[idx2], modelPoints[idx3]);
            
//             // Angle similarity (closer to 1 means more similar)
//             const angleDiff = Math.abs(liveAngle - modelAngle);
//             const angleSimilarity = 1 - (angleDiff / Math.PI); // Normalize by PI
            
//             totalSimilarity += angleSimilarity;
//             comparisons++;
//         }
//     }
    
//     return comparisons > 0 ? totalSimilarity / comparisons : 0;
// }

// // Key body parts with their landmark indices (MediaPipe pose landmarks)
// const bodyParts = {
//     torso: [11, 12, 23, 24], // shoulders and hips
//     leftArm: [11, 13, 15, 19], // left shoulder, elbow, wrist, pinky
//     rightArm: [12, 14, 16, 20], // right shoulder, elbow, wrist, pinky
//     leftLeg: [23, 25, 27, 31], // left hip, knee, ankle, heel
//     rightLeg: [24, 26, 28, 32], // right hip, knee, ankle, heel
//     head: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // face landmarks
//     spine: [11, 12, 23, 24] // shoulders and hips for posture
// };

// // Weights for different body parts (more important parts get higher weights)
// const bodyPartWeights = {
//     torso: 0.25,
//     leftArm: 0.2,
//     rightArm: 0.2,
//     leftLeg: 0.15,
//     rightLeg: 0.15,
//     head: 0.05,
//     spine: 0.0 // Don't double count with torso
// };

// function calculateOverallSimilarity(liveData, modelLandmarks) {
//     const liveLandmarks = liveData.pose;
//     if (!liveLandmarks || !modelLandmarks) return 0;
    
//     // Check if we have enough landmarks
//     if (liveLandmarks.length < 33 || modelLandmarks.length < 33) {
//         console.warn('Insufficient landmarks for pose comparison');
//         return 0;
//     }
    
//     // Normalize both sets of landmarks
//     const normalizedLive = normalizeKeyPoints(liveLandmarks);
//     const normalizedModel = normalizeKeyPoints(modelLandmarks);
    
//     let totalWeightedSimilarity = 0;
//     let totalWeight = 0;
    
//     // Calculate similarity for each body part
//     for (const [partName, indices] of Object.entries(bodyParts)) {
//         const weight = bodyPartWeights[partName] || 0;
//         if (weight === 0) continue;
        
//         const partSimilarity = calculateBodyPartSimilarity(normalizedLive, normalizedModel, indices);
        
//         totalWeightedSimilarity += partSimilarity * weight;
//         totalWeight += weight;
//     }
    
//     // Calculate overall similarity percentage
//     const overallSimilarity = totalWeight > 0 ? (totalWeightedSimilarity / totalWeight) : 0;
    
//     // Convert to percentage (0-100)
//     return Math.max(0, Math.min(100, overallSimilarity * 100));
// }

// // Alternative simple approach - just compare normalized positions directly
// function calculateSimplePositionSimilarity(liveData, modelLandmarks) {
//     const liveLandmarks = liveData.pose;
//     if (!liveLandmarks || !modelLandmarks) return 0;
    
//     if (liveLandmarks.length !== modelLandmarks.length) return 0;
    
//     const normalizedLive = normalizeKeyPoints(liveLandmarks);
//     const normalizedModel = normalizeKeyPoints(modelLandmarks);
    
//     let totalSimilarity = 0;
//     let validPoints = 0;
    
//     // Important landmarks indices (focus on key body points)
//     const importantIndices = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    
//     for (const i of importantIndices) {
//         if (i >= normalizedLive.length || i >= normalizedModel.length) continue;
        
//         const livePoint = normalizedLive[i];
//         const modelPoint = normalizedModel[i];
        
//         // Skip if visibility is too low
//         if (livePoint.visibility < 0.5 || modelPoint.visibility < 0.5) continue;
        
//         const distance = calculateDistance(livePoint, modelPoint);
//         const similarity = Math.exp(-distance * 5); // Exponential decay for similarity
        
//         totalSimilarity += similarity;
//         validPoints++;
//     }
    
//     if (validPoints === 0) return 0;
    
//     return (totalSimilarity / validPoints) * 100;
// }

// module.exports = {
//     calculateOverallSimilarity,
//     calculateSimplePositionSimilarity
// };
// Simple pose matching approach
// Compares live MediaPipe coordinates with model coordinates

function normalizeKeyPoints(landmarks) {
    if (!landmarks || landmarks.length === 0) return [];
    
    // Get bounding box
    const xs = landmarks.map(p => p.x);
    const ys = landmarks.map(p => p.y);
    const zs = landmarks.map(p => p.z);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    
    // Normalize to 0-1 range
    return landmarks.map(point => ({
        x: (point.x - minX) / (maxX - minX + 1e-8),
        y: (point.y - minY) / (maxY - minY + 1e-8),
        z: (point.z - minZ) / (maxZ - minZ + 1e-8),
        visibility: point.visibility || 1
    }));
}

function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateAngle(p1, p2, p3) {
    // Calculate angle at p2 formed by p1-p2-p3
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
    
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cos_angle = dot / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cos_angle)));
}

function calculateBodyPartSimilarity(livePoints, modelPoints, indices) {
    if (indices.length < 2) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    // Compare distances between key points
    for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
            const idx1 = indices[i];
            const idx2 = indices[j];
            
            if (idx1 >= livePoints.length || idx2 >= livePoints.length ||
                idx1 >= modelPoints.length || idx2 >= modelPoints.length) {
                continue;
            }
            
            const liveDist = calculateDistance(livePoints[idx1], livePoints[idx2]);
            const modelDist = calculateDistance(modelPoints[idx1], modelPoints[idx2]);
            
            // Calculate similarity based on distance ratio
            const ratio = Math.min(liveDist, modelDist) / (Math.max(liveDist, modelDist) + 1e-8);
            totalSimilarity += ratio;
            comparisons++;
        }
    }
    
    // Compare angles if we have enough points
    if (indices.length >= 3) {
        for (let i = 0; i < indices.length - 2; i++) {
            const idx1 = indices[i];
            const idx2 = indices[i + 1];
            const idx3 = indices[i + 2];
            
            if (idx1 >= livePoints.length || idx2 >= livePoints.length || idx3 >= livePoints.length ||
                idx1 >= modelPoints.length || idx2 >= modelPoints.length || idx3 >= modelPoints.length) {
                continue;
            }
            
            const liveAngle = calculateAngle(livePoints[idx1], livePoints[idx2], livePoints[idx3]);
            const modelAngle = calculateAngle(modelPoints[idx1], modelPoints[idx2], modelPoints[idx3]);
            
            // Angle similarity (closer to 1 means more similar)
            const angleDiff = Math.abs(liveAngle - modelAngle);
            const angleSimilarity = 1 - (angleDiff / Math.PI); // Normalize by PI
            
            totalSimilarity += angleSimilarity;
            comparisons++;
        }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
}

// Key body parts with their landmark indices (MediaPipe pose landmarks)
const bodyParts = {
    torso: [11, 12, 23, 24], // shoulders and hips
    leftArm: [11, 13, 15, 19], // left shoulder, elbow, wrist, pinky
    rightArm: [12, 14, 16, 20], // right shoulder, elbow, wrist, pinky
    leftLeg: [23, 25, 27, 31], // left hip, knee, ankle, heel
    rightLeg: [24, 26, 28, 32], // right hip, knee, ankle, heel
    head: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // face landmarks
    spine: [11, 12, 23, 24] // shoulders and hips for posture
};

// Weights for different body parts (more important parts get higher weights)
const bodyPartWeights = {
    torso: 0.25,
    leftArm: 0.2,
    rightArm: 0.2,
    leftLeg: 0.15,
    rightLeg: 0.15,
    head: 0.05,
    spine: 0.0 // Don't double count with torso
};

function calculateOverallSimilarity(liveData, modelLandmarks) {
    const liveLandmarks = liveData.pose;
    if (!liveLandmarks || !modelLandmarks) return 0;
    
    // Check if we have enough landmarks
    if (liveLandmarks.length < 33 || modelLandmarks.length < 33) {
        console.warn('Insufficient landmarks for pose comparison');
        return 0;
    }
    
    // Normalize both sets of landmarks
    const normalizedLive = normalizeKeyPoints(liveLandmarks);
    const normalizedModel = normalizeKeyPoints(modelLandmarks);
    
    let totalWeightedSimilarity = 0;
    let totalWeight = 0;
    
    // Calculate similarity for each body part
    for (const [partName, indices] of Object.entries(bodyParts)) {
        const weight = bodyPartWeights[partName] || 0;
        if (weight === 0) continue;
        
        const partSimilarity = calculateBodyPartSimilarity(normalizedLive, normalizedModel, indices);
        
        totalWeightedSimilarity += partSimilarity * weight;
        totalWeight += weight;
    }
    
    // Calculate overall similarity percentage
    const overallSimilarity = totalWeight > 0 ? (totalWeightedSimilarity / totalWeight) : 0;
    
    // Convert to percentage (0-100)
    return Math.max(0, Math.min(100, overallSimilarity * 100));
}

// Alternative simple approach - just compare normalized positions directly
function calculateSimplePositionSimilarity(liveData, modelLandmarks) {
    const liveLandmarks = liveData.pose;
    if (!liveLandmarks || !modelLandmarks) return 0;
    
    if (liveLandmarks.length !== modelLandmarks.length) return 0;
    
    const normalizedLive = normalizeKeyPoints(liveLandmarks);
    const normalizedModel = normalizeKeyPoints(modelLandmarks);
    
    let totalSimilarity = 0;
    let validPoints = 0;
    
    // Important landmarks indices (focus on key body points)
    const importantIndices = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    
    for (const i of importantIndices) {
        if (i >= normalizedLive.length || i >= normalizedModel.length) continue;
        
        const livePoint = normalizedLive[i];
        const modelPoint = normalizedModel[i];
        
        // Skip if visibility is too low
        if (livePoint.visibility < 0.5 || modelPoint.visibility < 0.5) continue;
        
        const distance = calculateDistance(livePoint, modelPoint);
        const similarity = Math.exp(-distance * 5); // Exponential decay for similarity
        
        totalSimilarity += similarity;
        validPoints++;
    }
    
    if (validPoints === 0) return 0;
    
    return (totalSimilarity / validPoints) * 100;
}

// Smoothing class to reduce fluctuations
class SimilaritySmoothing {
    constructor(windowSize = 10, alpha = 0.3) {
        this.windowSize = windowSize;
        this.alpha = alpha; // Exponential smoothing factor
        this.history = [];
        this.exponentialAverage = null;
    }
    
    addValue(value) {
        // Add to history
        this.history.push(value);
        if (this.history.length > this.windowSize) {
            this.history.shift();
        }
        
        // Calculate moving average
        const movingAverage = this.history.reduce((sum, val) => sum + val, 0) / this.history.length;
        
        // Calculate exponential moving average
        if (this.exponentialAverage === null) {
            this.exponentialAverage = value;
        } else {
            this.exponentialAverage = this.alpha * value + (1 - this.alpha) * this.exponentialAverage;
        }
        
        // Return weighted combination of both smoothing methods
        return 0.7 * this.exponentialAverage + 0.3 * movingAverage;
    }
    
    reset() {
        this.history = [];
        this.exponentialAverage = null;
    }
}

// Global smoothing instances
const comprehensiveSmoothing = new SimilaritySmoothing(8, 0.25);
const simpleSmoothing = new SimilaritySmoothing(8, 0.25);
const overallSmoothing = new SimilaritySmoothing(10, 0.2);

function calculateSmoothedOverallSimilarity(liveData, modelLandmarks) {
    const comprehensive = calculateOverallSimilarity(liveData, modelLandmarks);
    const simple = calculateSimplePositionSimilarity(liveData, modelLandmarks);
    
    const smoothedComprehensive = comprehensiveSmoothing.addValue(comprehensive);
    const smoothedSimple = simpleSmoothing.addValue(simple);
    
    const combined = (smoothedComprehensive + smoothedSimple) / 2;
    const smoothedOverall = overallSmoothing.addValue(combined);
    
    return {
        similarity: smoothedOverall,
        comprehensive: smoothedComprehensive,
        simple: smoothedSimple,
        raw: {
            comprehensive: comprehensive,
            simple: simple
        }
    };
}

module.exports = {
    calculateOverallSimilarity,
    calculateSimplePositionSimilarity,
    calculateSmoothedOverallSimilarity
};