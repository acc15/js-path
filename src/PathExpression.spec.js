import Path from "./Path";
import PathExpression from "./PathExpression";
import { expect } from "chai";

function expectTraverse(expr, obj, expectedPaths) {

    const l = [];
    PathExpression.of(expr).traverse(obj, (path, value) => l.push({path: path, value: value}));
    expect(l).eql(expectedPaths);

}

describe("PathExpression", () => {
    it("ctor must store parts", () => {
        const parts = ["a", 1, -1, "b", ""];
        expect(new PathExpression(parts).parts).eq(parts);
    });

    describe("parse", () => {
        it("must parse empty array index", () => {
            expect(PathExpression.parse("a[]").parts).eql(["a", null]);
        });
    });

    describe("traverse", () => {
        it("must traverse single path", () => {
            expectTraverse("a[1]", { a: ["x", "y"] }, [
                { value: "y", path: Path.of("a[1]") }
            ]);
        });
        it("must traverse arrays", () => {
            expectTraverse("a[].b", { a: [{b: "x"}, {b: "y"}] }, [
                { value: "x", path: Path.of("a[0].b") },
                { value: "y", path: Path.of("a[1].b") }
            ]);
        });
        it("must traverse object properties", () => {
            expectTraverse("a[]", { a: {x: 1, y: 2, z: 3} }, [
                { value: 1, path: Path.of("a.x") },
                { value: 2, path: Path.of("a.y") },
                { value: 3, path: Path.of("a.z") }
            ]);
        })
    });

});