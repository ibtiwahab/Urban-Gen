import GeometryObjectControllers from '../../Geometry/ObjectControllers/Base';
import PolylineGeometryController from '../../Geometry/ObjectControllers/Polyline';
import Base from './Base';

export default class GeneratePlan implements Base {
    protected static readonly DEFAULT_NAME: string = "Generate plan";
    protected static readonly GENERATED_NAME: string = "Re-generate plan";

    protected _polyline: PolylineGeometryController;

    constructor(object: PolylineGeometryController) {
        this._polyline = object;
    }

    get name(): string {
        if (this._polyline.generatedPlanController) {
            return GeneratePlan.GENERATED_NAME;
        } else {
            return GeneratePlan.DEFAULT_NAME;
        }
    }

    call(addCallback: (result: GeometryObjectControllers[]) => void, removeCallback: (result: GeometryObjectControllers[]) => void): void {
        this._polyline.generatePlan(addCallback, removeCallback);
    }
}