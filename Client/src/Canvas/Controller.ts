import * as THREE from 'three';
import CameraController from './CameraController';
import ControlsController from './ControlsController';
import GeometryController from './Geometry/Controller';
import Options from '../Options/Base';
import GeometryObjectControllers from './Geometry/ObjectControllers/Base';

export default class Controller {
    protected _mount: HTMLDivElement;
    protected _popupComponent: any;
    protected _settingsComponent: any;
    protected _selectedOptionRef: { current: Options };
    protected _renderer: THREE.WebGLRenderer;
    protected _scene: THREE.Scene;
    protected _cameraController: CameraController;
    protected _controlsController: ControlsController;
    protected _geometryController: GeometryController;
    protected _isDragging: boolean = false;
    protected _handleResizeWrapper: (e: Event) => void;
    protected _handleDocumentLeftClickWrapper: () => void;

    constructor(mount: HTMLDivElement, popupComponent: any, settingsComponent: any, selectedOptionRef: { current: Options }) {
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

        this._handleResizeWrapper = this.handleResize.bind(this);
        this._handleDocumentLeftClickWrapper = this.handleDoumentLeftClick.bind(this);
    }

    protected addGeometryObjects(objectControllers: GeometryObjectControllers[]): void {
        for (const objectController of objectControllers) {
            this._geometryController.add(objectController);

            for (const object of objectController.objects) {
                this._scene.add(object);
            }
        }
    }

    protected removeGeometryObjects(objectControllers: GeometryObjectControllers[]): void {
        for (const objectController of objectControllers) {
            this._geometryController.remove(objectController);

            for (const object of objectController.objects) {
                this._scene.remove(object);
            }
        }
    }

    protected handleResize(event: Event): void {
        event.preventDefault();
        const { width, height } = this._mount.getBoundingClientRect();
        this._renderer.setSize(width, height);
        this._cameraController.resize(width, height);
    }

    protected handleDoumentLeftClick(): void {
        if (this._isDragging) return;
        this._popupComponent.setOptions([]);
    }

    protected handleLeftClick(event: MouseEvent): void {
        if (this._isDragging) return;
        const rayCasterFromCamera = this._cameraController.createRayCasterFromMousePosition(this._mount.getBoundingClientRect(), event.clientX, event.clientY);
        const gridIntersect = this._geometryController.getIntersectionToGrid(rayCasterFromCamera);
        const intersectingObjectController = this._geometryController.getIntersectingObjectController(rayCasterFromCamera);
        this.addGeometryObjects(this._selectedOptionRef.current.getOrUpdateObjects(this._settingsComponent, rayCasterFromCamera, gridIntersect, intersectingObjectController));
    }

    protected handleRightClick(event: MouseEvent): void {
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

    protected handleZoom(event: WheelEvent): void {
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

    protected handleMouseDown() {
        this._isDragging = false;
    };

    protected handleMouseMove() {
        this._isDragging = true;
    };

    public initialize(): void {
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

    public dispose(): void {
        window.removeEventListener('resize', this._handleResizeWrapper);
        document.removeEventListener('click', this._handleDocumentLeftClickWrapper);
        this._mount.removeChild(this._renderer.domElement);
        this._controlsController.dispose();
        this._renderer.dispose();
    }
}