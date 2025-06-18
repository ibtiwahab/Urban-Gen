import GeometryObjectControllers from '../../Geometry/ObjectControllers/Base';
import Base from './Base';

export default class Delete implements Base {
    protected static readonly DEFAULT_NAME: string = "Delete";

    protected _object: GeometryObjectControllers;

    constructor(object: GeometryObjectControllers) {
        this._object = object;
    }

    get name(): string {
        return Delete.DEFAULT_NAME
    }

    public call(_: (result: GeometryObjectControllers[]) => void, removeCallback: (result: GeometryObjectControllers[]) => void): void {
        removeCallback([this._object]);
    }
}