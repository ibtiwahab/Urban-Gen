import * as THREE from "three";

export default class CameraController {
    protected _camera: THREE.PerspectiveCamera;

    constructor(fov: number, aspect: number, near: number, far: number) {
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.z = 5;
        this._camera.up.set(0, 0, 1);
        this._camera.layers.enableAll();
        this._camera.updateProjectionMatrix();
    }

    get camera(): THREE.PerspectiveCamera {
        return this._camera;
    }

    public resize(width: number, height: number) {
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
    }

    public createRayCasterFromMousePosition(rect: DOMRect, clientX: number, clientY: number): THREE.Raycaster {
        const mouse = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
        let rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(mouse, this._camera);
        return rayCaster
    }
}
