
import { db } from "@/firebase/client";
import { getWorkoutHistory } from "./workoutService";
import { getNutritionHistory } from "./nutritionService";
import { getUserProfile }from "./userService";

// This function is complex due to the need to aggregate data from multiple sources
// and format it into monthly summaries for the chart.
export async function getProgressChartData(userId: string): Promise<any[]> {
    try {
        const [workoutHistory, nutritionHistory, profile] = await Promise.all([
            getWorkoutHistory(userId),
            getNutritionHistory(userId),
            getUserProfile(userId),
        ]);

        const monthlyData: { [key: string]: { weight: number[], workouts: number, calories: number[] } } = {};

        // Process workout history
        workoutHistory.forEach(log => {
            const month = new Date(log.date).toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = { weight: [], workouts: 0, calories: [] };
            }
            monthlyData[month].workouts += log.sessions;
        });

        // Process nutrition history
        nutritionHistory.forEach(log => {
            const date = (log as any).date;
            if (date) {
                const month = new Date(date).toLocaleString('default', { month: 'short' });
                if (!monthlyData[month]) {
                    monthlyData[month] = { weight: [], workouts: 0, calories: [] };
                }
                monthlyData[month].calories.push(log.calories.current);
            }
        });
        
        // Add current weight to the latest month
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        if (profile?.weight) {
             if (!monthlyData[currentMonth]) {
                monthlyData[currentMonth] = { weight: [], workouts: 0, calories: [] };
            }
            monthlyData[currentMonth].weight.push(profile.weight);
        }


        // Convert to chart format
        const chartData = Object.entries(monthlyData).map(([month, data]) => {
            const avgCalories = data.calories.length ? data.calories.reduce((a, b) => a + b, 0) / data.calories.length : 0;
            const avgWeight = data.weight.length ? data.weight.reduce((a,b) => a + b, 0) / data.weight.length : profile?.weight || 0;
            
            return {
                month,
                workouts: data.workouts,
                calories: Math.round(avgCalories),
                weight: Math.round(avgWeight),
                squat: 0, // Squat data not tracked yet
            };
        });

        // Ensure chronological order - very basic sort
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        chartData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

        if (chartData.length === 0 && profile) {
            return [{
                month: currentMonth,
                workouts: 0,
                calories: 0,
                weight: profile.weight || 0,
                squat: 0,
            }]
        }

        return chartData;

    } catch (error) {
        console.error("Error getting progress chart data: ", error);
        throw new Error("Unable to retrieve progress data.");
    }
}
