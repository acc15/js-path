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

    describe("parse()", () => {

        it("must return valid path", () => {
            const p = ObjPath.parse("a.b[1].123[45]");
            expect(p.parts).eql(["a", "b", 1, "123", 45]);
        });

        it("must throw for empty array indexes", () => {
            expect(() => ObjPath.parse("[]")).throw();
        });

        it("must throw for non-numeric array indexes", () => {
            expect(() => ObjPath.parse("[NaN]")).throw();
            expect(() => ObjPath.parse("[4h]")).throw();
            expect(() => ObjPath.parse("[h4]")).throw();
        });

        it("must throw for negative indexes", () => {
            expect(() => ObjPath.parse("[-1]")).throw();
        });

        it("must throw for non-integer indexes", () => {
            expect(() => ObjPath.parse("[3.1415]")).throw();
        });

    });

});
