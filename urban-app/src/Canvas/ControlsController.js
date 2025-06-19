import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class ControlsController {
    constructor(camera, domElement) {
        this._controls = new OrbitControls(camera, domElement);
        this._controls.enablePan = false;
        this._controls.enableZoom = false;

        this._controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            RIGHT: THREE.MOUSE.ROTATE
        };
    }

    get controls() {
        return this._controls;
    }

    dispose() {
        this._controls.dispose();
    }
}