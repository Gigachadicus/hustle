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

// // FIXED: This function was completely broken
// function normalizeWeights(impPoints) {
//     console.log('Normalizing weights for important parts:', impPoints);
    
//     // Create a copy of base weights
//     const weights = {
//         torso: 25,
//         leftArm: 20,
//         rightArm: 20,
//         leftLeg: 15,
//         rightLeg: 15,
//         head: 5,
//         spine: 0
//     };
    
//     // Boost weights for important parts
//     if (Array.isArray(impPoints)) {
//         impPoints.forEach(partName => {
//             if (weights.hasOwnProperty(partName)) {
//                 weights[partName] += 15; // Boost important parts
//                 console.log(`Boosted weight for ${partName} to ${weights[partName]}`);
//             }
//         });
//     }
    
//     // Normalize weights to 0-1 range
//     const values = Object.values(weights);
//     const min = Math.min(...values);
//     const max = Math.max(...values);
    
//     if (max === min) {
//         // All weights are the same, return equal weights
//         const normalized = {};
//         for (const part in weights) {
//             normalized[part] = 1;
//         }
//         return normalized;
//     }
    
//     const normalized = {};
//     for (const part in weights) {
//         normalized[part] = (weights[part] - min) / (max - min);
//     }
    
//     console.log('Normalized weights:', normalized);
//     return normalized;
// }

// function calculateOverallSimilarity(liveData, modelLandmarks, impPoints) {
//     console.log('=== COMPREHENSIVE SIMILARITY CALCULATION ===');
//     const liveLandmarks = liveData.pose;
//     if (!liveLandmarks || !modelLandmarks) {
//         console.log('Missing landmarks data');
//         return 0;
//     }
    
//     // Check if we have enough landmarks
//     if (liveLandmarks.length < 33 || modelLandmarks.length < 33) {
//         console.warn('Insufficient landmarks for pose comparison:', liveLandmarks.length, modelLandmarks.length);
//         return 0;
//     }
    
//     // Normalize both sets of landmarks
//     const normalizedLive = normalizeKeyPoints(liveLandmarks);
//     const normalizedModel = normalizeKeyPoints(modelLandmarks);
    
//     console.log('Normalized live landmarks sample:', normalizedLive.slice(0, 3));
//     console.log('Normalized model landmarks sample:', normalizedModel.slice(0, 3));
    
//     let totalWeightedSimilarity = 0;
//     let totalWeight = 0;

//     const bodyPartWeights = normalizeWeights(impPoints);

//     // Calculate similarity for each body part  
//     for (const [partName, indices] of Object.entries(bodyParts)) {
//         const weight = bodyPartWeights[partName] || 0;
//         if (weight === 0) {
//             console.log(`Skipping ${partName} (weight: 0)`);
//             continue;
//         }
        
//         const partSimilarity = calculateBodyPartSimilarity(normalizedLive, normalizedModel, indices);
//         console.log(`${partName}: similarity=${partSimilarity.toFixed(3)}, weight=${weight.toFixed(3)}`);
        
//         totalWeightedSimilarity += partSimilarity * weight;
//         totalWeight += weight;
//     }
    
//     console.log(`Total weighted similarity: ${totalWeightedSimilarity}, Total weight: ${totalWeight}`);
    
//     // Calculate overall similarity percentage
//     const overallSimilarity = totalWeight > 0 ? (totalWeightedSimilarity / totalWeight) : 0;
    
//     // Convert to percentage (0-100)
//     const result = Math.max(0, Math.min(100, overallSimilarity * 100));
//     console.log(`Overall comprehensive similarity: ${result}%`);
//     console.log('=== END COMPREHENSIVE CALCULATION ===');
    
//     return result;
// }

// // Alternative simple approach - just compare normalized positions directly
// function calculateSimplePositionSimilarity(liveData, modelLandmarks) {
//     console.log('=== SIMPLE SIMILARITY CALCULATION ===');
//     const liveLandmarks = liveData.pose;
//     if (!liveLandmarks || !modelLandmarks) {
//         console.log('Missing landmarks data for simple calculation');
//         return 0;
//     }
    
//     if (liveLandmarks.length !== modelLandmarks.length) {
//         console.log('Landmark count mismatch:', liveLandmarks.length, 'vs', modelLandmarks.length);
//         return 0;
//     }
    
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
    
//     if (validPoints === 0) {
//         console.log('No valid points for simple calculation');
//         return 0;
//     }
    
//     const result = (totalSimilarity / validPoints) * 100;
//     console.log(`Simple similarity: ${result}% (${validPoints} valid points)`);
//     console.log('=== END SIMPLE CALCULATION ===');
    
//     return result;
// }

// // Smoothing class to reduce fluctuations
// class SimilaritySmoothing {
//     constructor(windowSize = 10, alpha = 0.3) {
//         this.windowSize = windowSize;
//         this.alpha = alpha; // Exponential smoothing factor
//         this.history = [];
//         this.exponentialAverage = null;
//     }
    
//     addValue(value) {
//         // Add to history
//         this.history.push(value);
//         if (this.history.length > this.windowSize) {
//             this.history.shift();
//         }
        
//         // Calculate moving average
//         const movingAverage = this.history.reduce((sum, val) => sum + val, 0) / this.history.length;
        
//         // Calculate exponential moving average
//         if (this.exponentialAverage === null) {
//             this.exponentialAverage = value;
//         } else {
//             this.exponentialAverage = this.alpha * value + (1 - this.alpha) * this.exponentialAverage;
//         }
        
//         // Return weighted combination of both smoothing methods
//         return 0.7 * this.exponentialAverage + 0.3 * movingAverage;
//     }
    
//     reset() {
//         this.history = [];
//         this.exponentialAverage = null;
//     }
// }

// // Global smoothing instances
// const comprehensiveSmoothing = new SimilaritySmoothing(8, 0.25);
// const simpleSmoothing = new SimilaritySmoothing(8, 0.25);
// const overallSmoothing = new SimilaritySmoothing(10, 0.2);

// function calculateSmoothedOverallSimilarity(liveData, modelLandmarks, impPoints) {
//     console.log('=== SMOOTHED SIMILARITY CALCULATION START ===');
    
//     const comprehensive = calculateOverallSimilarity(liveData, modelLandmarks, impPoints);
//     const simple = calculateSimplePositionSimilarity(liveData, modelLandmarks);
    
//     console.log(`Raw scores - Comprehensive: ${comprehensive}, Simple: ${simple}`);
    
//     const smoothedComprehensive = comprehensiveSmoothing.addValue(comprehensive);
//     const smoothedSimple = simpleSmoothing.addValue(simple);
    
//     const combined = (smoothedComprehensive + smoothedSimple) / 2;
//     const smoothedOverall = overallSmoothing.addValue(combined);
    
//     const result = {
//         similarity: smoothedOverall,
//         comprehensive: smoothedComprehensive,
//         simple: smoothedSimple,
//         raw: {
//             comprehensive: comprehensive,
//             simple: simple
//         }
//     };
    
//     console.log('Final smoothed result:', result);
//     console.log('=== SMOOTHED SIMILARITY CALCULATION END ===');
    
//     return result;
// }

// module.exports = {
//     calculateOverallSimilarity,
//     calculateSimplePositionSimilarity,
//     calculateSmoothedOverallSimilarity
// };


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

// // FIXED: This function was completely broken
// function normalizeWeights(impPoints) {
//     console.log('Normalizing weights for important parts:', impPoints);
    
//     // Create a copy of base weights
//     const weights = {
//         torso: 25,
//         leftArm: 20,
//         rightArm: 20,
//         leftLeg: 15,
//         rightLeg: 15,
//         head: 5,
//         spine: 0
//     };
    
//     // Boost weights for important parts
//     if (Array.isArray(impPoints)) {
//         impPoints.forEach(partName => {
//             if (weights.hasOwnProperty(partName)) {
//                 weights[partName] += 15; // Boost important parts
//                 console.log(`Boosted weight for ${partName} to ${weights[partName]}`);
//             }
//         });
//     }
    
//     // Normalize weights to 0-1 range
//     const values = Object.values(weights);
//     const min = Math.min(...values);
//     const max = Math.max(...values);
    
//     if (max === min) {
//         // All weights are the same, return equal weights
//         const normalized = {};
//         for (const part in weights) {
//             normalized[part] = 1;
//         }
//         return normalized;
//     }
    
//     const normalized = {};
//     for (const part in weights) {
//         normalized[part] = (weights[part] - min) / (max - min);
//     }
    
//     console.log('Normalized weights:', normalized);
//     return normalized;
// }

// function calculateOverallSimilarity(liveData, modelLandmarks, impPoints) {
//     console.log('=== COMPREHENSIVE SIMILARITY CALCULATION ===');
//     const liveLandmarks = liveData.pose;
//     if (!liveLandmarks || !modelLandmarks) {
//         console.log('Missing landmarks data');
//         return 0;
//     }
    
//     // Check if we have enough landmarks
//     if (liveLandmarks.length < 33 || modelLandmarks.length < 33) {
//         console.warn('Insufficient landmarks for pose comparison:', liveLandmarks.length, modelLandmarks.length);
//         return 0;
//     }
    
//     // Normalize both sets of landmarks
//     const normalizedLive = normalizeKeyPoints(liveLandmarks);
//     const normalizedModel = normalizeKeyPoints(modelLandmarks);
    
//     console.log('Normalized live landmarks sample:', normalizedLive.slice(0, 3));
//     console.log('Normalized model landmarks sample:', normalizedModel.slice(0, 3));
    
//     let totalWeightedSimilarity = 0;
//     let totalWeight = 0;

//     const bodyPartWeights = normalizeWeights(impPoints);

//     // Calculate similarity for each body part  
//     for (const [partName, indices] of Object.entries(bodyParts)) {
//         const weight = bodyPartWeights[partName] || 0;
//         if (weight === 0) {
//             console.log(`Skipping ${partName} (weight: 0)`);
//             continue;
//         }
        
//         const partSimilarity = calculateBodyPartSimilarity(normalizedLive, normalizedModel, indices);
//         console.log(`${partName}: similarity=${partSimilarity.toFixed(3)}, weight=${weight.toFixed(3)}`);
        
//         totalWeightedSimilarity += partSimilarity * weight;
//         totalWeight += weight;
//     }
    
//     console.log(`Total weighted similarity: ${totalWeightedSimilarity}, Total weight: ${totalWeight}`);
    
//     // Calculate overall similarity percentage
//     const overallSimilarity = totalWeight > 0 ? (totalWeightedSimilarity / totalWeight) : 0;
    
//     // Convert to percentage (0-100)
//     const result = Math.max(0, Math.min(100, overallSimilarity * 100));
//     console.log(`Overall comprehensive similarity: ${result}%`);
//     console.log('=== END COMPREHENSIVE CALCULATION ===');
    
//     return result;
// }

// // Alternative simple approach - just compare normalized positions directly
// function calculateSimplePositionSimilarity(liveData, modelLandmarks) {
//     console.log('=== SIMPLE SIMILARITY CALCULATION ===');
//     const liveLandmarks = liveData.pose;
//     if (!liveLandmarks || !modelLandmarks) {
//         console.log('Missing landmarks data for simple calculation');
//         return 0;
//     }
    
//     if (liveLandmarks.length !== modelLandmarks.length) {
//         console.log('Landmark count mismatch:', liveLandmarks.length, 'vs', modelLandmarks.length);
//         return 0;
//     }
    
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
    
//     if (validPoints === 0) {
//         console.log('No valid points for simple calculation');
//         return 0;
//     }
    
//     const result = (totalSimilarity / validPoints) * 100;
//     console.log(`Simple similarity: ${result}% (${validPoints} valid points)`);
//     console.log('=== END SIMPLE CALCULATION ===');
    
//     return result;
// }

// // Smoothing class to reduce fluctuations
// class SimilaritySmoothing {
//     constructor(windowSize = 10, alpha = 0.3) {
//         this.windowSize = windowSize;
//         this.alpha = alpha; // Exponential smoothing factor
//         this.history = [];
//         this.exponentialAverage = null;
//     }
    
//     addValue(value) {
//         // Add to history
//         this.history.push(value);
//         if (this.history.length > this.windowSize) {
//             this.history.shift();
//         }
        
//         // Calculate moving average
//         const movingAverage = this.history.reduce((sum, val) => sum + val, 0) / this.history.length;
        
//         // Calculate exponential moving average
//         if (this.exponentialAverage === null) {
//             this.exponentialAverage = value;
//         } else {
//             this.exponentialAverage = this.alpha * value + (1 - this.alpha) * this.exponentialAverage;
//         }
        
//         // Return weighted combination of both smoothing methods
//         return 0.7 * this.exponentialAverage + 0.3 * movingAverage;
//     }
    
//     reset() {
//         this.history = [];
//         this.exponentialAverage = null;
//     }
// }

// // Global smoothing instances
// const comprehensiveSmoothing = new SimilaritySmoothing(8, 0.25);
// const simpleSmoothing = new SimilaritySmoothing(8, 0.25);
// const overallSmoothing = new SimilaritySmoothing(10, 0.2);

// function calculateSmoothedOverallSimilarity(liveData, modelLandmarks, impPoints) {
//     console.log('=== SMOOTHED SIMILARITY CALCULATION START ===');
    
//     const comprehensive = calculateOverallSimilarity(liveData, modelLandmarks, impPoints);
//     const simple = calculateSimplePositionSimilarity(liveData, modelLandmarks);
    
//     console.log(`Raw scores - Comprehensive: ${comprehensive}, Simple: ${simple}`);
    
//     const smoothedComprehensive = comprehensiveSmoothing.addValue(comprehensive);
//     const smoothedSimple = simpleSmoothing.addValue(simple);
    
//     const combined = (smoothedComprehensive + smoothedSimple) / 2;
//     const smoothedOverall = overallSmoothing.addValue(combined);
    
//     const result = {
//         similarity: smoothedOverall,
//         comprehensive: smoothedComprehensive,
//         simple: smoothedSimple,
//         raw: {
//             comprehensive: comprehensive,
//             simple: simple
//         }
//     };
    
//     console.log('Final smoothed result:', result);
//     console.log('=== SMOOTHED SIMILARITY CALCULATION END ===');
    
//     return result;
// }

// module.exports = {
//     calculateOverallSimilarity,
//     calculateSimplePositionSimilarity,
//     calculateSmoothedOverallSimilarity
// };


// poseSimilarity.js - Save this file in your backend directory

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

// // IMPROVED: More sensitive similarity calculation with better range utilization
// function calculateBodyPartSimilarity(livePoints, modelPoints, indices) {
//     if (indices.length < 2) return 0;
    
//     let totalSimilarity = 0;
//     let comparisons = 0;
    
//     // Compare distances between key points with improved sensitivity
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
            
//             // IMPROVED: Better similarity calculation with exponential decay
//             const distanceDiff = Math.abs(liveDist - modelDist);
//             const maxDist = Math.max(liveDist, modelDist) + 1e-8;
//             const normalizedDiff = distanceDiff / maxDist;
            
//             // Use exponential decay for more sensitive response
//             const similarity = Math.exp(-normalizedDiff * 3); // Adjusted sensitivity
//             totalSimilarity += similarity;
//             comparisons++;
//         }
//     }
    
//     // Compare angles with improved sensitivity
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
            
//             // IMPROVED: Better angle similarity with exponential decay
//             const angleDiff = Math.abs(liveAngle - modelAngle);
//             const normalizedAngleDiff = angleDiff / Math.PI;
//             const angleSimilarity = Math.exp(-normalizedAngleDiff * 2);
            
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

// // Body part names for corrections
// const bodyPartNames = {
//     11: 'left shoulder', 12: 'right shoulder',
//     13: 'left elbow', 14: 'right elbow',
//     15: 'left wrist', 16: 'right wrist',
//     19: 'left hand', 20: 'right hand',
//     23: 'left hip', 24: 'right hip',
//     25: 'left knee', 26: 'right knee',
//     27: 'left ankle', 28: 'right ankle',
//     0: 'nose'
// };

// // NEW: Generate posture correction feedback
// function generatePostureCorrections(livePoints, modelPoints, threshold = 0.08) {
//     const corrections = [];
//     const normalizedLive = normalizeKeyPoints(livePoints);
//     const normalizedModel = normalizeKeyPoints(modelPoints);
    
//     // Key points to check for corrections
//     const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    
//     for (const idx of keyPoints) {
//         if (idx >= normalizedLive.length || idx >= normalizedModel.length) continue;
        
//         const live = normalizedLive[idx];
//         const model = normalizedModel[idx];
//         const partName = bodyPartNames[idx];
        
//         if (!partName || live.visibility < 0.5) continue;
        
//         const dx = model.x - live.x;
//         const dy = model.y - live.y;
//         const dz = model.z - live.z;
        
//         // Generate corrections based on significant differences
//         if (Math.abs(dx) > threshold) {
//             corrections.push(`Move ${partName} ${dx > 0 ? 'right' : 'left'}`);
//         }
        
//         if (Math.abs(dy) > threshold) {
//             corrections.push(`Move ${partName} ${dy > 0 ? 'up' : 'down'}`);
//         }
        
//         if (Math.abs(dz) > threshold) {
//             corrections.push(`Move ${partName} ${dz > 0 ? 'forward' : 'backward'}`);
//         }
//     }
    
//     // Limit to most important corrections
//     return corrections.slice(0, 3);
// }

// // IMPROVED: Better weight normalization
// function normalizeWeights(impPoints) {
//     const baseWeights = {
//         torso: 30,
//         leftArm: 25,
//         rightArm: 25,
//         leftLeg: 20,
//         rightLeg: 20,
//         head: 10,
//         spine: 15
//     };
    
//     // Boost weights for important parts
//     if (Array.isArray(impPoints)) {
//         impPoints.forEach(partName => {
//             if (baseWeights.hasOwnProperty(partName)) {
//                 baseWeights[partName] += 20;
//             }
//         });
//     }
    
//     // Normalize to sum to 1 for proper weighting
//     const totalWeight = Object.values(baseWeights).reduce((sum, w) => sum + w, 0);
//     const normalized = {};
    
//     for (const part in baseWeights) {
//         normalized[part] = baseWeights[part] / totalWeight;
//     }
    
//     return normalized;
// }

// // IMPROVED: Main similarity calculation with better sensitivity
// function calculateOverallSimilarity(liveData, modelLandmarks, impPoints) {
//     const liveLandmarks = liveData.pose;
//     if (!liveLandmarks || !modelLandmarks) return { similarity: 0, corrections: [] };
    
//     if (liveLandmarks.length < 33 || modelLandmarks.length < 33) {
//         return { similarity: 0, corrections: [] };
//     }
    
//     const normalizedLive = normalizeKeyPoints(liveLandmarks);
//     const normalizedModel = normalizeKeyPoints(modelLandmarks);
    
//     let totalWeightedSimilarity = 0;
//     const bodyPartWeights = normalizeWeights(impPoints);

//     // Calculate similarity for each body part  
//     for (const [partName, indices] of Object.entries(bodyParts)) {
//         const weight = bodyPartWeights[partName] || 0;
//         if (weight === 0) continue;
        
//         const partSimilarity = calculateBodyPartSimilarity(normalizedLive, normalizedModel, indices);
//         totalWeightedSimilarity += partSimilarity * weight;
//     }
    
//     // IMPROVED: Better range mapping to utilize full 0-100 range
//     let similarity = totalWeightedSimilarity * 100;
    
//     // Apply sigmoid function for better sensitivity around middle ranges
//     similarity = 100 / (1 + Math.exp(-0.1 * (similarity - 50)));
    
//     // Generate corrections
//     const corrections = generatePostureCorrections(liveLandmarks, modelLandmarks);
    
//     return {
//         similarity: Math.max(0, Math.min(100, similarity)),
//         corrections: corrections
//     };
// }

// // IMPROVED: Adaptive smoothing class with less fluctuation
// class AdaptiveSimilaritySmoothing {
//     constructor() {
//         this.history = [];
//         this.windowSize = 15; // Larger window for stability
//         this.exponentialAverage = null;
//         this.alpha = 0.15; // Lower alpha for more stability
//         this.stabilityThreshold = 3; // Threshold for considering value stable
//     }
    
//     addValue(value) {
//         this.history.push(value);
//         if (this.history.length > this.windowSize) {
//             this.history.shift();
//         }
        
//         // Calculate moving average
//         const movingAverage = this.history.reduce((sum, val) => sum + val, 0) / this.history.length;
        
//         // Exponential smoothing
//         if (this.exponentialAverage === null) {
//             this.exponentialAverage = value;
//         } else {
//             // Adaptive alpha based on stability
//             const recentVariance = this.calculateRecentVariance();
//             const adaptiveAlpha = recentVariance > this.stabilityThreshold ? this.alpha : this.alpha * 0.5;
            
//             this.exponentialAverage = adaptiveAlpha * value + (1 - adaptiveAlpha) * this.exponentialAverage;
//         }
        
//         // Weighted combination favoring stability
//         return 0.8 * this.exponentialAverage + 0.2 * movingAverage;
//     }
    
//     calculateRecentVariance() {
//         if (this.history.length < 5) return 0;
        
//         const recent = this.history.slice(-5);
//         const mean = recent.reduce((sum, val) => sum + val, 0) / recent.length;
//         const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
        
//         return Math.sqrt(variance);
//     }
    
//     reset() {
//         this.history = [];
//         this.exponentialAverage = null;
//     }
// }

// // Global smoothing instance
// const adaptiveSmoothing = new AdaptiveSimilaritySmoothing();

// // IMPROVED: Main function with corrections and better stability
// function calculateSmoothedOverallSimilarity(liveData, modelLandmarks, impPoints) {
//     const result = calculateOverallSimilarity(liveData, modelLandmarks, impPoints);
//     const smoothedSimilarity = adaptiveSmoothing.addValue(result.similarity);
    
//     return {
//         similarity: smoothedSimilarity,
//         corrections: result.corrections,
//         raw: result.similarity,
//         isStable: adaptiveSmoothing.calculateRecentVariance() < adaptiveSmoothing.stabilityThreshold
//     };
// }

// module.exports = {
//     calculateOverallSimilarity,
//     calculateSmoothedOverallSimilarity,
//     generatePostureCorrections,
//     AdaptiveSimilaritySmoothing
// };

// poseSimilarity.js - Fixed version with proper exports and optimizations

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
    if (!indices || indices.length < 2) return 0;
    if (!livePoints || !modelPoints) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    // Compare distances between key points
    for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
            const idx1 = indices[i];
            const idx2 = indices[j];
            
            if (idx1 >= livePoints.length || idx2 >= livePoints.length ||
                idx1 >= modelPoints.length || idx2 >= modelPoints.length ||
                idx1 < 0 || idx2 < 0) {
                continue;
            }
            
            const liveDist = calculateDistance(livePoints[idx1], livePoints[idx2]);
            const modelDist = calculateDistance(modelPoints[idx1], modelPoints[idx2]);
            
            const distanceDiff = Math.abs(liveDist - modelDist);
            const maxDist = Math.max(liveDist, modelDist) + 1e-8;
            const normalizedDiff = distanceDiff / maxDist;
            
            const similarity = Math.exp(-normalizedDiff * 2);
            totalSimilarity += similarity;
            comparisons++;
        }
    }
    
    // Compare angles
    if (indices.length >= 3) {
        for (let i = 0; i < indices.length - 2; i++) {
            const idx1 = indices[i];
            const idx2 = indices[i + 1];
            const idx3 = indices[i + 2];
            
            if (idx1 >= livePoints.length || idx2 >= livePoints.length || idx3 >= livePoints.length ||
                idx1 >= modelPoints.length || idx2 >= modelPoints.length || idx3 >= modelPoints.length ||
                idx1 < 0 || idx2 < 0 || idx3 < 0) {
                continue;
            }
            
            const liveAngle = calculateAngle(livePoints[idx1], livePoints[idx2], livePoints[idx3]);
            const modelAngle = calculateAngle(modelPoints[idx1], modelPoints[idx2], modelPoints[idx3]);
            
            const angleDiff = Math.abs(liveAngle - modelAngle);
            const normalizedAngleDiff = angleDiff / Math.PI;
            const angleSimilarity = Math.exp(-normalizedAngleDiff * 1.5);
            
            totalSimilarity += angleSimilarity;
            comparisons++;
        }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
}

// Key body parts with their landmark indices
const bodyParts = {
    torso: [11, 12, 23, 24],
    leftArm: [11, 13, 15],
    rightArm: [12, 14, 16],
    leftLeg: [23, 25, 27],
    rightLeg: [24, 26, 28],
    head: [0, 1, 2],
    spine: [11, 12, 23, 24]
};

// Body part names for corrections
const bodyPartNames = {
    11: 'left shoulder', 12: 'right shoulder',
    13: 'left elbow', 14: 'right elbow',
    15: 'left wrist', 16: 'right wrist',
    23: 'left hip', 24: 'right hip',
    25: 'left knee', 26: 'right knee',
    27: 'left ankle', 28: 'right ankle',
    0: 'nose'
};

function generatePostureCorrections(livePoints, modelPoints, threshold = 0.15) {
    if (!livePoints || !modelPoints || livePoints.length === 0 || modelPoints.length === 0) {
        return [];
    }
    
    const corrections = [];
    
    try {
        const normalizedLive = normalizeKeyPoints(livePoints);
        const normalizedModel = normalizeKeyPoints(modelPoints);
        
        if (!normalizedLive || !normalizedModel || normalizedLive.length === 0 || normalizedModel.length === 0) {
            return [];
        }
        
        // Focus on key points
        const keyPoints = [11, 12, 13, 14, 23, 24];
        
        for (const idx of keyPoints) {
            if (idx >= normalizedLive.length || idx >= normalizedModel.length || idx < 0) continue;
            
            const live = normalizedLive[idx];
            const model = normalizedModel[idx];
            const partName = bodyPartNames[idx];
            
            if (!partName || !live || !model || live.visibility < 0.5) continue;
            
            const dx = model.x - live.x;
            const dy = model.y - live.y;
            
            if (Math.abs(dx) > threshold) {
                corrections.push(`Move ${partName} ${dx > 0 ? 'right' : 'left'}`);
            }
            
            if (Math.abs(dy) > threshold) {
                corrections.push(`Move ${partName} ${dy > 0 ? 'up' : 'down'}`);
            }
        }
        
        return corrections.slice(0, 2);
    } catch (error) {
        console.error('Error generating corrections:', error);
        return [];
    }
}

function normalizeWeights(impPoints) {
    const baseWeights = {
        torso: 30,
        leftArm: 20,
        rightArm: 20,
        leftLeg: 15,
        rightLeg: 15,
        head: 5,
        spine: 10
    };
    
    try {
        if (Array.isArray(impPoints)) {
            impPoints.forEach(partName => {
                if (baseWeights.hasOwnProperty(partName)) {
                    baseWeights[partName] += 5;
                }
            });
        }
        
        const totalWeight = Object.values(baseWeights).reduce((sum, w) => sum + w, 0);
        const normalized = {};
        
        for (const part in baseWeights) {
            normalized[part] = totalWeight > 0 ? baseWeights[part] / totalWeight : 0;
        }
        
        return normalized;
    } catch (error) {
        console.error('Error normalizing weights:', error);
        const equalWeight = 1 / Object.keys(baseWeights).length;
        const fallback = {};
        for (const part in baseWeights) {
            fallback[part] = equalWeight;
        }
        return fallback;
    }
}

function calculateOverallSimilarity(liveData, modelLandmarks, impPoints) {
    try {
        if (!liveData || !liveData.pose || !modelLandmarks) {
            return { similarity: 0, corrections: [] };
        }
        
        const liveLandmarks = liveData.pose;
        
        if (!Array.isArray(liveLandmarks) || !Array.isArray(modelLandmarks)) {
            return { similarity: 0, corrections: [] };
        }
        
        if (liveLandmarks.length < 33 || modelLandmarks.length < 33) {
            return { similarity: 0, corrections: [] };
        }
        
        const normalizedLive = normalizeKeyPoints(liveLandmarks);
        const normalizedModel = normalizeKeyPoints(modelLandmarks);
        
        if (!normalizedLive || !normalizedModel) {
            return { similarity: 0, corrections: [] };
        }
        
        let totalWeightedSimilarity = 0;
        const bodyPartWeights = normalizeWeights(impPoints);

        for (const [partName, indices] of Object.entries(bodyParts)) {
            const weight = bodyPartWeights[partName] || 0;
            if (weight === 0) continue;
            
            const partSimilarity = calculateBodyPartSimilarity(normalizedLive, normalizedModel, indices);
            totalWeightedSimilarity += partSimilarity * weight;
        }
        
        // Scale similarity to 0-100 range
        let similarity = Math.min(100, Math.max(0, totalWeightedSimilarity * 100));
        
        const corrections = generatePostureCorrections(liveLandmarks, modelLandmarks);
        
        return {
            similarity: similarity,
            corrections: corrections
        };
    } catch (error) {
        console.error('Error in calculateOverallSimilarity:', error);
        return { similarity: 0, corrections: [] };
    }
}

// Simple smoothing class
class SimilaritySmoothing {
    constructor() {
        this.history = [];
        this.windowSize = 10;
    }
    
    addValue(value) {
        try {
            if (typeof value !== 'number' || isNaN(value)) {
                return this.getAverage();
            }
            
            value = Math.max(0, Math.min(100, value));
            
            this.history.push(value);
            if (this.history.length > this.windowSize) {
                this.history.shift();
            }
            
            return this.getAverage();
        } catch (error) {
            console.error('Error in smoothing:', error);
            return 0;
        }
    }
    
    getAverage() {
        if (this.history.length === 0) return 0;
        return this.history.reduce((sum, val) => sum + val, 0) / this.history.length;
    }
    
    reset() {
        this.history = [];
    }
}

const smoothing = new SimilaritySmoothing();

function calculateSmoothedOverallSimilarity(liveData, modelLandmarks, impPoints) {
    try {
        const result = calculateOverallSimilarity(liveData, modelLandmarks, impPoints);
        const smoothedSimilarity = smoothing.addValue(result.similarity);
        
        return {
            similarity: smoothedSimilarity,
            corrections: result.corrections || [],
            raw: result.similarity,
            isStable: true
        };
    } catch (error) {
        console.error('Error in calculateSmoothedOverallSimilarity:', error);
        return {
            similarity: 0,
            corrections: [],
            raw: 0,
            isStable: false
        };
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateOverallSimilarity,
        calculateSmoothedOverallSimilarity,
        generatePostureCorrections,
        SimilaritySmoothing,
        normalizeKeyPoints,
        calculateDistance,
        calculateAngle,
        calculateBodyPartSimilarity,
        normalizeWeights
    };
}