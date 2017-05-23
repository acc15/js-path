
export type PathPart = string | number;

export default class ObjPath {

    private parts: PathPart[];

    constructor(parts: PathPart[]) {
        this.parts = parts;
    }


};
