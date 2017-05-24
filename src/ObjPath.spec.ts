import "mocha";
import { expect } from "chai";
import ObjPath from './ObjPath';

describe("ObjPath", () => {
    it("ctor must store parts", () => {
        const parts =  ["a", 1, -1, "b", ""];
        expect(new ObjPath(parts).parts).eq(parts);
    });

    describe("get()", () => {

        it("must return value by path", () => {
            expect(new ObjPath(["a", "b", 1]).get({ a: { b: [null, "test!"] } })).eq("test!");
        });

        it("must return obj when path is empty", () => {
            expect(new ObjPath([]).get(1)).eq(1);
        });

    });

    describe("set()", () => {

        it("must create all objects", () => {
            expect(new ObjPath(["a", "b", 1, 2, "login"]).set(null, 5)).eql({a: {b: [,[,,{login:5}]]}});
        });

        it("must change field in existing object", () => {

            const v = [{a: [,5]}];

            new ObjPath([0, "a", 1]).set(v, 200);
            expect(v[0].a[1]).eq(200);
        });

        it("must return value if path is empty", () => {
            let expected = {};
            expect(ObjPath.empty().set(null, expected)).eq(expected);
        });


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
