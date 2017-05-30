
import ObjPath from "./ObjPath";

interface PartTraversal {
    traverse(path: ObjPath, obj: any, fn: (path: ObjPath, obj: any) => void): void;
}

export default class ObjExp {


    constructor() {

    }

}