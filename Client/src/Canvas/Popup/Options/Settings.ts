import GeometryObjectControllers from '../../Geometry/ObjectControllers/Base';
import Base from './Base';

export default class Settings implements Base {
    protected static readonly DEFAULT_NAME: string = "Settings";
    protected _object: GeometryObjectControllers;

    constructor(object: GeometryObjectControllers) {
        this._object = object;
    }

    get name(): string {
        return Settings.DEFAULT_NAME;
    }

    public call(addCallback: (result: GeometryObjectControllers[]) => void, removeCallback: (result: GeometryObjectControllers[]) => void): void {
        this._object.populateAndActivateSettingsComponent(addCallback, removeCallback);
    }
}
