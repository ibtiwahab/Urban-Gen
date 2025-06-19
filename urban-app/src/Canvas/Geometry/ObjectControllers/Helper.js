import * as THREE from 'three';

export default class Helper {
    static findClosestToPointFromRayCasterOnLine(rayCaster, lineStart, lineEnd) {
        const solver = new THREE.Vector3();
        const rayOrigin = rayCaster.ray.origin.clone();
        const rayDirection = rayCaster.ray.direction.clone().normalize();
        const lineDirection = solver.subVectors(lineStart, lineEnd).normalize();

        const cn = solver.crossVectors(rayDirection, lineDirection).normalize();
        const rayToLine = solver.clone().subVectors(lineStart, rayOrigin);
        if (rayToLine.clone().dot(rayDirection) < 0) return null;

        const rejection = solver.clone().subVectors(
            solver.clone().subVectors(
                rayToLine,
                rayDirection.clone().multiplyScalar(rayToLine.clone().dot(rayDirection))
            ),
            cn.clone().multiplyScalar(rayToLine.clone().dot(cn))
        );

        return solver.clone().subVectors(
            lineStart,
            lineDirection.multiplyScalar(rejection.length()).divideScalar(lineDirection.clone().dot(rejection.clone().normalize()))
        );
    }
}