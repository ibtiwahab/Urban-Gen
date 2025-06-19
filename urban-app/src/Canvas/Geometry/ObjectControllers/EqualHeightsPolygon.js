import * as THREE from 'three';
import Base from './Base';

export default class EqualHeightsPolygon extends Base {
    constructor(settingsComponent, vertices, height, color, z) {
        const shape = new THREE.Shape(vertices);

        const extrudeSettings = {
            depth: height,
            bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const material = new THREE.MeshBasicMaterial({
            color: color,    
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        if (z) mesh.position.z = z;

        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const boundaryLines = new THREE.LineSegments(edges, lineMaterial);
        if (z) boundaryLines.position.z = z;

        super([mesh, boundaryLines], [], settingsComponent);
        this._boundaryLines = boundaryLines;
    }

    highlight(color) {
        this._boundaryLines.material = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide
        });
    }

    unhighlight() {
        this._boundaryLines.material = new THREE.MeshBasicMaterial({
            color: EqualHeightsPolygon.DEFAULT_BOUNDARY_COLOR,
            side: THREE.DoubleSide
        });
    }
}