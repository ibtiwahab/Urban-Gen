import Base from '../Base';
import EqualHeightsPolygon from '../EqualHeightsPolygon';
import FlatPolygon from '../FlatPolygon';
import Parameters from './Parameters';

export default class Controller extends Base {
    private _parameters: Parameters;

    constructor(settingsComponent: any, parameters: Parameters, buildingLayers: EqualHeightsPolygon[], subSites: FlatPolygon[], subSiteSetbacks: FlatPolygon[]) {
        const objectsControllers: Base[] = [
            ...buildingLayers,
            ...subSites,
            ...subSiteSetbacks
        ];

        super([], objectsControllers, settingsComponent);
        this._parameters = parameters;
    }

    public get parameters(): Parameters {
        return this._parameters;
    }
}
