import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class ControlsController{

    protected _controls: OrbitControls;
    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this._controls = new OrbitControls(camera, domElement);
        this._controls.enablePan = false;
        this._controls.enableZoom = false;

        this._controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            RIGHT: THREE.MOUSE.ROTATE
        };
    }

    get controls(): OrbitControls {
        return this._controls;
    }

    public dispose(): void {
        this._controls.dispose();
    }
}