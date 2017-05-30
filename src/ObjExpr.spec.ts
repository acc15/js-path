import "mocha";
import {expect} from "chai";

import ObjExpr from "./ObjExpr";
import {AnyPath} from "./ObjPath";
import ObjPath from "./ObjPath";

function expectMatches(expr: string, context: any, paths: AnyPath | AnyPath[]): void {

    const matchedPaths: ObjPath[] = [];
    ObjExpr.parse(expr).traverse(context, matchedPaths.push);

    const expectedPaths: ObjPath[] = Array.isArray(paths) ? (<AnyPath[]> paths).map(p => ObjPath.of(p)) : [ObjPath.of(paths)];
    if (!expectedPaths.some((p,i) => p.eq(matchedPaths[i]))) {
        expect.fail(matchedPaths, expectedPaths,
            `Expected (${expectedPaths}) but was (${matchedPaths.length ? matchedPaths : '[]'}) for '${expr}'`);
    }

}

describe("ObjExpr", () => {

    it("all elements", () => expectMatches("[]", ['a', 'b'], [0, 1]));
    it("variant", () => expectMatches("{a,b,c}", null, ["a","b","c"]));
    it("indexVariant", () => expectMatches("[1,5,6,17]", null, [1, 5, 6, 17]));
    it("simple", () => expectMatches("a[1]", {a:['haha']}, ["a[1]"]));
    it("sequence", () => expectMatches("{a,b}cd{e,f}", null, ["acde", "bcde", "acdf", "bcdf"]));
    it("range", () => expectMatches("[1..3]", null, [1, 2, 3]));


});
