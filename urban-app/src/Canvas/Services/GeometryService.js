// Simplified GeometryService.js - Only use working endpoints

class GeometryService {
    static BASE_URL = 'http://localhost:8000/api';
    
    // Validate vertices array
    static validateVertices(vertices) {
        if (!Array.isArray(vertices)) {
            throw new Error('Vertices must be an array');
        }
        
        if (vertices.length < 9) {
            throw new Error('At least 3 vertices (9 values) required');
        }
        
        if (vertices.length % 3 !== 0) {
            throw new Error('Vertices must be in groups of 3 (x, y, z)');
        }
        
        // Check for invalid numbers
        for (let i = 0; i < vertices.length; i++) {
            if (typeof vertices[i] !== 'number' || !isFinite(vertices[i])) {
                throw new Error(`Invalid vertex value at index ${i}: ${vertices[i]}`);
            }
        }
        
        return true;
    }
    
    // Enhanced plan generation with better parameter serialization
    static async generatePlan(flattenedVertices, parameters) {
        try {
            this.validateVertices(flattenedVertices);
            
            // Enhanced parameter serialization
            const planParameters = this.serializePlanParameters(parameters);
            
            console.log('Sending to backend:', {
                vertices_count: flattenedVertices.length / 3,
                parameters: planParameters
            });
            
            const requestBody = {
                plan_flattened_vertices: flattenedVertices,
                plan_parameters: planParameters
            };
            
            const response = await fetch(`${this.BASE_URL}/planning/main/generateplan/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || 
                    errorData.details || 
                    `Backend error: ${response.status} ${response.statusText}`
                );
            }
            
            const result = await response.json();
            console.log('Backend response:', result);
            
            // Validate response structure
            this.validatePlanResponse(result);
            
            return result;
            
        } catch (error) {
            console.error('Plan generation failed:', error);
            
            // Enhanced error messages
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to Django backend. Please ensure the server is running on http://localhost:8000');
            } else if (error.message.includes('timeout')) {
                throw new Error('Request timeout. The backend may be overloaded.');
            } else if (error.message.includes('self-intersects')) {
                throw new Error('Polygon self-intersects. Please redraw without crossing lines.');
            }
            
            throw error;
        }
    }
    
    // Enhanced parameter serialization
    static serializePlanParameters(parameters) {
        if (!parameters) {
            console.log('No parameters provided, using defaults');
            return {
                site_type: 0,
                density: 0.5,
                far: 1.0,
                mix_ratio: 0.0,
                building_style: 0,
                orientation: 0.0
            };
        }
        
        // Create clean parameter object
        const serialized = {
            site_type: this.validateAndClamp(parameters.site_type, 0, 4, 0),
            density: this.validateAndClamp(parameters.density, 0.01, 0.99, 0.5),
            far: this.validateAndClamp(parameters.far, 0.1, 10.0, 1.0),
            mix_ratio: this.validateAndClamp(parameters.mix_ratio, 0.0, 0.99, 0.0),
            building_style: this.validateAndClamp(parameters.building_style, 0, 3, 0),
            orientation: this.validateAndClamp(parameters.orientation, 0.0, 180.0, 0.0)
        };
        
        // Add enhanced parameters if available
        if (parameters.min_building_spacing !== undefined) {
            serialized.min_building_spacing = Math.max(0, parameters.min_building_spacing);
        }
        
        if (parameters.setback_distance !== undefined) {
            serialized.setback_distance = Math.max(0, parameters.setback_distance);
        }
        
        if (parameters.use_grid_layout !== undefined) {
            serialized.use_grid_layout = Boolean(parameters.use_grid_layout);
        }
        
        console.log('Serialized parameters:', serialized);
        return serialized;
    }
    
    // Validate and clamp numeric values
    static validateAndClamp(value, min, max, defaultValue) {
        if (value === undefined || value === null || typeof value !== 'number' || !isFinite(value)) {
            console.warn(`Invalid parameter value: ${value}, using default: ${defaultValue}`);
            return defaultValue;
        }
        
        const clamped = Math.max(min, Math.min(max, value));
        if (clamped !== value) {
            console.warn(`Parameter value ${value} clamped to ${clamped} (range: ${min}-${max})`);
        }
        
        return clamped;
    }
    
    // Validate plan response structure
    static validatePlanResponse(response) {
        if (!response) {
            throw new Error('Empty response from backend');
        }
        
        const requiredFields = [
            'buildingLayersHeights',
            'buildingLayersVertices', 
            'subSiteVertices',
            'subSiteSetbackVertices'
        ];
        
        for (const field of requiredFields) {
            if (!Array.isArray(response[field])) {
                throw new Error(`Missing or invalid field in response: ${field}`);
            }
        }
        
        // Validate building data consistency
        if (response.buildingLayersHeights.length !== response.buildingLayersVertices.length) {
            throw new Error('Mismatch between building heights and vertices arrays');
        }
        
        // Log building count for debugging
        console.log(`Response validation: ${response.buildingLayersVertices.length} buildings generated`);
        
        return true;
    }
    
    // Simplified geometry analysis - use the working endpoint
    static async analyzeGeometry(flattenedVertices, operation = 'analyze') {
        try {
            this.validateVertices(flattenedVertices);
            
            const response = await fetch(`${this.BASE_URL}/planning/geometry/analyze/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vertices: flattenedVertices,
                    operation: operation
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Analysis failed: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Geometry analysis failed:', error);
            throw error;
        }
    }
    
    // Mock geometry validation until the endpoint is working
    static async validateGeometry(flattenedVertices, options = {}) {
        try {
            this.validateVertices(flattenedVertices);
            
            // Try the real endpoint first
            try {
                const requestBody = {
                    vertices: flattenedVertices,
                    tolerance: options.tolerance || 1e-6,
                    check_closure: options.check_closure !== false,
                    check_self_intersection: options.check_self_intersection !== false,
                    check_planarity: options.check_planarity !== false
                };
                
                const response = await fetch(`${this.BASE_URL}/planning/geometry/validate/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (e) {
                console.warn('Validation endpoint not available, using mock validation');
            }
            
            // Fallback to basic validation
            return this.mockValidateGeometry(flattenedVertices, options);
            
        } catch (error) {
            console.error('Geometry validation failed:', error);
            throw error;
        }
    }
    
    // Mock validation for when endpoint isn't available
    static mockValidateGeometry(flattenedVertices, options = {}) {
        const points = [];
        for (let i = 0; i < flattenedVertices.length; i += 3) {
            points.push({
                x: flattenedVertices[i],
                y: flattenedVertices[i + 1],
                z: flattenedVertices[i + 2]
            });
        }
        
        // Basic checks
        const isClosed = points.length >= 4 && 
            Math.abs(points[0].x - points[points.length - 1].x) < 0.01 &&
            Math.abs(points[0].y - points[points.length - 1].y) < 0.01;
        
        // Calculate area using shoelace formula
        let area = 0;
        if (isClosed && points.length >= 4) {
            for (let i = 0; i < points.length - 1; i++) {
                area += (points[i].x * points[i + 1].y - points[i + 1].x * points[i].y);
            }
            area = Math.abs(area) / 2;
        }
        
        // Calculate perimeter
        let perimeter = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const dx = points[i + 1].x - points[i].x;
            const dy = points[i + 1].y - points[i].y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }
        
        return {
            is_valid: points.length >= 3,
            errors: points.length < 3 ? ['Insufficient points'] : [],
            warnings: !isClosed ? ['Polygon not closed'] : [],
            polygon_area: area,
            polygon_perimeter: perimeter,
            is_closed: isClosed,
            is_planar: true, // Assume planar for 2D
            self_intersects: false // Basic implementation doesn't check this
        };
    }
    
    // Mock other methods until endpoints are available
    static async createOffset(flattenedVertices, offsetDistance, options = {}) {
        console.warn('Offset endpoint not implemented, returning mock response');
        return {
            success: false,
            error_message: 'Offset operation not yet implemented'
        };
    }
    
    static async testIntersection(verticesA, verticesB, options = {}) {
        console.warn('Intersection endpoint not implemented, returning mock response');
        return {
            intersects: false,
            intersection_type: 'separate'
        };
    }
    
    static async triangulatePolygon(flattenedVertices, options = {}) {
        console.warn('Triangulation endpoint not implemented, returning mock response');
        return {
            success: false,
            error_message: 'Triangulation operation not yet implemented'
        };
    }
    
    // Test backend connection
    static async testConnection() {
        try {
            // Test the main plan generation endpoint
            const response = await fetch(`${this.BASE_URL}/planning/main/generateplan/`, {
                method: 'OPTIONS',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            return {
                connected: response.status === 200 || response.status === 405, // 405 = Method not allowed but endpoint exists
                status: response.status,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Connection test failed:', error);
            return {
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    // Utility methods for frontend display
    static formatArea(area) {
        if (!area || area === 0) return '0 m²';
        
        if (area >= 10000) {
            return `${(area / 10000).toFixed(2)} ha`;
        } else if (area >= 1000) {
            return `${(area / 1000).toFixed(1)} km²`;
        } else {
            return `${area.toFixed(0)} m²`;
        }
    }
    
    static formatDistance(distance) {
        if (!distance || distance === 0) return '0 m';
        
        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(2)} km`;
        } else {
            return `${distance.toFixed(1)} m`;
        }
    }
    
    static getGeometryQualityScore(validationInfo) {
        if (!validationInfo) return 0;
        
        let score = 100;
        
        // Deduct points for issues
        if (!validationInfo.is_valid) score -= 50;
        if (!validationInfo.is_closed) score -= 20;
        if (validationInfo.self_intersects) score -= 30;
        if (!validationInfo.is_planar) score -= 10;
        
        // Deduct points for errors and warnings
        if (validationInfo.errors) score -= validationInfo.errors.length * 10;
        if (validationInfo.warnings) score -= validationInfo.warnings.length * 5;
        
        return Math.max(0, Math.min(100, score));
    }
    
    static getGeometryStatusDescription(validationInfo) {
        if (!validationInfo) return 'Unknown';
        
        const score = this.getGeometryQualityScore(validationInfo);
        
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 40) return 'Poor';
        return 'Critical';
    }
    
    // Debug helpers
    static logParameterComparison(frontend, backend) {
        console.group('Parameter Comparison');
        console.log('Frontend parameters:', frontend);
        console.log('Backend parameters:', backend);
        
        const differences = [];
        for (const key in frontend) {
            if (frontend[key] !== backend[key]) {
                differences.push({
                    parameter: key,
                    frontend: frontend[key],
                    backend: backend[key]
                });
            }
        }
        
        if (differences.length > 0) {
            console.warn('Parameter differences found:', differences);
        } else {
            console.log('✅ All parameters match');
        }
        
        console.groupEnd();
    }
    
    static async debugPlanGeneration(flattenedVertices, parameters) {
        console.group('Plan Generation Debug');
        
        try {
            // Log input data
            console.log('Input vertices count:', flattenedVertices.length / 3);
            console.log('Input parameters:', parameters);
            
            // Validate inputs
            this.validateVertices(flattenedVertices);
            const serializedParams = this.serializePlanParameters(parameters);
            console.log('Serialized parameters:', serializedParams);
            
            // Test backend connection
            const connection = await this.testConnection();
            console.log('Backend connection:', connection);
            
            if (!connection.connected) {
                throw new Error('Backend not accessible');
            }
            
            // Generate plan
            const result = await this.generatePlan(flattenedVertices, parameters);
            console.log('Plan generation successful');
            console.log('Generated buildings:', result.buildingLayersVertices?.length || 0);
            
            return result;
            
        } catch (error) {
            console.error('Debug plan generation failed:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }
}

export default GeometryService;