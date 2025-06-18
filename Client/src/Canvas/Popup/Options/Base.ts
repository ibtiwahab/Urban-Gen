import GeometryObjectControllers from '../../Geometry/ObjectControllers/Base';

export default interface Base {
    get name(): string;
    call(addCallback: (result: GeometryObjectControllers[]) => void, removeCallback: (result: GeometryObjectControllers[]) => void): void;
}