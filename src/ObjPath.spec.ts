import "jasmine";
import ObjPath from './ObjPath';

describe("ObjPath", () => {
    it("must keep path parts", () => {
        const parts =  ["a", 1, -1, "b", ""];
        expect(new ObjPath(parts).parts).toBe(parts);
    });
});
