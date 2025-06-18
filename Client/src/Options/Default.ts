import Base from "./Base";
import * as THREE from 'three';
import GeometryObjectControllers from '../Canvas/Geometry/ObjectControllers/Base';

export default class Default implements Base {
    private _selected: GeometryObjectControllers | null = null;

    public getOrUpdateObjects(_: any, __: THREE.Raycaster, ___?: THREE.Vector3 | null, intersecting?: GeometryObjectControllers | null): GeometryObjectControllers[] {
        if (intersecting) {
            if (this._selected) {
                this._selected.unhighlight();
            }

            this._selected = intersecting;
            intersecting.highlight('yellow');
        }

        return [];
    }

    public dispose() {
        this._selected?.unhighlight();
    }
}