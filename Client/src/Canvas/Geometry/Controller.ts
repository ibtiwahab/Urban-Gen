import * as THREE from 'three';
import GridController from './GridController';
import ObjectControllers from './ObjectControllers/Base';
import Polyline from './ObjectControllers/Polyline';

export default class Controller {
    private _gridController: GridController;
    private _objectControllers: ObjectControllers[] = [];
    private _geometryHelpers: THREE.Object3D[] = [];

    constructor(objectControllers?: ObjectControllers[]) {
        this._gridController = new GridController();
        if (objectControllers) this._objectControllers = objectControllers;
    }

    public initializeAndGetObjects(): THREE.Object3D[] {
        return [...this._gridController.initializeAndGetGrid(), ...this._geometryHelpers];
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
        
        // If it's a polyline, automatically analyze its geometry
        if (object instanceof Polyline) {
            this.analyzePolylineGeometry(object);
        }
    }

    public remove(object: ObjectControllers): void {
        this._objectControllers = this._objectControllers.filter(controller => controller !== object);
        
        // Remove any geometry helpers associated with this object
        this.removeGeometryHelpers(object);
    }

    // Enhanced geometry operations
    public async analyzePolylineGeometry(polyline: Polyline): Promise<void> {
        try {
            await polyline.analyzeGeometry();
            console.log('Polyline geometry analyzed:', {
                area: polyline.getArea(),
                perimeter: polyline.getPerimeter(),
                isValid: polyline.isValidGeometry(),
                isClosed: polyline.isClosed(),
                hasSelfIntersections: polyline.hasSelfIntersections()
            });
        } catch (error) {
            console.error('Failed to analyze polyline geometry:', error);
        }
    }

    public async validateAllGeometry(): Promise<void> {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline) as Polyline[];
        
        for (const polyline of polylines) {
            try {
                await polyline.validateGeometry();
            } catch (error) {
                console.error('Failed to validate polyline geometry:', error);
            }
        }
    }

    public async createOffsetForPolyline(polyline: Polyline, offsetDistance: number): Promise<THREE.Line | null> {
        try {
            const offsetLine = await polyline.createOffset(offsetDistance);
            
            if (offsetLine) {
                // Add to geometry helpers for visualization
                this._geometryHelpers.push(offsetLine);
                console.log(`Created offset polyline with distance: ${offsetDistance}`);
                return offsetLine;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to create offset:', error);
            return null;
        }
    }

    public showCentroids(): void {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline) as Polyline[];
        
        polylines.forEach(polyline => {
            const centroid = polyline.getCentroid();
            if (centroid) {
                // Create a sphere at the centroid
                const geometry = new THREE.SphereGeometry(1, 8, 6);
                const material = new THREE.MeshBasicMaterial({ color: 'yellow' });
                const sphere = new THREE.Mesh(geometry, material);
                
                sphere.position.set(centroid.x, centroid.y, centroid.z);
                this._geometryHelpers.push(sphere);
            }
        });
    }

    public hideCentroids(): void {
        // Remove all spheres (centroids)
        this._geometryHelpers = this._geometryHelpers.filter(helper => {
            if (helper instanceof THREE.Mesh && helper.geometry instanceof THREE.SphereGeometry) {
                return false; // Remove spheres
            }
            return true; // Keep other helpers
        });
    }

    public showBoundingBoxes(): void {
        this._objectControllers.forEach(controller => {
            controller.objects.forEach(obj => {
                // Create bounding box helper
                const box = new THREE.Box3().setFromObject(obj);
                const helper = new THREE.Box3Helper(box, 0xffff00);
                this._geometryHelpers.push(helper);
            });
        });
    }

    public hideBoundingBoxes(): void {
        // Remove all bounding box helpers
        this._geometryHelpers = this._geometryHelpers.filter(helper => {
            return !(helper instanceof THREE.Box3Helper);
        });
    }

    public getGeometryStatistics(): any {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline) as Polyline[];
        
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
            if (polyline.isValidGeometry()) stats.validPolylines++;
            if (polyline.isClosed()) stats.closedPolylines++;
            if (polyline.hasSelfIntersections()) stats.selfIntersectingPolylines++;
            
            stats.totalArea += polyline.getArea();
            stats.totalPerimeter += polyline.getPerimeter();
        });

        if (polylines.length > 0) {
            stats.averageArea = stats.totalArea / polylines.length;
            stats.averagePerimeter = stats.totalPerimeter / polylines.length;
        }

        return stats;
    }

    public clearGeometryHelpers(): void {
        this._geometryHelpers = [];
    }

    private removeGeometryHelpers(object: ObjectControllers): void {
        // Remove geometry helpers associated with a specific object
        // This is a placeholder - in a more sophisticated system, you'd track
        // which helpers belong to which objects
        this._geometryHelpers = this._geometryHelpers.filter(helper => {
            // Custom logic to determine if helper belongs to the removed object
            return true; // Keep all for now
        });
    }

    // Method to get all geometry helpers for rendering
    public get geometryHelpers(): THREE.Object3D[] {
        return this._geometryHelpers;
    }

    // Method to refresh all geometry analyses
    public async refreshAllGeometry(): Promise<void> {
        const polylines = this._objectControllers.filter(obj => obj instanceof Polyline) as Polyline[];
        
        for (const polyline of polylines) {
            try {
                await polyline.refreshGeometryAnalysis();
            } catch (error) {
                console.error('Failed to refresh geometry for polyline:', error);
            }
        }
    }
}