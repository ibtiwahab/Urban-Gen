import * as THREE from 'three';
import PopupOptions from '../../Popup/Options/Base';
import DeletePopupOption from '../../Popup/Options/Delete';
import SettingsPopupOption from '../../Popup/Options/Settings';

export default class Base {
    static DEFAULT_BOUNDARY_COLOR = 'black';

    constructor(objects, objectControllers, settingsComponent) {
        this._built = false;
        this._objects = objects || [];
        this._objectsControllers = objectControllers || [];
        this._settingsComponent = settingsComponent;
    }

    get built() {
        return this._built;
    }

    set built(value) {
        this._built = value;
    }

    get objects() {
        let objects = [];
        objects = objects.concat(this._objects);

        for (let objectController of this._objectsControllers) {
            objects = objects.concat(objectController.objects);
        }

        return objects;
    }

    getPopupOptions() {
        return [new DeletePopupOption(this), new SettingsPopupOption(this)];
    }

    getClosestIntersection(rayCaster) {
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

    highlight(color) { }
    unhighlight() { }

    populateAndActivateSettingsComponent(addCallback, removeCallback) {
        this._settingsComponent.setMenus([]);
    }
}