
export type PathPart = string | number;

export type AnyPath = PathPart | PathPart[] | ObjPath;

export default class ObjPath {

    parts: PathPart[];

    constructor(parts: PathPart[]) {
        this.parts = parts;
    }

    get(obj: any): any {
        for (const part of this.parts) {
            if (obj === null || obj === undefined) {
                break;
            }
            obj = obj[part];
        }
        return obj;
    }

    set(obj: any, val: any): any {
        if (this.parts.length === 0) {
            return val;
        }

        if (obj === null || obj === undefined) {
            obj = ObjPath.createByPart(this.parts[0]);
        }

        const root = obj;
        for (let i = 0; i < this.parts.length - 1; i++) {
            const part = this.parts[i];
            if (obj[part] === null || obj[part] === undefined) {
                obj[part] = ObjPath.createByPart(this.parts[i + 1]);
            }
            obj = obj[part];
        }
        obj[this.parts[this.parts.length - 1]] = val;
        return root;
    }

    apply(obj: any, val: any): any {
        if (this.parts.length === 0) {
            return val;
        }

        const root: any = ObjPath.shallowCopyForPart(obj, this.parts[0]);

        let copy = root;
        for (let i = 0; i < this.parts.length - 1; i++) {
            const part = this.parts[i];
            obj = (obj !== null && obj !== undefined) ? obj[part] : obj;
            copy = copy[part] = ObjPath.shallowCopyForPart(obj, part);
        }

        copy[this.parts[this.parts.length - 1]] = val;
        return root;
    }

    empty(): boolean {
        return this.parts.length === 0;
    }

    concat(p: AnyPath): ObjPath {
        if (typeof p === "string") {
            return this.concat(ObjPath.parse(p));
        } else if (p instanceof ObjPath) {
            return this.concat(p.parts);
        } else {
            return new ObjPath(this.parts.concat(p));
        }
    }

    eq(p: AnyPath): boolean {
        const other = ObjPath.of(p);
        if (this.parts.length !== other.parts.length) {
            return false;
        }
        for (let i = 0; i < this.parts.length; i++) {
            if (this.parts[i] !== other.parts[i]) {
                return false;
            }
        }
        return true;
    }

    toString(): string {
        let s = "";
        for (let part of this.parts) {
            s += typeof part === "number" ? "[" + part + "]" : (s.length > 0 ? "." : "") + part;
        }
        return s;
    }

    static empty(): ObjPath {
        return new ObjPath([]);
    }

    static of(p: AnyPath): ObjPath {
        if (p instanceof ObjPath) {
            return p;
        } else if (Array.isArray(p)) {
            return new ObjPath(p);
        } else if (typeof p === "string") {
            return ObjPath.parse(p);
        } else if (typeof p === "number") {
            return new ObjPath([p]);
        } else {
            return ObjPath.empty();
        }
    }

    static parse(path: string): ObjPath {

        const parts: PathPart[] = [];

        let part: string | null = null;
        let index: boolean = false;
        for (const ch of path) {
            if (index ? ch === ']' : (ch === '[' || ch === '.')) {
                if (part !== null) {
                    parts.push(ObjPath.parsePart(part, index));
                }
                part = index ? null : "";
                index = !index && ch === '[';
                continue;
            }
            part = part === null ? ch : part + ch;
        }
        if (part !== null) {
            parts.push(ObjPath.parsePart(part, index));
        }
        return new ObjPath(parts);
    }

    static shallowCopyForPart(obj: any, part: PathPart): any[] | object {
        if (!obj) {
            return ObjPath.createByPart(part);
        }

        if (Array.isArray(obj)) {
            return obj.slice();
        }

        const result: any = {};
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== part) {
                result[prop] = obj[prop];
            }
        }
        return result;
    }

    static createByPart(part: PathPart): any[] | object {
        return ObjPath.isIndex(part) ? [] : {};
    }

    static isIndex(part: PathPart): part is number {
        return typeof part === "number";
    }

    static parsePart(part: string, index: boolean): PathPart {
        if (!index) {
            return part;
        }
        if (part.indexOf('.') >= 0) {
            throw "array indexes must be integer";
        }
        if (part.indexOf('-') >= 0) {
            throw "array indexes must be positive";
        }
        if (!/^[0-9]+$/.test(part)) {
            throw "array indexes must be a number";
        }
        return Number(part);
    }

};
