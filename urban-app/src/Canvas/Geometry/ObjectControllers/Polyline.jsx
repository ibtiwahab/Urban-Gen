import * as THREE from 'three';
import Base from './Base';
import EqualHeightsPolygon from './EqualHeightsPolygon';
import FlatPolygon from './FlatPolygon';
import GeneratedPlan from './GeneratedPlan/Controller';
import GeneratePlanOption from '../../Popup/Options/GeneratePlan';
import GeneratedPlanParameters from './GeneratedPlan/Parameters';
import GeneratedPlanSettingsMenuComponent from './Settings/Menus/GeneratedPlan/Component';

export default class Polyline extends Base {
    static DEFAULT_LINE_COLOR = "green";

    constructor(line, settingsComponent) {
        line.material = new THREE.LineBasicMaterial({ color: Polyline.DEFAULT_LINE_COLOR });
        super([line], [], settingsComponent);
        this._line = line;
        this._generatedPlanController = null;
        this._geometryCache = null;
        
        // Analyze geometry when polyline is created
        this.analyzeGeometry();
    }

    getFlattenedVertices() {
        const geometry = this._line.geometry;
        const positions = geometry.getAttribute('position');
        return positions ? Array.from(positions.array) : [];
    }

    async analyzeGeometry() {
        try {
            const flattenedVertices = this.getFlattenedVertices();
            
            if (flattenedVertices.length < 9) {
                console.warn('Insufficient vertices for geometry analysis');
                return {};
            }

            const response = await fetch('http://localhost:8000/api/geometry/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    vertices: flattenedVertices,
                    operation: 'analyze'
                })
            });

            if (!response.ok) {
                throw new Error(`Geometry analysis failed: ${response.status}`);
            }

            const result = await response.json();
            this._geometryCache = result;
            
            console.log('Geometry analysis result:', result);
            return result;
            
        } catch (error) {
            console.error('Geometry analysis failed:', error);
            return {};
        }
    }

    async validateGeometry() {
        try {
            const flattenedVertices = this.getFlattenedVertices();

            const response = await fetch('http://localhost:8000/api/geometry/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    vertices: flattenedVertices,
                    operation: 'validate'
                })
            });

            if (!response.ok) {
                throw new Error(`Geometry validation failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('Geometry validation result:', result);
            
            // Update line color based on validation
            if (result.self_intersects) {
                this.highlight('red');
                console.warn('Polygon self-intersects!');
            } else if (!result.is_closed) {
                this.highlight('orange');
                console.warn('Polygon is not closed');
            } else {
                this.unhighlight();
            }
            
            return result;
            
        } catch (error) {
            console.error('Geometry validation failed:', error);
            return {};
        }
    }

    async createOffset(offsetDistance) {
        try {
            const flattenedVertices = this.getFlattenedVertices();

            const response = await fetch('http://localhost:8000/api/geometry/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    vertices: flattenedVertices,
                    operation: 'offset',
                    offset_distance: offsetDistance
                })
            });

            if (!response.ok) {
                throw new Error(`Geometry offset failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.offset_vertices && result.offset_vertices.length >= 9) {
                // Create new THREE.Line from offset vertices
                const offsetGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(result.offset_vertices);
                offsetGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                
                const offsetMaterial = new THREE.LineBasicMaterial({ 
                    color: 'blue',
                    linewidth: 2 
                });
                
                const offsetLine = new THREE.Line(offsetGeometry, offsetMaterial);
                console.log('Created offset polyline');
                return offsetLine;
            }
            
            return null;
            
        } catch (error) {
            console.error('Geometry offset failed:', error);
            return null;
        }
    }

    async generateAndGetPlan(generatedPlanParameters) {
        const flattenedVertices = this.getFlattenedVertices();

        // Enhanced error checking with geometry validation
        if (flattenedVertices.length < 9) {
            throw new Error('Insufficient vertices for plan generation (minimum 3 points required)');
        }

        // Validate geometry before generating plan
        const validation = await this.validateGeometry();
        if (validation.self_intersects) {
            throw new Error('Cannot generate plan: polygon self-intersects. Please fix the geometry first.');
        }

        // Updated to call Django backend with enhanced error handling
        const response = await fetch('http://localhost:8000/api/main/generateplan/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ 
                plan_flattened_vertices: flattenedVertices, 
                plan_parameters: generatedPlanParameters 
            })
        });

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;

            try {
                const errorData = await response.json();
                
                if (errorData && errorData.error) {
                    errorMessage = `Error ${response.status}: ${errorData.error}`;
                    if (errorData.details) {
                        errorMessage += ` - ${JSON.stringify(errorData.details)}`;
                    }
                } else if (errorData && errorData.message) {
                    errorMessage = `Error ${response.status}: ${errorData.message}`;
                }
            } catch (parseError) {
                console.error('Failed to parse error response:', parseError);
                
                if (response.status === 0 || !response.status) {
                    errorMessage = 'Unable to connect to Django backend. Please ensure the server is running on http://localhost:8000';
                }
            }

            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Django backend response:', result);
        return result;
    }

    get polyline() {
        return this._line;
    }

    get generatedPlanController() {
        return this._generatedPlanController;
    }

    get geometryInfo() {
        return this._geometryCache;
    }

    getPopupOptions() {
        const options = super.getPopupOptions();

        const flattenedVertices = this.getFlattenedVertices();
        if (flattenedVertices.length >= 9) {
            options.push(new GeneratePlanOption(this));
        }

        return options;
    }

    highlight(color) {
        this._line.material = new THREE.LineBasicMaterial({ color });
    }

    unhighlight() {
        this._line.material = new THREE.LineBasicMaterial({ color: Polyline.DEFAULT_LINE_COLOR });
    }

    generatePlan(addCallback, removeCallback) {
        let generatedPlanParameters = new GeneratedPlanParameters();
        if (this._generatedPlanController) {
            generatedPlanParameters = this._generatedPlanController.parameters;
        }

        console.log('Generating plan with enhanced Django backend...', generatedPlanParameters);

        this.generateAndGetPlan(generatedPlanParameters).then(result => {
            console.log('Plan generated successfully:', result);
            
            const objectControllers = [];
            const buildingLayers = [];

            // Process building layers with enhanced error handling
            try {
                for (let i = 0; i < result.buildingLayersVertices.length; i++) {
                    for (let j = 0; j < result.buildingLayersVertices[i].length; j++) {
                        const vertices = [];
                        let z = 0;
                        const height = result.buildingLayersHeights[i][j];

                        // Validate vertices array
                        if (result.buildingLayersVertices[i][j].length % 3 !== 0) {
                            console.warn(`Invalid vertices array length for building ${i}, floor ${j}`);
                            continue;
                        }

                        for (let k = 0; k < result.buildingLayersVertices[i][j].length; k += 3) {
                            vertices.push(new THREE.Vector2(
                                result.buildingLayersVertices[i][j][k],
                                result.buildingLayersVertices[i][j][k + 1]
                            ));

                            z = result.buildingLayersVertices[i][j][k + 2];
                        }

                        if (vertices.length >= 3) {
                            const buildingLayer = new EqualHeightsPolygon(
                                this._settingsComponent, 
                                vertices, 
                                height, 
                                'red', 
                                z
                            );
                            buildingLayer.built = true;
                            buildingLayers.push(buildingLayer);
                            objectControllers.push(buildingLayer);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing building layers:', error);
            }

            // Process sub-sites with enhanced error handling
            const subSites = [];
            try {
                for (let i = 0; i < result.subSiteVertices.length; i++) {
                    const vertices = [];
                    let z = 0;

                    if (result.subSiteVertices[i].length % 3 !== 0) {
                        console.warn(`Invalid sub-site vertices array length for site ${i}`);
                        continue;
                    }

                    for (let j = 0; j < result.subSiteVertices[i].length; j += 3) {
                        vertices.push(new THREE.Vector2(
                            result.subSiteVertices[i][j],
                            result.subSiteVertices[i][j + 1]
                        ));

                        z = result.subSiteVertices[i][j + 2];
                    }

                    if (vertices.length >= 3) {
                        const subSite = new FlatPolygon(this._settingsComponent, vertices, 'grey', z);
                        subSite.built = true;
                        subSites.push(subSite);
                        objectControllers.push(subSite);
                    }
                }
            } catch (error) {
                console.error('Error processing sub-sites:', error);
            }

            // Process setbacks with enhanced error handling
            const subSiteSetbacks = [];
            try {
                for (let i = 0; i < result.subSiteSetbackVertices.length; i++) {
                    const vertices = [];
                    let z = 0;

                    if (result.subSiteSetbackVertices[i].length % 3 !== 0) {
                        console.warn(`Invalid setback vertices array length for setback ${i}`);
                        continue;
                    }

                    for (let j = 0; j < result.subSiteSetbackVertices[i].length; j += 3) {
                        vertices.push(new THREE.Vector2(
                            result.subSiteSetbackVertices[i][j],
                            result.subSiteSetbackVertices[i][j + 1]
                        ));

                        z = result.subSiteSetbackVertices[i][j + 2];
                    }

                    if (vertices.length >= 3) {
                        const subSiteSetback = new FlatPolygon(this._settingsComponent, vertices, 'green', z);
                        subSiteSetback.built = true;
                        subSiteSetbacks.push(subSiteSetback);
                        objectControllers.push(subSiteSetback);
                    }
                }
            } catch (error) {
                console.error('Error processing setbacks:', error);
            }

            // Update the generated plan controller
            if (this._generatedPlanController) removeCallback([this._generatedPlanController]);
            this._generatedPlanController = new GeneratedPlan(
                this._settingsComponent, 
                generatedPlanParameters, 
                buildingLayers, 
                subSites, 
                subSiteSetbacks
            );
            addCallback(objectControllers);
            
        }).catch(error => {
            console.error('Plan generation failed:', error);
            
            // Show user-friendly error message with geometry hints
            let errorMessage = `Plan generation failed: ${error.message}`;
            
            if (error.message.includes('self-intersects')) {
                errorMessage += '\n\nGeometry Issue: The polygon intersects itself. Please redraw without crossing lines.';
            } else if (error.message.includes('Insufficient vertices')) {
                errorMessage += '\n\nGeometry Issue: Need at least 3 points to create a valid polygon.';
            } else if (error.message.includes('Unable to connect')) {
                errorMessage += '\n\nConnection Issue: Please check that the Django server is running on http://localhost:8000';
            }
            
            alert(errorMessage);
        });
    }

    populateAndActivateSettingsComponent(addCallback, removeCallback) {
        if (!this._generatedPlanController) {
            this._settingsComponent.setMenus([]);
            return;
        }

        const generatedPlanSettingsMenuComponent = (
            <GeneratedPlanSettingsMenuComponent 
                polylineController={this} 
                addCallback={addCallback} 
                removeCallback={removeCallback} 
            />
        );
        this._settingsComponent.setMenus([generatedPlanSettingsMenuComponent]);
    }

    // Enhanced geometry methods for frontend use
    getArea() {
        return this._geometryCache?.area || 0;
    }

    getPerimeter() {
        return this._geometryCache?.perimeter || 0;
    }

    getCentroid() {
        return this._geometryCache?.centroid || null;
    }

    isValidGeometry() {
        return this._geometryCache?.is_valid || false;
    }

    isClosed() {
        return this._geometryCache?.is_closed || false;
    }

    hasSelfIntersections() {
        return this._geometryCache?.self_intersects || false;
    }

    getMainOrientation() {
        return this._geometryCache?.main_orientation || 0;
    }

    // Method to refresh geometry analysis
    async refreshGeometryAnalysis() {
        await this.analyzeGeometry();
        await this.validateGeometry();
    }
}