import "jasmine";
import ObjPath from './ObjPath';

describe("A suite is just a function", () => {
  it("and so is a spec", () => {
    const p = new ObjPath(["a"]);
    expect(1).toBe(1);
  });
  it("second", () => {
      expect(true).toBe(false);
  });
});
    