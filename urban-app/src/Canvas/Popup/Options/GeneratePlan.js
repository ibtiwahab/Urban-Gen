import Base from './Base';

export default class GeneratePlan extends Base {
    static DEFAULT_NAME = "Generate plan";
    static GENERATED_NAME = "Re-generate plan";

    constructor(object) {
        super();
        this._polyline = object;
    }

    get name() {
        if (this._polyline.generatedPlanController) {
            return GeneratePlan.GENERATED_NAME;
        } else {
            return GeneratePlan.DEFAULT_NAME;
        }
    }

    call(addCallback, removeCallback) {
        this._polyline.generatePlan(addCallback, removeCallback);
    }
}