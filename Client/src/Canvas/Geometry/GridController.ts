import * as THREE from "three";

export default class GridController {
    protected _gridHelper: THREE.GridHelper;
    protected _plane: THREE.Plane;
    protected _axesHelper: THREE.AxesHelper;

    constructor() {
        this._gridHelper = new THREE.GridHelper(10, 10);
        this._gridHelper.rotation.x = Math.PI / 2;
        this._axesHelper = new THREE.AxesHelper(5);
        this._axesHelper.layers.set(1);
        this._plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    public initializeAndGetGrid(): THREE.Object3D[] {
        return [this._axesHelper, this._gridHelper];
    }

    public getIntersection(rayCaster: THREE.Raycaster): THREE.Vector3 | null {
        let intersection: THREE.Vector3 | null = new THREE.Vector3();
        intersection = rayCaster.ray.intersectPlane(this._plane, intersection);
        return intersection;
    }
}