import * as THREE from 'three';
import PopupOptions from '../../Popup/Options/Base';
import DeletePopupOption from '../../Popup/Options/Delete';
import SettingsPopupOption from '../../Popup/Options/Settings';

export default class Base {
    protected static readonly DEFAULT_BOUNDARY_COLOR: string | number | THREE.Color = 'black';

    protected _built: boolean = false;
    protected _objects: THREE.Object3D[];
    protected _objectsControllers: Base[];
    protected _settingsComponent: any;

    constructor(objects: THREE.Object3D[], objectControllers: Base[], settingsComponent: any) {
        this._objects = objects;
        this._objectsControllers = objectControllers;
        this._settingsComponent = settingsComponent;
    }

    get built(): boolean {
        return this._built;
    }

    set built(value: boolean) {
        this._built = value;
    }

    get objects(): THREE.Object3D[] {
        let objects: THREE.Object3D[] = [];
        objects = objects.concat(this._objects);

        for (let objectController of this._objectsControllers) {
            objects = objects.concat(objectController.objects);
        }

        return objects;
    }

    public getPopupOptions(): PopupOptions[] {
        return [new DeletePopupOption(this), new SettingsPopupOption(this)];
    }

    public getClosestIntersection(rayCaster: THREE.Raycaster): THREE.Vector3 | null {
        if (this._built == false) return null;
        let closestIntersect = null;
        let objects = this.objects;

        for (let i = 0; i < objects.length; i++) {
            const intersect = rayCaster.intersectObject(objects[i], true);

            if ((intersect.length > 0) && (!closestIntersect || (rayCaster.ray.origin.distanceTo(intersect[0].point) < rayCaster.ray.origin.distanceTo(closestIntersect)))) {
                closestIntersect = intersect[0].point;
            }
        }

        return closestIntersect;
    }

    public highlight(_: string | number | THREE.Color): void { }
    public unhighlight(): void { }

    public populateAndActivateSettingsComponent(_: (result: Base[]) => void, __: (result: Base[]) => void) {
        this._settingsComponent.setMenus([]);
    }
}
