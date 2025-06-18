import * as THREE from 'three';
import Base from './Base';

export default class FlatPolygon extends Base {
    protected _boundaryLines: THREE.LineSegments;

    constructor(settingsComponent: any, vertices: THREE.Vector2[], color: string | number | THREE.Color, z?: number) {
        const shape = new THREE.Shape(vertices);

        const shapeGeometry = new THREE.ShapeGeometry(shape);

        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });

        const mesh = new THREE.Mesh(shapeGeometry, material);

        if (z) mesh.position.z = z;

        const edges = new THREE.EdgesGeometry(shapeGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const boundaryLines = new THREE.LineSegments(edges, lineMaterial);
        if (z) boundaryLines.position.z = z;

        super([mesh, boundaryLines], [], settingsComponent);
        this._boundaryLines = boundaryLines;
    }

    public override highlight(color: string | number | THREE.Color): void {
        this._boundaryLines.material = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide
        });
    }

    public override unhighlight(): void {
        this._boundaryLines.material = new THREE.MeshBasicMaterial({
            color: FlatPolygon.DEFAULT_BOUNDARY_COLOR,
            side: THREE.DoubleSide
        });
    }
}