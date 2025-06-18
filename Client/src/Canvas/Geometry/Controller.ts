import * as THREE from 'three';
import GridController from './GridController';
import ObjectControllers from './ObjectControllers/Base';

export default class Controller {
    private _gridController: GridController;
    private _objectControllers: ObjectControllers[] = [];

    constructor(objectControllers?: ObjectControllers[]) {
        this._gridController = new GridController();
        if (objectControllers) this._objectControllers = objectControllers;
    }

    public initializeAndGetObjects(): THREE.Object3D[] {
        return this._gridController.initializeAndGetGrid();
    }

    public getIntersectionToGrid(rayCaster: THREE.Raycaster): THREE.Vector3 | null {
        return this._gridController.getIntersection(rayCaster);
    }

    public getIntersection(rayCaster: THREE.Raycaster): THREE.Vector3 | null {
        let closestIntersect = null;

        for (const controller of this._objectControllers) {
            if (!controller.built) continue;
            const intersect = controller.getClosestIntersection(rayCaster);

            if (intersect && (!closestIntersect || rayCaster.ray.origin.distanceTo(intersect) < rayCaster.ray.origin.distanceTo(closestIntersect))) {
                closestIntersect = intersect;
            }
        }

        return closestIntersect ?? this._gridController.getIntersection(rayCaster);
    }

    public getIntersectingObjectController(rayCaster: THREE.Raycaster): ObjectControllers | null {
        let closestIntersect = null;
        let objectController: ObjectControllers | null = null;

        for (const controller of this._objectControllers) {
            if (!controller.built) continue;
            const intersect = controller.getClosestIntersection(rayCaster);

            if (intersect && (!closestIntersect || rayCaster.ray.origin.distanceTo(intersect) < rayCaster.ray.origin.distanceTo(closestIntersect))) {
                closestIntersect = intersect;
                objectController = controller;
            }
        }

        return objectController;
    }

    public add(object: ObjectControllers): void {
        this._objectControllers.push(object);
    }

    public remove(object: ObjectControllers): void {
        this._objectControllers = this._objectControllers.filter(controller => controller !== object);
    }
}
