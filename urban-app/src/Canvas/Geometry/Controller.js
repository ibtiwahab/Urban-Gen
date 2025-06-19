import * as THREE from 'three';
import GridController from './GridController';
import Polyline from './ObjectControllers/Polyline';

export default class Controller {
    constructor(objectControllers) {
        this._gridController = new GridController();
        this._objectControllers = objectControllers || [];
        this._geometryHelpers = [];
    }

    initializeAndGetObjects() {
        return [...this._gridController.initializeAndGetGrid(), ...this._geometryHelpers];
    }

    getIntersectionToGrid(rayCaster) {
        return this._gridController.getIntersection(rayCaster);
    }

    getIntersection(rayCaster) {
        let closestIntersect = null;

        for (const controller of this._objectControllers) {
            if (!controller.built) continue;
            const intersect = controller.getClosestIntersection(rayCaster);

            if (intersect && (!closestIntersect || rayCaster.ray.origin.distanceTo(intersect) < rayCaster.ray.origin.distanceTo(closestIntersect))) {
                closestIntersect = intersect;
            }
        }

        return closestIntersect || this._gridController.getIntersection(rayCaster);
    }

    getIntersectingObjectController(rayCaster) {
        let closestIntersect = null;
        let objectController = null;

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

    add(object) {
        this._objectControllers.push(object);
        
        // If it's a polyline, automatically analyze its geometry
        if (object instanceof Polyline) {
            this.analyzePolylineGeometry(object);
        }
    }

    remove(object) {
        this._objectControllers = this._objectControllers.filter(controller => controller !== object);
        
        // Remove any geometry helpers associated with this object
        this.removeGeometryHelpers(object);
    }

    // Enhanced geometry operations
    async analyzePolylineGeometry(polyline) {
        try {
            if (typeof polyline.analyzeGeometry === 'function') {
                await polyline.analyzeGeometry();
                console.log('Polyline geometry analyzed:', {
                    area: polyline.getArea ? polyline.getArea() : 'N/A',
                    perimeter: polyline.getPerimeter ? polyline.getPerimeter() : 'N/A',
                    isValid: polyline.isValidGeometry ? polyline.isValidGeometry() : 'N/A',
                    isClosed: polyline.isClosed ? polyline.isClosed() : 'N/A',
                    hasSelfIntersections: polyline.hasSelfIntersections ? polyline.hasSelfIntersections() : 'N/A'
                });
            }
        } catch (error) {
            console.error('Failed to analyze polyline geometry:', error);
        }
    }

    async validateAllGeometry() {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline);
        
        for (const polyline of polylines) {
            try {
                if (typeof polyline.validateGeometry === 'function') {
                    await polyline.validateGeometry();
                }
            } catch (error) {
                console.error('Failed to validate polyline geometry:', error);
            }
        }
    }

    async createOffsetForPolyline(polyline, offsetDistance) {
        try {
            if (typeof polyline.createOffset === 'function') {
                const offsetLine = await polyline.createOffset(offsetDistance);
                
                if (offsetLine) {
                    // Add to geometry helpers for visualization
                    this._geometryHelpers.push(offsetLine);
                    console.log(`Created offset polyline with distance: ${offsetDistance}`);
                    return offsetLine;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Failed to create offset:', error);
            return null;
        }
    }

    showCentroids() {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline);
        
        polylines.forEach(polyline => {
            if (typeof polyline.getCentroid === 'function') {
                const centroid = polyline.getCentroid();
                if (centroid) {
                    // Create a sphere at the centroid
                    const geometry = new THREE.SphereGeometry(1, 8, 6);
                    const material = new THREE.MeshBasicMaterial({ color: 'yellow' });
                    const sphere = new THREE.Mesh(geometry, material);
                    
                    sphere.position.set(centroid.x, centroid.y, centroid.z);
                    this._geometryHelpers.push(sphere);
                }
            }
        });
    }

    hideCentroids() {
        // Remove all spheres (centroids)
        this._geometryHelpers = this._geometryHelpers.filter(helper => {
            if (helper instanceof THREE.Mesh && helper.geometry instanceof THREE.SphereGeometry) {
                return false; // Remove spheres
            }
            return true; // Keep other helpers
        });
    }

    showBoundingBoxes() {
        this._objectControllers.forEach(controller => {
            if (controller.objects) {
                controller.objects.forEach(obj => {
                    // Create bounding box helper
                    const box = new THREE.Box3().setFromObject(obj);
                    const helper = new THREE.Box3Helper(box, 0xffff00);
                    this._geometryHelpers.push(helper);
                });
            }
        });
    }

    hideBoundingBoxes() {
        // Remove all bounding box helpers
        this._geometryHelpers = this._geometryHelpers.filter(helper => {
            return !(helper instanceof THREE.Box3Helper);
        });
    }

    getGeometryStatistics() {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline);
        
        const stats = {
            totalPolylines: polylines.length,
            validPolylines: 0,
            closedPolylines: 0,
            selfIntersectingPolylines: 0,
            totalArea: 0,
            totalPerimeter: 0,
            averageArea: 0,
            averagePerimeter: 0
        };

        polylines.forEach(polyline => {
            if (polyline.isValidGeometry && polyline.isValidGeometry()) stats.validPolylines++;
            if (polyline.isClosed && polyline.isClosed()) stats.closedPolylines++;
            if (polyline.hasSelfIntersections && polyline.hasSelfIntersections()) stats.selfIntersectingPolylines++;
            
            if (polyline.getArea) stats.totalArea += polyline.getArea();
            if (polyline.getPerimeter) stats.totalPerimeter += polyline.getPerimeter();
        });

        if (polylines.length > 0) {
            stats.averageArea = stats.totalArea / polylines.length;
            stats.averagePerimeter = stats.totalPerimeter / polylines.length;
        }

        return stats;
    }

    clearGeometryHelpers() {
        this._geometryHelpers = [];
    }

    removeGeometryHelpers(object) {
        // Remove geometry helpers associated with a specific object
        // This is a placeholder - in a more sophisticated system, you'd track
        // which helpers belong to which objects
        this._geometryHelpers = this._geometryHelpers.filter(helper => {
            // Custom logic to determine if helper belongs to the removed object
            return true; // Keep all for now
        });
    }

    // Method to get all geometry helpers for rendering
    get geometryHelpers() {
        return this._geometryHelpers;
    }

    // Method to refresh all geometry analyses
    async refreshAllGeometry() {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline);
        
        for (const polyline of polylines) {
            try {
                if (typeof polyline.refreshGeometryAnalysis === 'function') {
                    await polyline.refreshGeometryAnalysis();
                }
            } catch (error) {
                console.error('Failed to refresh geometry for polyline:', error);
            }
        }
    }
}