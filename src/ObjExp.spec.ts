import "mocha";
import { expect } from "chai";
import ObjExp from './ObjExp';

describe("ObjPath", () => {
    it("ctor must store parts", () => {
        const parts =  ["a", 1, -1, "b", ""];
        expect(new ObjExp(parts).parts).eq(parts);
    });

});
