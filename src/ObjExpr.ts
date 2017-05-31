
import ObjPath, {PathPart} from "./ObjPath";

export type PartFn = (part: PathPart) => void;
export type PathFn = (path: ObjPath, val: any) => void;

export interface PartExpr {
    traverse(ctx: any, fn: PartFn): void;
}

class SimpleExpr implements PartExpr {

    part: PathPart;

    constructor(part: PathPart) {
        this.part = part;
    }

    traverse(ctx: any, fn: PartFn): void {
        fn(this.part);
    }
}

class VariantExpr implements PartExpr {

    expressions: PartExpr[];

    constructor(expressions: PartExpr[]) {
        this.expressions = expressions;
    }

    traverse(ctx: any, fn: PartFn): void {
        this.expressions.forEach(e => e.traverse(ctx, p => fn(p)));
    }
}

class SequenceExpr implements PartExpr {

    expressions: PartExpr[];

    constructor(expressions: PartExpr[]) {
        this.expressions = expressions;
    }

    traverse(ctx: any, fn: PartFn): void {
        this.traverseSubPart(ctx, 0, "", fn);
    }

    traverseSubPart(ctx: any, index: number, part: string, fn: PartFn) {
        if (this.expressions[index]) {
            this.expressions[index].traverse(ctx, p => this.traverseSubPart(ctx, index + 1, part + String(p), fn));
        } else {
            fn(part);
        }
    }
}

class RangeExpr implements PartExpr{

    min: number;
    max: number;
    step: number;

    constructor(min: number, max: number, step: number) {
        this.min = min;
        this.max = max;
        this.step = step;
    }

    traverse(ctx: any, fn: PartFn): void {
        for (let i = this.min; i <= this.max; i+= this.step) {
            fn(i);
        }
    }
}

class AnyKeyExpr implements PartExpr {
    traverse(obj: any, fn: PartFn): void {
        if (obj) {
            Object.keys(obj).forEach(k => fn(k));
        }
    }
}

export namespace Expressions {
    function any(): PartExpr { return new AnyKeyExpr(); }
    function part(p: PathPart): PartExpr { return new SimpleExpr(p); }
    function seq(expressions: PartExpr[]): PartExpr { return new SequenceExpr(expressions); }
    function choice(expressions: PartExpr[]): PartExpr { return new VariantExpr(expressions); }
    function range(min: number, max: number, step: number = 1): PartExpr { return new RangeExpr(min, max, step); }
}

export default class ObjExpr {

    parts: PartExpr[];

    constructor(parts: PartExpr[]) {
        this.parts = parts;
    }

    static parse(expr: string): ObjExpr {
        return new ObjExpr([]);
    }

    traverse(ctx: any, fn: PathFn) {
        this.traversePart(ObjPath.empty(), ctx, 0, fn);
    }

    traversePart(path: ObjPath, obj: any, index: number, fn: PathFn) {
        if (index >= this.parts.length) {
            fn(path, obj);
            return;
        }
        this.parts[index].traverse(obj, p => this.traversePart(path.concat(p), obj[p], index + 1, fn));
    }

}