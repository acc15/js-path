import Path from './Path';

import { expect } from "chai";

describe("Path", () => {
    it("ctor must store parts", () => {
        const parts = ["a", 1, -1, "b", ""];
        expect(new Path(parts).parts).eq(parts);
    });

    describe("get()", () => {

        it("must return value by path", () => {
            expect(new Path(["a", "b", 1]).get({a: {b: [null, "test!"]}})).eq("test!");
        });

        it("must return obj when path is empty", () => {
            expect(new Path([]).get(1)).eq(1);
        });

    });

    describe("set()", () => {

        it("must create all objects", () => {
            expect(new Path(["a", "b", 1, 2, "login"]).set(null, 5)).eql({a: {b: [undefined, [undefined, undefined, {login: 5}]]}});
        });

        it("must change field in existing object", () => {

            const v = [{a: [undefined, 5]}];

            new Path([0, "a", 1]).set(v, 200);
            expect(v[0].a[1]).eq(200);
        });

        it("must return value if path is empty", () => {
            const expected = {};
            expect(Path.empty().set(null, expected)).eq(expected);
        });
    });

    describe("apply()", () => {

        it("must return value if path is empty", () => {
            const expected = {};
            expect(Path.empty().apply(null, expected)).eq(expected);
        });

        it("must return new object with shallow copies of other fields", () => {

            const obj = {
                a: {b: 1},
                b: {c: "subject to change"}
            };

            const result = new Path(["b", "c"]).apply(obj, "changed");
            expect(result.a).eq(obj.a);
            expect(obj.b.c).eq("subject to change");
            expect(result.b).not.eq(obj.b);
            expect(result.b.c).eq("changed");

        });

        it("must create additional objects if missing in source tree", () => {

            const obj = {a: {b: {c: 115}}};

            const expectedVal = 3.1415;
            const result = new Path(["x", "y", "z"]).apply(obj, expectedVal);
            expect(result.a).eq(obj.a);
            expect(result.x.y.z).eq(expectedVal);

        });

    });

    describe("parse()", () => {

        it("must return valid path", () => {
            const p = Path.parse("a.b[1].123[45]");
            expect(p.parts).eql(["a", "b", 1, "123", 45]);
        });

        it("must throw for empty array indexes", () => {
            expect(() => Path.parse("[]")).throw();
        });

        it("must throw for non-numeric array indexes", () => {
            expect(() => Path.parse("[NaN]")).throw();
            expect(() => Path.parse("[4h]")).throw();
            expect(() => Path.parse("[h4]")).throw();
        });

        it("must throw for negative indexes", () => {
            expect(() => Path.parse("[-1]")).throw();
        });

        it("must throw for non-integer indexes", () => {
            expect(() => Path.parse("[3.1415]")).throw();
        });

    });

    describe("concat()", () => {
        it("string", () => expect(new Path(["a", "b"]).concat("c.d.e").parts).eql(["a", "b", "c", "d", "e"]));
        it("number", () => expect(new Path(["a", "b"]).concat(1).parts).eql(["a", "b", 1]));
        it("Path", () => expect(new Path(["a", "b"]).concat(new Path([1, 2])).parts).eql(["a", "b", 1, 2]));
        it("parts", () => expect(new Path(["a", "b"]).concat(["c", 1]).parts).eql(["a", "b", "c", 1]));
    });

    describe("of()", () => {
        it("string", () => expect(Path.of("a.b.c").parts).eql(["a", "b", "c"]));
        it("number", () => expect(Path.of(1).parts).eql([1]));
        it("Path", () => {
            const p = Path.parse("a");
            expect(Path.of(p)).eq(p);
        });
        it("parts", () => expect(Path.of([1,2,3]).parts).eql([1,2,3]));
        it("object", () => expect(() => Path.of({})).to.throw());
    });

    it("toString()", () => expect(Path.of("a.b[164].c").toString()).eq("a.b[164].c"));

});
