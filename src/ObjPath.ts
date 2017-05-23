
export type PathPart = string | number;

export default class ObjPath {

    parts: PathPart[];

    constructor(parts: PathPart[]) {
        this.parts = parts;
    }


};
