import * as THREE from 'three';
import CameraController from '../Canvas/CameraController';
import ControlsController from '../Canvas/ControlsController';
import GeometryController from '../Canvas/Geometry/Controller';

export default class Controller {
    constructor(mount, popupComponent, settingsComponent, selectedOptionRef) {
        this._mount = mount;
        this._popupComponent = popupComponent;
        this._settingsComponent = settingsComponent;

        this._selectedOptionRef = selectedOptionRef;

        this._renderer = new THREE.WebGLRenderer();
        const { width, height } = this._mount.getBoundingClientRect();
        this._renderer.setSize(width, height);

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0xd3d3d3);
        this._cameraController = new CameraController(75, width / height, 0.1, 100000);
        this._controlsController = new ControlsController(this._cameraController.camera, this._renderer.domElement);
        this._geometryController = new GeometryController();

        this._isDragging = false;
        this._handleResizeWrapper = this.handleResize.bind(this);
        this._handleDocumentLeftClickWrapper = this.handleDoumentLeftClick.bind(this);
    }

    addGeometryObjects(objectControllers) {
        for (const objectController of objectControllers) {
            this._geometryController.add(objectController);

            for (const object of objectController.objects) {
                this._scene.add(object);
            }
        }
    }

    removeGeometryObjects(objectControllers) {
        for (const objectController of objectControllers) {
            this._geometryController.remove(objectController);

            for (const object of objectController.objects) {
                this._scene.remove(object);
            }
        }
    }

    handleResize(event) {
        event.preventDefault();
        const { width, height } = this._mount.getBoundingClientRect();
        this._renderer.setSize(width, height);
        this._cameraController.resize(width, height);
    }

    handleDoumentLeftClick() {
        if (this._isDragging) return;
        this._popupComponent.setOptions([]);
    }

    handleLeftClick(event) {
        if (this._isDragging) return;
        const rayCasterFromCamera = this._cameraController.createRayCasterFromMousePosition(this._mount.getBoundingClientRect(), event.clientX, event.clientY);
        const gridIntersect = this._geometryController.getIntersectionToGrid(rayCasterFromCamera);
        const intersectingObjectController = this._geometryController.getIntersectingObjectController(rayCasterFromCamera);
        this.addGeometryObjects(this._selectedOptionRef.current.getOrUpdateObjects(this._settingsComponent, rayCasterFromCamera, gridIntersect, intersectingObjectController));
    }

    handleRightClick(event) {
        if (this._isDragging) return;
        const rayCasterFromCamera = this._cameraController.createRayCasterFromMousePosition(this._mount.getBoundingClientRect(), event.clientX, event.clientY);
        const objectController = this._geometryController.getIntersectingObjectController(rayCasterFromCamera);
        const popupOptions = objectController ? objectController.getPopupOptions() : [];
        
        const wrappedPopupOptions = popupOptions.map(popupOption => ({
            name: popupOption.name,
            onClickWrapper: () => {
                popupOption.call(this.addGeometryObjects.bind(this), this.removeGeometryObjects.bind(this));
                this._popupComponent.setOptions([]);
            }
        }));

        wrappedPopupOptions.forEach(popupOption => {
            popupOption.onClickWrapper = popupOption.onClickWrapper.bind(this);
        });

        this._popupComponent.setXPosition(event.clientX - this._mount.getBoundingClientRect().left);
        this._popupComponent.setYPosition(event.clientY - this._mount.getBoundingClientRect().top);
        this._popupComponent.setOptions(wrappedPopupOptions);
    }

    handleZoom(event) {
        event.preventDefault();
        let rayCaster = this._cameraController.createRayCasterFromMousePosition(this._mount.getBoundingClientRect(), event.clientX, event.clientY);
        rayCaster.near = 0.1;

        const intersect = this._geometryController.getIntersection(rayCaster);

        if (intersect) {
            const distance = this._cameraController.camera.position.distanceTo(intersect);
            const zoomFactor = event.deltaY * 0.001;

            this._cameraController.camera.position.addScaledVector(
                this._cameraController.camera.position.clone().sub(intersect).normalize(),
                zoomFactor * distance
            );

            rayCaster = new THREE.Raycaster(this._cameraController.camera.position, this._cameraController.camera.getWorldDirection(new THREE.Vector3()));
            const intersectFromCenter = this._geometryController.getIntersectionToGrid(rayCaster);
            if (intersectFromCenter) this._controlsController.controls.target.copy(intersectFromCenter);
            else this._controlsController.controls.target.copy(intersect);
        }
    }

    handleMouseDown() {
        this._isDragging = false;
    }

    handleMouseMove() {
        this._isDragging = true;
    }

    initialize() {
        for (const objects of this._geometryController.initializeAndGetObjects()) {
            this._scene.add(objects);
        }

        this._renderer.setAnimationLoop(() => {
            this._renderer.render(this._scene, this._cameraController.camera);
        });

        window.addEventListener('resize', this._handleResizeWrapper);
        document.addEventListener('click', this._handleDocumentLeftClickWrapper);
        this._renderer.domElement.addEventListener('click', this.handleLeftClick.bind(this));
        this._renderer.domElement.addEventListener('wheel', this.handleZoom.bind(this));
        this._renderer.domElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this._renderer.domElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this._renderer.domElement.addEventListener('contextmenu', this.handleRightClick.bind(this));

        this._mount.appendChild(this._renderer.domElement);
    }

    dispose() {
        window.removeEventListener('resize', this._handleResizeWrapper);
        document.removeEventListener('click', this._handleDocumentLeftClickWrapper);
        this._mount.removeChild(this._renderer.domElement);
        this._controlsController.dispose();
        this._renderer.dispose();
    }
}