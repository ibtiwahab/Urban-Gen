import Base from "./Base";
import * as THREE from 'three';
import GeometryObjectControllers from '../Canvas/Geometry/ObjectControllers/Base';
import PolylineGeometryController from '../Canvas/Geometry/ObjectControllers/Polyline';

export default class Polyline implements Base {
    protected _polylineController: PolylineGeometryController | null = null;
    protected _returned: boolean = false;

    public getOrUpdateObjects(settingsComponent: any, rayCasterFromCamera: THREE.Raycaster, gridIntersect?: THREE.Vector3 | null, _?: GeometryObjectControllers | null): GeometryObjectControllers[]
    {
        if (!gridIntersect) return [];

        if (!this._polylineController) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([gridIntersect.x, gridIntersect.y, gridIntersect.z]), 3));
            this._polylineController = new PolylineGeometryController(new THREE.Line(geometry), settingsComponent);
            return [];
        }
        
        const polyline = this._polylineController.polyline;
        const geometry = polyline.geometry as THREE.BufferGeometry;

        let positions = geometry.getAttribute('position');
        let flattenedVertices = positions ? Array.from(positions.array) : [];
        const rayOrigin = rayCasterFromCamera.ray.origin;

        for (let i = 0; i < flattenedVertices.length; i += 3) {
            const x = flattenedVertices[i];
            const y = flattenedVertices[i + 1];
            const z = flattenedVertices[i + 2];
            const vertice = new THREE.Vector3(x, y, z);

            const originToIntersect = new THREE.Vector3().subVectors(gridIntersect, rayOrigin);
            const originToFirstVertex = new THREE.Vector3().subVectors(vertice, rayOrigin);
            const angle = THREE.MathUtils.radToDeg(originToIntersect.angleTo(originToFirstVertex));

            if ((i == 0) && (angle < 1) && (flattenedVertices.length >= 9)) {
                gridIntersect = vertice;
                this._polylineController.built = true;
                this._polylineController = null;
                this._returned = false;
                break;
            }
            else if ((i == 0) && (angle < 1)) return [];
        }

        flattenedVertices.push(gridIntersect.x, gridIntersect.y, gridIntersect.z);
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(flattenedVertices), 3));
        geometry.attributes.position.needsUpdate = true;

        if (((flattenedVertices.length / 3) >= 2) && !this._returned && this._polylineController) {
            this._returned = true;
            return [this._polylineController];
        }

        return [];
    }

    public dispose() {
        if (this._polylineController) this._polylineController.built = true;
    }
}
