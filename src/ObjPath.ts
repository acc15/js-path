
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


};
