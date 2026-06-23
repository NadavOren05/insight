import { EMA } from 'technicalindicators';

import { supabase } from '../lib/supabase.js'

// Define strict types for our expected outputs
export type TrendDirection = 'improving' | 'stable' | 'decreasing';
export type RiskLevel = 1 | 2 | 3 | 4 | 5;

export interface EmaSpans {
    shortSpan: number;
    longSpan: number;
}

export interface AnalysisResult {
    trend: TrendDirection;
    riskLevel: RiskLevel;
}

// --- Core Functions ---

/**
 * Fetches chronological grades from Supabase and converts them to percentages.
 */
async function fetchStudentScores(studentId: string, topicId: string): Promise<number[]> {
    const { data, error } = await supabase
        .from('grades')
        .select('score, max_score, date')
        .eq('student_id', studentId)
        // .eq('topic_id', topicId) // Isolate the specific subject
        .order('date', { ascending: true }); // Crucial for time series

    if (error) {
        throw new Error(`Database fetch error: ${error.message}`);
    }
    
    if (!data || data.length < 2) {
        return [];
    }

    // Convert to normalized percentage out of 100
    return data.map(row => (row.score / row.max_score) * 100);
}

/**
 * Dynamically calculates the appropriate EMA periods based on the total dataset size.
 */
export function calculateDynamicSpans(dataLength: number): EmaSpans {
    return {
        shortSpan: Math.max(2, Math.floor(dataLength / 9)),
        longSpan: Math.max(2, Math.floor(dataLength / 2))
    };
}

export function determineTrendAndRisk(shortTermEma: number, longTermEma: number): AnalysisResult {
    const delta = shortTermEma - longTermEma;
    
    // Tuning parameters
    const baseThreshold = 1; 
    const largeThreshold = 5; 

    if (delta > baseThreshold) {
        return {
            trend: 'improving',
            riskLevel: delta >= largeThreshold ? 1 : 2
        };
    } else if (delta < -baseThreshold) {
        return {
            trend: 'decreasing',
            riskLevel: delta <= -largeThreshold ? 5 : 4
        };
    }
    
    return {
        trend: 'stable',
        riskLevel: 3
    };
}

export function calculateConfidence(dataLength: number): number {
    if (dataLength >= 20) return 0.95;
    if (dataLength >= 10) return 0.85;
    if (dataLength >= 5)  return 0.70;
    return 0.50;
}


// export async function uploadAnalysisResults(
//     studentId: string, 
//     topicId: string, 
//     trend: TrendDirection, 
//     riskLevel: RiskLevel, 
//     confidenceScore: number
// ): Promise<void> {
    
//     // Step 1: Insert core analysis
//     const { data: analysisData, error: analysisError } = await supabase
//         .from('student_ai_analysis')
//         .insert({
//             student_id: studentId,
//             trend: trend,
//             risk_level: riskLevel,
//             // attendance_flag: 'null',
//             // parent_summary: 'null',
//             // created_at: new Date().toISOString(),
//             // generated_at: new Date().toISOString()
//         })
//         .select('id') 
//         .single();

//     if (analysisError || !analysisData) {
//         throw new Error(`Failed to insert into student_ai_analysis: ${analysisError?.message}`);
//     }

//     // Step 2: Insert topic relation
//     const { error: topicError } = await supabase
//         .from('ai_analysis_topics')
//         .insert({
//             analysis_id: analysisData.id,
//             topic_id: topicId,
//             confidence_score: confidenceScore,
//             type: 'missed' // Placeholder; adjust based on actual classification logic
//         });

//     if (topicError) {
//         throw new Error(`Failed to insert into ai_analysis_topics: ${topicError.message}`);
//     }
// }

// --- Main Orchestrator ---

/**
 * Main execution function that pulls data, coordinates logic, and logs results.
 */
async function runAnalysisPipeline(studentId: string, topicId: string): Promise<AnalysisResult & { confidenceScore: number } | void> {
    try {
        console.log(`Starting pipeline for Student ID: ${studentId}...`);

        // 1. Fetch
        const scores = await fetchStudentScores(studentId, topicId);
        const dataLength = scores.length;
        
        if (dataLength < 2) {
            console.log(`[Abort] Insufficient data (${dataLength} records) to establish a trend.`);
            return;
        }

        // 2. Calculate Variables
        const { shortSpan, longSpan } = calculateDynamicSpans(dataLength);
        const shortTermEmaArray = EMA.calculate({ period: shortSpan, values: scores });
        const longTermEmaArray = EMA.calculate({ period: longSpan, values: scores });

        if (shortTermEmaArray.length === 0 || longTermEmaArray.length === 0) {
            console.log("[Abort] Dataset too small for the calculated EMA spans.");
            return;
        }

        const latestShortEma = shortTermEmaArray[shortTermEmaArray.length - 1];
        const latestLongEma = longTermEmaArray[longTermEmaArray.length - 1];

        // 3. Determine Final Results
        const { trend, riskLevel } = determineTrendAndRisk(latestShortEma, latestLongEma);
        const confidenceScore = calculateConfidence(dataLength);

        console.log(`[Analysis] Trend: ${trend} | Risk: ${riskLevel}/5 | Confidence: ${(confidenceScore * 100).toFixed(0)}%`);
        
        return { trend, riskLevel, confidenceScore };

    } catch (error) {
        console.error("[Pipeline Error]:", error);
    }
}

export { runAnalysisPipeline };