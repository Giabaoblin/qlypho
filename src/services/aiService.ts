import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeShifts(shifts: any[], attendance: any[]) {
  const prompt = `
    Analyze the following shift and attendance data to provide management insights.
    
    Shifts: ${JSON.stringify(shifts)}
    Attendance: ${JSON.stringify(attendance)}
    
    Provide:
    1. Completion rate percentage.
    2. Punctuality trends.
    3. Suggestions for optimizing shift coverage (e.g. which employees are best suited for night shifts based on attendance).
    4. Flag any recurring absences.
    
    Return the response in a structured JSON format with fields: summary, metrics, suggestions, and alerts.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
}

export async function suggestShift(currentRequests: any[], availableStaff: any[]) {
  const prompt = `
    Based on ${currentRequests.length} pending leave requests and ${availableStaff.length} available staff members,
    suggest the best replacement strategy.
    
    Available Staff: ${JSON.stringify(availableStaff)}
    Requests: ${JSON.stringify(currentRequests)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Suggestion failed:", error);
    return "Error getting suggestions.";
  }
}
