import Base from "../Options/Base";

export default class Default extends Base {
    constructor() {
        super();
        this._selected = null;
    }

    getOrUpdateObjects(settingsComponent, rayCasterFromCamera, gridIntersect, intersecting) {
        if (intersecting) {
            if (this._selected) {
                this._selected.unhighlight();
            }

            this._selected = intersecting;
            intersecting.highlight('yellow');
        }

        return [];
    }

    dispose() {
        this._selected?.unhighlight();
    }
}