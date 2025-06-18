import * as THREE from 'three';
import GeometryObjectControllers from '../Canvas/Geometry/ObjectControllers/Base';

export default interface Base {
    getOrUpdateObjects(settingsComponent: any, rayCasterFromCamera: THREE.Raycaster, gridIntersect?: THREE.Vector3 | null, intersecting?: GeometryObjectControllers | null): GeometryObjectControllers[];
    dispose(): void;
}
