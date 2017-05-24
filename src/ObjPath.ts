
export type PathPart = string | number;

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
