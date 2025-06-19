import Base from '../Base';

export default class Controller extends Base {
    constructor(settingsComponent, parameters, buildingLayers, subSites, subSiteSetbacks) {
        const objectsControllers = [
            ...buildingLayers,
            ...subSites,
            ...subSiteSetbacks
        ];

        super([], objectsControllers, settingsComponent);
        this._parameters = parameters;
    }

    get parameters() {
        return this._parameters;
    }
}