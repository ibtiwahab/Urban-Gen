import Base from './Base';

export default class Delete extends Base {
    static DEFAULT_NAME = "Delete";

    constructor(object) {
        super();
        this._object = object;
    }

    get name() {
        return Delete.DEFAULT_NAME;
    }

    call(addCallback, removeCallback) {
        removeCallback([this._object]);
    }
}