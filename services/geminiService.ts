
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Changed import path to be relative
import { DashboardData } from "../types";

// IMPORTANT: This assumes the API key is set in the environment.
// In a real browser environment, this would be handled differently,
// likely through a secure backend proxy. For this scaffold, we assume it's available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key not found. Mock data generation will fail. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateDashboardDataPrompt = `
Generate a complete JSON object for an electronics inventory dashboard. The data should be realistic for a small business. The JSON object must conform to the following schema.
- totalStockValue: A number between 50000 and 200000.
- totalCashOnHand: A number between 5000 and 20000.
- totalBankBalance: A number between 10000 and 100000.
- outstandingLoans: A number between 1000 and 15000.
- lowStockComponents: An array of 5 component objects. Each object should have id, name, description, unit ('pcs' or 'reel'), default_price, reorder_level, and current_stock (which must be below reorder_level).
- recentMovements: An array of 7 stock movement objects. Each object should have id, type ('purchase', 'sale', 'transfer'), componentName, fromLocationName (optional), toLocationName (optional), qty, unit_price, total_price, timestamp (ISO 8601 format string from the last 7 days), and createdBy (a person's name).
- supplierPerformance: An array of 4 supplier objects. Each object should have id, name, totalSpend, and lastPurchaseDate (ISO 8601 format string from the last month).
`;

const dashboardSchema = {
    type: Type.OBJECT,
    properties: {
        kpis: {
            type: Type.OBJECT,
            properties: {
                totalStockValue: { type: Type.NUMBER },
                totalCashOnHand: { type: Type.NUMBER },
                totalBankBalance: { type: Type.NUMBER },
                outstandingLoans: { type: Type.NUMBER }
            }
        },
        lowStockComponents: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    default_price: { type: Type.NUMBER },
                    reorder_level: { type: Type.NUMBER },
                    current_stock: { type: Type.NUMBER }
                }
            }
        },
        recentMovements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    componentName: { type: Type.STRING },
                    fromLocationName: { type: Type.STRING, nullable: true },
                    toLocationName: { type: Type.STRING, nullable: true },
                    qty: { type: Type.NUMBER },
                    unit_price: { type: Type.NUMBER },
                    total_price: { type: Type.NUMBER },
                    timestamp: { type: Type.STRING },
                    createdBy: { type: Type.STRING }
                }
            }
        },
        supplierPerformance: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    totalSpend: { type: Type.NUMBER },
                    lastPurchaseDate: { type: Type.STRING }
                }
            }
        }
    }
};

export const generateDashboardData = async (): Promise<DashboardData> => {
  if (!API_KEY) {
      throw new Error("API_KEY is not configured for Gemini.");
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generateDashboardDataPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dashboardSchema,
      },
    });
    const rawText = response.text.trim();
    
    // Robustly extract the JSON object from the response string,
    // as it may be wrapped in markdown or have other text.
    const startIndex = rawText.indexOf('{');
    const endIndex = rawText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      throw new Error("Could not find a valid JSON object in the Gemini response.");
    }
    
    const jsonText = rawText.substring(startIndex, endIndex + 1);
    const data = JSON.parse(jsonText);
    
    // The Gemini response may nest the data, so we need to extract it
    return data.kpis ? data : data[Object.keys(data)[0]];

  } catch (error) {
    console.error("Error generating dashboard data from Gemini:", error);
    // Provide fallback static data if the API call fails
    return getFallbackData();
  }
};

const getFallbackData = (): DashboardData => {
    return {
        kpis: {
            totalStockValue: 75000,
            totalCashOnHand: 8500,
            totalBankBalance: 52300,
            outstandingLoans: 5250,
        },
        lowStockComponents: [
            { id: 'c1', name: 'ATmega328P Microcontroller', description: '8-bit AVR MCU', unit: 'pcs', default_price: 2.5, reorder_level: 50, current_stock: 45 },
            { id: 'c2', name: '10k Ohm Resistor (0.25W)', description: 'Carbon film resistor', unit: 'reel', default_price: 0.01, reorder_level: 1000, current_stock: 850 },
        ],
        recentMovements: [
            { id: 'm1', type: 'purchase', componentName: 'ESP32-WROOM-32', toLocationName: 'Main Warehouse', qty: 100, unit_price: 3.5, total_price: 350, timestamp: new Date().toISOString(), createdBy: 'Alice' },
            { id: 'm2', type: 'sale', componentName: 'ATmega328P Microcontroller', fromLocationName: 'Shop Floor', qty: 10, unit_price: 4.0, total_price: 40, timestamp: new Date(Date.now() - 86400000).toISOString(), createdBy: 'Bob' },
        ],
        supplierPerformance: [
            { id: 's1', name: 'ComponentSource Inc.', totalSpend: 12500, lastPurchaseDate: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 's2', name: 'ChipWorld', totalSpend: 8900, lastPurchaseDate: new Date(Date.now() - 86400000 * 2).toISOString() },
        ],
    };
};
