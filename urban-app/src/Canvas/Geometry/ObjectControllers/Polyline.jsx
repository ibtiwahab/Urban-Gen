import * as THREE from 'three';
import Base from './Base';
import EqualHeightsPolygon from './EqualHeightsPolygon';
import FlatPolygon from './FlatPolygon';
import GeneratedPlan from './GeneratedPlan/Controller';
import GeneratePlanOption from '../../Popup/Options/GeneratePlan';
import GeneratedPlanParameters from './GeneratedPlan/Parameters';
import GeneratedPlanSettingsMenuComponent from './Settings/Menus/GeneratedPlan/Component';
import GeometryService from '../../Services/GeometryService';

export default class Polyline extends Base {
    static DEFAULT_LINE_COLOR = "green";
    static VALID_COLOR = "green";
    static WARNING_COLOR = "orange";
    static ERROR_COLOR = "red";
    static ANALYZING_COLOR = "blue";

    constructor(line, settingsComponent) {
        line.material = new THREE.LineBasicMaterial({ color: Polyline.DEFAULT_LINE_COLOR });
        super([line], [], settingsComponent);
        this._line = line;
        this._generatedPlanController = null;
        this._geometryCache = null;
        this._validationCache = null;
        this._offsetLines = []; // Store offset visualization lines
        this._isAnalyzing = false;
        
        // Analyze geometry when polyline is created
        this.analyzeGeometry();
    }

    getFlattenedVertices() {
        const geometry = this._line.geometry;
        const positions = geometry.getAttribute('position');
        return positions ? Array.from(positions.array) : [];
    }

    async analyzeGeometry() {
        if (this._isAnalyzing) return this._geometryCache;
        
        this._isAnalyzing = true;
        this.highlight(Polyline.ANALYZING_COLOR);

        try {
            const flattenedVertices = this.getFlattenedVertices();
            
            if (flattenedVertices.length < 9) {
                console.warn('Insufficient vertices for geometry analysis');
                this.unhighlight();
                this._isAnalyzing = false;
                return {};
            }

            // Validate vertices
            GeometryService.validateVertices(flattenedVertices);

            // Perform comprehensive geometry analysis
            const result = await GeometryService.analyzeGeometry(flattenedVertices, 'analyze');
            this._geometryCache = result;
            
            console.log('Geometry analysis result:', result);
            
            // Update visual feedback based on analysis
            this.updateVisualFeedback(result);
            
            this._isAnalyzing = false;
            return result;
            
        } catch (error) {
            console.error('Geometry analysis failed:', error);
            this.highlight(Polyline.ERROR_COLOR);
            this._isAnalyzing = false;
            return {};
        }
    }

    async validateGeometry() {
        try {
            const flattenedVertices = this.getFlattenedVertices();
            GeometryService.validateVertices(flattenedVertices);

            const result = await GeometryService.validateGeometry(flattenedVertices, {
                tolerance: 1e-6,
                check_closure: true,
                check_self_intersection: true,
                check_planarity: true
            });

            this._validationCache = result;
            console.log('Geometry validation result:', result);
            
            // Update visual feedback
            this.updateVisualFeedback(result);
            
            return result;
            
        } catch (error) {
            console.error('Geometry validation failed:', error);
            this.highlight(Polyline.ERROR_COLOR);
            return { is_valid: false, errors: [error.message] };
        }
    }

    updateVisualFeedback(geometryInfo) {
        if (!geometryInfo) {
            this.unhighlight();
            return;
        }

        // Priority: Errors > Warnings > Valid
        if (geometryInfo.self_intersects || (geometryInfo.errors && geometryInfo.errors.length > 0)) {
            this.highlight(Polyline.ERROR_COLOR);
        } else if (!geometryInfo.is_closed || (geometryInfo.warnings && geometryInfo.warnings.length > 0)) {
            this.highlight(Polyline.WARNING_COLOR);
        } else if (geometryInfo.is_valid) {
            this.highlight(Polyline.VALID_COLOR);
        } else {
            this.unhighlight();
        }
    }

    async createOffset(offsetDistance, offsetType = 'inward') {
        try {
            const flattenedVertices = this.getFlattenedVertices();
            GeometryService.validateVertices(flattenedVertices);

            const result = await GeometryService.createOffset(flattenedVertices, offsetDistance, {
                offset_type: offsetType,
                tolerance: 1e-6
            });

            if (result.success && result.offset_vertices && result.offset_vertices.length >= 9) {
                // Create new THREE.Line from offset vertices
                const offsetGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(result.offset_vertices);
                offsetGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                
                const offsetMaterial = new THREE.LineBasicMaterial({ 
                    color: offsetType === 'inward' ? 'blue' : 'purple',
                    linewidth: 2 
                });
                
                const offsetLine = new THREE.Line(offsetGeometry, offsetMaterial);
                
                // Store offset line for cleanup
                this._offsetLines.push(offsetLine);
                
                console.log(`Created ${offsetType} offset polyline with distance ${offsetDistance}`);
                return offsetLine;
            } else {
                console.warn('Offset operation failed:', result.error_message);
                return null;
            }
            
        } catch (error) {
            console.error('Geometry offset failed:', error);
            return null;
        }
    }

    async testIntersectionWith(otherPolyline) {
        try {
            const verticesA = this.getFlattenedVertices();
            const verticesB = otherPolyline.getFlattenedVertices();
            
            GeometryService.validateVertices(verticesA);
            GeometryService.validateVertices(verticesB);

            const result = await GeometryService.testIntersection(verticesA, verticesB, {
                tolerance: 1e-6
            });

            console.log('Intersection test result:', result);
            return result;
            
        } catch (error) {
            console.error('Intersection test failed:', error);
            return { intersects: false, intersection_type: 'error' };
        }
    }

    async triangulate() {
        try {
            const flattenedVertices = this.getFlattenedVertices();
            GeometryService.validateVertices(flattenedVertices);

            const result = await GeometryService.triangulatePolygon(flattenedVertices, {
                tolerance: 1e-6
            });

            if (result.success && result.triangles) {
                console.log(`Polygon triangulated into ${result.triangle_count} triangles`);
                
                // Create THREE.js objects for each triangle
                const triangleObjects = [];
                for (const triangle of result.triangles) {
                    if (triangle.length >= 9) {
                        const geometry = new THREE.BufferGeometry();
                        const positions = new Float32Array(triangle);
                        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                        
                        const material = new THREE.MeshBasicMaterial({ 
                            color: 'lightblue', 
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.7
                        });
                        
                        const mesh = new THREE.Mesh(geometry, material);
                        triangleObjects.push(mesh);
                    }
                }
                
                return triangleObjects;
            } else {
                console.warn('Triangulation failed:', result.error_message);
                return [];
            }
            
        } catch (error) {
            console.error('Triangulation failed:', error);
            return [];
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

        if (!validation.is_valid) {
            const errorMsg = validation.errors ? validation.errors.join(', ') : 'Invalid geometry';
            throw new Error(`Cannot generate plan: ${errorMsg}`);
        }

        // Show warning for non-closed polygons but allow generation
        if (!validation.is_closed) {
            console.warn('Warning: Polygon is not closed. Results may be unexpected.');
        }

        try {
            // Use GeometryService for plan generation
            const result = await GeometryService.generatePlan(flattenedVertices, generatedPlanParameters);
            console.log('Django backend response:', result);
            return result;
        } catch (error) {
            // Enhanced error handling
            let errorMessage = error.message;
            
            if (errorMessage.includes('self-intersects')) {
                errorMessage += '\n\nGeometry Issue: The polygon intersects itself. Please redraw without crossing lines.';
            } else if (errorMessage.includes('Insufficient vertices')) {
                errorMessage += '\n\nGeometry Issue: Need at least 3 points to create a valid polygon.';
            } else if (errorMessage.includes('Unable to connect') || errorMessage.includes('timeout')) {
                errorMessage += '\n\nConnection Issue: Please check that the Django server is running on http://localhost:8000';
            }
            
            throw new Error(errorMessage);
        }
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

    get validationInfo() {
        return this._validationCache;
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

    // Clean up offset lines
    cleanupOffsetLines() {
        for (const offsetLine of this._offsetLines) {
            if (offsetLine.parent) {
                offsetLine.parent.remove(offsetLine);
            }
            offsetLine.geometry.dispose();
            offsetLine.material.dispose();
        }
        this._offsetLines = [];
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
            alert(error.message);
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
        return this._validationCache?.is_valid || false;
    }

    isClosed() {
        return this._validationCache?.is_closed || false;
    }

    hasSelfIntersections() {
        return this._validationCache?.self_intersects || false;
    }

    getMainOrientation() {
        return this._geometryCache?.main_orientation || 0;
    }

    getGeometryQuality() {
        if (!this._validationCache) return 0;
        return GeometryService.getGeometryQualityScore(this._validationCache);
    }

    getGeometryStatus() {
        if (!this._validationCache) return 'Unknown';
        return GeometryService.getGeometryStatusDescription(this._validationCache);
    }

    getFormattedArea() {
        return GeometryService.formatArea(this.getArea());
    }

    getFormattedPerimeter() {
        return GeometryService.formatDistance(this.getPerimeter());
    }

    // Method to refresh geometry analysis
    async refreshGeometryAnalysis() {
        this._geometryCache = null;
        this._validationCache = null;
        await this.analyzeGeometry();
        await this.validateGeometry();
    }

    // Cleanup method
    dispose() {
        this.cleanupOffsetLines();
        if (this._line) {
            if (this._line.geometry) this._line.geometry.dispose();
            if (this._line.material) this._line.material.dispose();
        }
    }
}