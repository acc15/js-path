import "mocha";
import { expect } from "chai";
import ObjPath from './ObjPath';

describe("ObjPath", () => {
    it("must keep path parts", () => {
        const parts =  ["a", 1, -1, "b", ""];
        expect(new ObjPath(parts).parts).eq(parts);
    });

    it("must get() value by path", () => {
        expect(new ObjPath(["a", "b", 1]).get({ a: { b: [null, "test!"] } })).eq("test!");
    });

});
