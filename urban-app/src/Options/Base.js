// Base interface/class for options
// In JavaScript, we can use a simple class structure instead of interface

export default class Base {
    getOrUpdateObjects(settingsComponent, rayCasterFromCamera, gridIntersect, intersecting) {
        throw new Error('getOrUpdateObjects method must be implemented');
    }

    dispose() {
        throw new Error('dispose method must be implemented');
    }
}