
import {PathPart} from "./ObjPath";
import ObjPath from "./ObjPath";

export type PartFn = (part: PathPart, obj: any) => void;
export type PathFn = (path: ObjPath, obj: any) => void;

export interface PartExpr {
    traverse(context: any, fn: PartFn): void;
}

class SimpleExpr implements PartExpr {

    part: PathPart;

    traverse(context: any, fn: PartFn): void {
        fn(this.part, context[this.part]);
    }
}

class VariantExpr implements PartExpr {

    expressions: PartExpr[];

    constructor(expressions: PartExpr[]) {
        this.expressions = expressions;
    }

    traverse(context: any, fn: PartFn): void {
        for (const e of this.expressions) {
            e.traverse(context, (part, val) => {
                fn(part, val);
            });
        }
    }
}

class RangeExpr implements PartExpr{

    min: number;
    max: number;
    step: number;

    constructor(min: number, max: number, step: number = 1) {
        this.min = min;
        this.max = max;
        this.step = step;
    }

    traverse(context: any, fn: PartFn): void {
        for (let i = this.min; i <= this.max; i+= this.step) {
            fn(i, context[i]);
        }
    }
}

class AnyKeyExpr implements PartExpr {
    traverse(obj: any, fn: PartFn): void {
        if (obj) {
            Object.keys(obj).forEach(k => fn(k, obj[k]));
        }
    }
}

export default class ObjExpr {

    parts: PartExpr[];

    constructor(parts: PartExpr[]) {
        this.parts = parts;
    }

    static parse(expr: string): ObjExpr {
        return new ObjExpr([]);
    }

    traverse(context: any, fn: PathFn) {

    }

}