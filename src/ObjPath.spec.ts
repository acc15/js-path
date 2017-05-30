import "mocha";
import {expect} from "chai";
import ObjPath from './ObjPath';

describe("ObjPath", () => {
    it("ctor must store parts", () => {
        const parts = ["a", 1, -1, "b", ""];
        expect(new ObjPath(parts).parts).eq(parts);
    });

    describe("get()", () => {

        it("must return value by path", () => {
            expect(new ObjPath(["a", "b", 1]).get({a: {b: [null, "test!"]}})).eq("test!");
        });

        it("must return obj when path is empty", () => {
            expect(new ObjPath([]).get(1)).eq(1);
        });

    });

    describe("set()", () => {

        it("must create all objects", () => {
            expect(new ObjPath(["a", "b", 1, 2, "login"]).set(null, 5)).eql({a: {b: [, [, , {login: 5}]]}});
        });

        it("must change field in existing object", () => {

            const v = [{a: [, 5]}];

            new ObjPath([0, "a", 1]).set(v, 200);
            expect(v[0].a[1]).eq(200);
        });

        it("must return value if path is empty", () => {
            const expected = {};
            expect(ObjPath.empty().set(null, expected)).eq(expected);
        });
    });

    describe("apply()", () => {

        it("must return value if path is empty", () => {
            const expected = {};
            expect(ObjPath.empty().apply(null, expected)).eq(expected);
        });

        it("must return new object with shallow copies of other fields", () => {

            const obj = {
                a: {b: 1},
                b: {c: "subject to change"}
            };

            const result = new ObjPath(["b", "c"]).apply(obj, "changed");
            expect(result.a).eq(obj.a);
            expect(obj.b.c).eq("subject to change");
            expect(result.b).not.eq(obj.b);
            expect(result.b.c).eq("changed");

        });

        it("must create additional objects if missing in source tree", () => {

            const obj = {a: {b: {c: 115}}};

            const expectedVal = 3.1415;
            const result = new ObjPath(["x", "y", "z"]).apply(obj, expectedVal);
            expect(result.a).eq(obj.a);
            expect(result.x.y.z).eq(expectedVal);

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

    describe("concat()", () => {
        it("string", () => expect(new ObjPath(["a", "b"]).concat("c.d.e").parts).eql(["a", "b", "c", "d", "e"]));
        it("number", () => expect(new ObjPath(["a", "b"]).concat(1).parts).eql(["a", "b", 1]));
        it("ObjPath", () => expect(new ObjPath(["a", "b"]).concat(new ObjPath([1, 2])).parts).eql(["a", "b", 1, 2]));
        it("parts", () => expect(new ObjPath(["a", "b"]).concat(["c", 1]).parts).eql(["a", "b", "c", 1]));
    });

    describe("of()", () => {
        it("string", () => expect(ObjPath.of("a.b.c").parts).eql(["a", "b", "c"]));
        it("number", () => expect(ObjPath.of(1).parts).eql([1]));
        it("ObjPath", () => {
            let p = ObjPath.parse("a");
            expect(ObjPath.of(p)).eq(p);
        });
        it("parts", () => expect(ObjPath.of([1,2,3]).parts).eql([1,2,3]));
    });

});
