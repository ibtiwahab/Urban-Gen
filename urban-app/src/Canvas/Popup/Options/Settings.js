import Base from './Base';

export default class Settings extends Base {
    static DEFAULT_NAME = "Settings";

    constructor(object) {
        super();
        this._object = object;
    }

    get name() {
        return Settings.DEFAULT_NAME;
    }

    call(addCallback, removeCallback) {
        this._object.populateAndActivateSettingsComponent(addCallback, removeCallback);
    }
}