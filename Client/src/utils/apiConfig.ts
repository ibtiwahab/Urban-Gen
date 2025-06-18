// src/utils/apiConfig.ts
// Centralized API configuration

export const API_CONFIG = {
    // Base URL for your Django backend
    BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com' 
        : 'http://localhost:8000',
    
    // API endpoints
    ENDPOINTS: {
        GENERATE_PLAN: '/api/main/generateplan/',
    },
    
    // Default headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

// API utility functions
export class ApiClient {
    private static baseUrl = API_CONFIG.BASE_URL;
    
    static async post<T>(endpoint: string, data: any): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: API_CONFIG.DEFAULT_HEADERS,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error - ${endpoint}:`, error);
            throw error;
        }
    }

    private static async handleErrorResponse(response: Response): Promise<never> {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
            const errorData = await response.json();
            
            // Handle Django error format
            if (errorData) {
                if (errorData.error) {
                    errorMessage = `Error ${response.status}: ${errorData.error}`;
                    if (errorData.details) {
                        errorMessage += ` - ${JSON.stringify(errorData.details)}`;
                    }
                } else if (errorData.detail) {
                    // DRF error format
                    errorMessage = `Error ${response.status}: ${errorData.detail}`;
                }
            }
        } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
        }

        throw new Error(errorMessage);
    }
}

// Type definitions for API requests/responses
export interface GeneratedPlanParameters {
    site_type?: number;
    far?: number;
    density?: number;
    mix_ratio?: number;
    building_style?: number;
    orientation?: number;
}

export interface GeneratePlanRequest {
    plan_flattened_vertices: number[];
    plan_parameters?: GeneratedPlanParameters;
}

export interface GeneratePlanResponse {
    buildingLayersHeights: number[][];
    buildingLayersVertices: number[][][];
    subSiteVertices: number[][];
    subSiteSetbackVertices: number[][];
}