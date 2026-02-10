// Part of the Chili3d Project, under the AGPL-3.0 License.
// See LICENSE file in the project root for full license information.

import {
    type EdgeMeshData,
    type I18nKeys,
    type ICurve,
    type IDocument,
    type IEdge,
    type IEqualityComparer,
    type IShape,
    type IShapeMeshData,
    type ITrimmedCurve,
    type IWire,
    type Line,
    Matrix4,
    Orientation,
    ParameterShapeNode,
    type Plane,
    Result,
    type Serialized,
    ShapeType,
    type XYZ,
    type XYZLike,
} from "chili-core";

export class TestEdge implements IEdge {
    constructor(
        readonly start: XYZ,
        readonly end: XYZ,
    ) {}
    transformed(_matrix: Matrix4): IShape {
        throw new Error("Method not implemented.");
    }
    transformedMul(_matrix: Matrix4): IShape {
        throw new Error("Method not implemented.");
    }
    edgesMeshPosition(): EdgeMeshData {
        throw new Error("Method not implemented.");
    }
    clone(): IShape {
        throw new Error("Method not implemented.");
    }

    dispose(): void {
        throw new Error("Method not implemented.");
    }
    update(_curve: ICurve): void {
        throw new Error("Method not implemented.");
    }
    trim(_start: number, _end: number): IEdge {
        throw new Error("Method not implemented.");
    }
    isClosed(): boolean {
        throw new Error("Method not implemented.");
    }
    isNull(): boolean {
        throw new Error("Method not implemented.");
    }
    reserve(): void {
        throw new Error("Method not implemented.");
    }
    section(_shape: IShape | Plane): IShape {
        throw new Error("Method not implemented.");
    }
    splitByWire(_edges: (IEdge | IWire)[]): IShape {
        throw new Error("Method not implemented.");
    }
    split(_shapes: IShape[]): IShape {
        throw new Error("Method not implemented.");
    }

    findAncestor(_ancestorType: ShapeType, _fromShape: IShape): IShape[] {
        throw new Error("Method not implemented.");
    }

    findSubShapes(_subshapeType: ShapeType): IShape[] {
        throw new Error("Method not implemented.");
    }
    iterShape(): IShape[] {
        throw new Error("Method not implemented.");
    }
    offset(_distance: number, _dir: XYZ): Result<IEdge> {
        throw new Error("Method not implemented.");
    }
    hlr(_position: XYZLike, _direction: XYZLike, _xDir: XYZLike): IShape {
        throw new Error("Method not implemented.");
    }

    intersect(_other: IEdge | Line) {
        return [];
    }
    length(): number {
        return this.start.distanceTo(this.end);
    }
    get curve(): ITrimmedCurve {
        throw new Error("Method not implemented.");
    }
    get id(): string {
        return "testEdge";
    }
    shapeType: ShapeType = ShapeType.Edge;
    matrix: Matrix4 = Matrix4.identity();
    get mesh(): IShapeMeshData {
        return {
            edges: {
                position: new Float32Array([
                    this.start.x,
                    this.start.y,
                    this.start.z,
                    this.end.x,
                    this.end.y,
                    this.end.z,
                ]),
                color: 0xff0000,
                lineType: "solid",
                range: [],
            },
            faces: undefined,
            vertexs: undefined,
        };
    }
    serialize(): Serialized {
        return {
            classKey: "Shape",
            properties: {},
        };
    }
    orientation(): Orientation {
        return Orientation.FORWARD;
    }
    isPartner(_other: IShape): boolean {
        return true;
    }
    isSame(_other: IShape): boolean {
        return true;
    }
    isEqual(other: IShape): boolean {
        if (other instanceof TestEdge) {
            return this.start.isEqualTo(other.start) && this.end.isEqualTo(other.end);
        }
        return false;
    }
}

export class TestNode extends ParameterShapeNode {
    override display(): I18nKeys {
        return "body.line";
    }
    constructor(
        document: IDocument,
        readonly start: XYZ,
        readonly end: XYZ,
    ) {
        super(document);
    }

    protected override setProperty<K extends keyof this>(
        property: K,
        newValue: this[K],
        _onPropertyChanged?: ((property: K, oldValue: this[K]) => void) | undefined,
        _equals?: IEqualityComparer<this[K]> | undefined,
    ): boolean {
        this.setPrivateValue(property, newValue);
        return true;
    }

    generateShape(): Result<IShape> {
        return Result.ok(new TestEdge(this.start, this.end));
    }
}
