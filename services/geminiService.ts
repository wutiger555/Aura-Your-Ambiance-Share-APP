import { GoogleGenAI, Type } from "@google/genai";
import { LocationData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCoordinatesForCity(cityName: string): Promise<LocationData | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find the geographical coordinates (latitude and longitude) for the city: "${cityName}". Also provide the corrected, official English name for this city. For example, if the input is "newyork", the corrected name should be "New York".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        latitude: {
                            type: Type.NUMBER,
                            description: "The latitude of the city."
                        },
                        longitude: {
                            type: Type.NUMBER,
                            description: "The longitude of the city."
                        },
                        cityName: {
                            type: Type.STRING,
                            description: "The corrected, official English name of the city."
                        }
                    },
                    required: ["latitude", "longitude", "cityName"]
                },
            },
        });

        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);
        
        if (typeof data.latitude === 'number' && typeof data.longitude === 'number' && typeof data.cityName === 'string' && data.cityName.length > 0) {
            return {
                latitude: data.latitude,
                longitude: data.longitude,
                name: data.cityName
            };
        }
        return null;

    } catch (error) {
        console.error("Error fetching coordinates from Gemini API:", error);
        return null;
    }
}

export async function getCityForCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Return the name of the city or town at latitude ${latitude} and longitude ${longitude}. Use the most common English name.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        cityName: {
                            type: Type.STRING,
                            description: "The name of the city or town."
                        }
                    },
                    required: ["cityName"]
                }
            }
        });

        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);
        return data.cityName || null;

    } catch (error) {
        console.error("Error fetching city name from Gemini API:", error);
        return null;
    }
}