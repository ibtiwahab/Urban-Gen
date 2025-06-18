import * as THREE from 'three';
import Base from './Base';
import EqualHeightsPolygon from './EqualHeightsPolygon';
import FlatPolygon from './FlatPolygon';
import GeneratedPlan from './GeneratedPlan/Controller';
import PopupOptions from '../../Popup/Options/Base';
import GeneratePlanOption from '../../Popup/Options/GeneratePlan';
import GeneratePlan from './GeneratedPlan/Controller';
import GeneratedPlanParameters from './GeneratedPlan/Parameters';
import GeneratedPlanSettingsMenuComponent from './Settings/Menus/GeneratedPlan/Component';

interface GeneratePlanResponse {
    buildingLayersHeights: number[][];
    buildingLayersVertices: number[][][];
    subSiteVertices: number[][];
    subSiteSetbackVertices: number[][];
}

export default class Polyline extends Base {
    protected static readonly DEFAULT_LINE_COLOR: string | number | THREE.Color = "green";
    protected _line: THREE.Line;
    protected _generatedPlanController: GeneratePlan | null = null;

    public async generateAndGetPlan(generatedPlanParameters: GeneratedPlanParameters): Promise<GeneratePlanResponse> {
        const polyline = this.polyline;
        const geometry = polyline.geometry as THREE.BufferGeometry;
        let positions = geometry.getAttribute('position');
        let flattenedVertices = positions ? Array.from(positions.array) : [];

        // Updated to call Django backend instead of C# backend
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
                
                // Handle Django error format
                if (errorData && errorData.error) {
                    errorMessage = `Error ${response.status}: ${errorData.error}`;
                    if (errorData.details) {
                        errorMessage += ` - ${JSON.stringify(errorData.details)}`;
                    }
                } else if (errorData && errorData.message) {
                    // Fallback for other error formats
                    errorMessage = `Error ${response.status}: ${errorData.message}`;
                }
            } catch (parseError) {
                console.error('Failed to parse error response:', parseError);
                
                // Check if it's a connection issue
                if (response.status === 0 || !response.status) {
                    errorMessage = 'Unable to connect to Django backend. Please ensure the server is running on http://localhost:8000';
                }
            }

            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Django backend response:', result); // For debugging
        return result;
    }

    constructor(line: THREE.Line, settingsComponent: any) {
        line.material = new THREE.LineBasicMaterial({ color: Polyline.DEFAULT_LINE_COLOR });
        super([line], [], settingsComponent);
        this._line = line;
    }

    public get polyline(): THREE.Line {
        return this._line;
    }

    public get generatedPlanController(): GeneratePlan | null {
        return this._generatedPlanController;
    }

    public override getPopupOptions(): PopupOptions[] {
        const options = super.getPopupOptions();

        const line = this._line;
        const geometry = line.geometry as THREE.BufferGeometry;
        let positions = geometry.getAttribute('position');
        let flattenedVertices = positions ? Array.from(positions.array) : [];
        if (flattenedVertices.length >= 9) options.push(new GeneratePlanOption(this));

        return options;
    }

    public override highlight(color: string | number | THREE.Color): void {
        this._line.material = new THREE.LineBasicMaterial({ color });
    }

    public override unhighlight(): void {
        this._line.material = new THREE.LineBasicMaterial({ color: Polyline.DEFAULT_LINE_COLOR });
    }

    public generatePlan(addCallback: (result: Base[]) => void, removeCallback: (result: Base[]) => void): void {
        let generatedPlanParameters = new GeneratedPlanParameters();
        if (this._generatedPlanController) generatedPlanParameters = this._generatedPlanController.parameters;

        console.log('Generating plan with Django backend...', generatedPlanParameters);

        this.generateAndGetPlan(generatedPlanParameters).then(result => {
            console.log('Plan generated successfully:', result);
            
            const objectControllers: Base[] = [];
            const buildingLayers: EqualHeightsPolygon[] = [];

            // Process building layers
            for (let i = 0; i < result.buildingLayersVertices.length; i++) {
                for (let j = 0; j < result.buildingLayersVertices[i].length; j++) {
                    const vertices: THREE.Vector2[] = [];
                    let z = 0;
                    const height = result.buildingLayersHeights[i][j];

                    for (let k = 0; k < result.buildingLayersVertices[i][j].length; k += 3) {
                        vertices.push(new THREE.Vector2(
                            result.buildingLayersVertices[i][j][k],
                            result.buildingLayersVertices[i][j][k + 1]
                        ));

                        z = result.buildingLayersVertices[i][j][k + 2];
                    }

                    const buildingLayer = new EqualHeightsPolygon(this._settingsComponent, vertices, height, 'red', z);
                    buildingLayer.built = true;
                    buildingLayers.push(buildingLayer);
                    objectControllers.push(buildingLayer);
                }
            }

            // Process sub-sites
            const subSites: FlatPolygon[] = [];
            for (let i = 0; i < result.subSiteVertices.length; i++) {
                const vertices: THREE.Vector2[] = [];
                let z = 0;

                for (let j = 0; j < result.subSiteVertices[i].length; j += 3) {
                    vertices.push(new THREE.Vector2(
                        result.subSiteVertices[i][j],
                        result.subSiteVertices[i][j + 1]
                    ));

                    z = result.subSiteVertices[i][j + 2];
                }

                const subSite = new FlatPolygon(this._settingsComponent, vertices, 'grey', z);
                subSite.built = true;
                subSites.push(subSite);
                objectControllers.push(subSite);
            }

            // Process setbacks
            const subSiteSetbacks: FlatPolygon[] = [];
            for (let i = 0; i < result.subSiteSetbackVertices.length; i++) {
                const vertices: THREE.Vector2[] = [];
                let z = 0;

                for (let j = 0; j < result.subSiteSetbackVertices[i].length; j += 3) {
                    vertices.push(new THREE.Vector2(
                        result.subSiteSetbackVertices[i][j],
                        result.subSiteSetbackVertices[i][j + 1]
                    ));

                    z = result.subSiteSetbackVertices[i][j + 2];
                }

                const subSiteSetback = new FlatPolygon(this._settingsComponent, vertices, 'green', z);
                subSiteSetback.built = true;
                subSiteSetbacks.push(subSiteSetback);
                objectControllers.push(subSiteSetback);
            }

            // Update the generated plan controller
            if (this._generatedPlanController) removeCallback([this._generatedPlanController]);
            this._generatedPlanController = new GeneratedPlan(this._settingsComponent, generatedPlanParameters, buildingLayers, subSites, subSiteSetbacks);
            addCallback(objectControllers);
            
        }).catch(error => {
            console.error('Plan generation failed:', error);
            
            // Show user-friendly error message
            alert(`Plan generation failed: ${error.message}\n\nPlease check:\n1. Django server is running on http://localhost:8000\n2. Browser console for detailed error information`);
        });
    }

    public override populateAndActivateSettingsComponent(addCallback: (result: Base[]) => void, removeCallback: (result: Base[]) => void): void {
        if (!this._generatedPlanController) {
            this._settingsComponent.setMenus([]);
            return;
        }

        const generatedPlanSettingsMenuComponent = <GeneratedPlanSettingsMenuComponent polylineController={this} addCallback={addCallback} removeCallback={removeCallback} />;
        this._settingsComponent.setMenus([generatedPlanSettingsMenuComponent]);
    }
}