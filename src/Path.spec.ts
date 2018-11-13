import {expect} from 'chai';
import Path, {PathElement} from "./Path";

describe("Path", () => {

    describe("ctor", () => {
        it("must create from elements", () => {

            const a: Array<PathElement> = [Path.field("test"), Path.index(1), Path.field("abc")];
            const p = new Path(a);

            a[0] = a[1];
            expect(p.at(0)).to.be.eq(p.at(1));

        });
    });

    describe("toString", () => {
        it("must correctly generate path string", () => {
            const e = "a[].b[0].c[3][4]..d";
            expect(Path.of(e).toString()).to.eq(e);
        });
    });

    describe("toArray", () => {
        it("must create new elements copy", () => {

            const p = new Path([Path.field("test"), Path.index(1), Path.field("abc")]);
            const a = p.toArray();
            a[0] = { item: "failed", index: false };

            expect(p.at(0).item).eq("test");

        });
    });

    describe("at", () => {
        it("must throw Error if index is out of bounds", () => {
            const fn = () => Path.of("a.b.c").subPath(1, 1).at(1);
            expect(fn).to.throw();
        });
    });

    describe("parse", () => {
        it("must correctly parse path", () => {
            expect(Path.of("this.is[3].object[4][5].path").toArray()).to.deep.eq([
                Path.field("this"),
                Path.field("is"),
                Path.index(3),
                Path.field("object"),
                Path.index(4),
                Path.index(5),
                Path.field("path")
            ]);
        });

        it("must correctly handle empty elements", () => {
            expect(Path.of("a..b[0].abc.[].d").toArray()).to.deep.eq([
                Path.field("a"),
                Path.field(""),
                Path.field("b"),
                Path.index(0),
                Path.field("abc"),
                Path.field(""),
                Path.emptyIndex(),
                Path.field("d")
            ]);
        });

        it("must correctly parse path ending with index", () => {
            expect(Path.of("a.b[0]").toArray()).to.deep.eq([Path.field("a"), Path.field("b"), Path.index(0)]);
        });

        it("must correctly parse path starting with index", () => {
            expect(Path.of("[0].a").toArray()).to.deep.eq([
               Path.index(0),
               Path.field("a")
            ]);
        });

        it("must correctly parse empty elements at path start", () => {
            expect(Path.of(".a").toArray()).to.deep.eq([
                Path.field(""),
                Path.field("a")
            ]);
        });

        it("must return empty path if string is empty", () => {
            expect(Path.of("").toArray()).to.be.empty;
        });

    });

    describe("concat", () => {
        it("must correctly concat two paths", () => {
            expect(new Path([Path.field("a")]).concat(new Path([Path.index(1)])).toArray()).to.deep.eq([
                Path.field("a"), Path.index(1)
            ]);
        });

        it("must concat path and path elements array", () => {
            expect(new Path([Path.field("a")]).concat([Path.index(1)]).toArray()).to.deep.eq([
                Path.field("a"), Path.index(1)
            ]);
        });

        it("must concat single path element", () => {
            expect(new Path([Path.field("a")]).concat(Path.index(0)).toArray()).to.deep.eq([Path.field("a"), Path.index(0)]);
        });

        it("must return same path if concat element is null", () => {
            const p = new Path([Path.field("a")]);
            expect(p.concat(null)).eq(p);
        });

        it("must return same path if concat element is empty", () => {
            const p = new Path([Path.field("a")]);
            expect(p.concat("")).eq(p);
        });

    });

    describe("get", () => {

        it("must return value expressed by this path", () => {
            expect(Path.of("a.b[2].c").get({ a: { b: [0,1,{ c: "Hello world" }] } })).eq("Hello world");
        });

        it("must return undefined if value not exists", () => {
            expect(Path.of("a.b[2].c").get({ a: {} })).to.be.undefined;
        });

    });

    describe("set", () => {
        it("must set value at specified path", () => {
            const res = Path.of("a.b[2].c").set({}, 123);
            expect(res).to.deep.eq({a:{b:[,,{c:123}]}});
        });

        it("must return val if path is empty", () => {
            expect(Path.empty().set({}, 123)).eq(123);
        });

        it("must keep root object", () => {
            const a: Array<any> = [{a:1},2,3];
            expect(Path.of("[0].a").set(a, 10)).to.deep.eq([{a:10},2,3]);
            expect(a[0].a).eq(1);
        });

    });

    describe("first,last,subPath", () => {

        it("subPath must return path with correct offset and length", () => {
            const p = Path.of("a.b.c.d").subPath(1, 2);
            expect(p.toArray()).deep.eq([Path.field("b"), Path.field("c")]);
        });

        it("subPath must compute valid length if specified is greater then allowed", () => {
            const p = Path.of("a.b.c.d").subPath(1, 10);
            expect(p.toArray()).deep.eq([Path.field("b"), Path.field("c"), Path.field("d")]);
        });

        it("subPath must return empty path if length is zero or less", () => {
            const p = Path.of("a.b.c.d").subPath(1, -1);
            expect(p.isEmpty()).is.true;
        });

        it("first must return first element as path", () => {
            expect(Path.of("[0].a.b.c").first().toArray()).to.deep.eq([Path.index(0)]);
        });

        it("last must return empty path if path is empty", () => {
            const lp = Path.empty().last();
            expect(lp.isEmpty()).to.be.true;
        });

        it("last must return last element as path", () => {
            expect(Path.of("[0].a.b.c").last().toArray()).to.deep.eq([Path.field("c")]);
        });

    });

    describe("subPath", () => {
        it("must return new sliced Path", () => {
            const sp = Path.of("a.b.c.d").subPath(1, 2);
            expect(sp.toArray()).to.deep.eq([Path.field("b"), Path.field("c")]);
        });

    });

    describe("of", () => {
        it("must return path if parameter is path already", () => {
            const p = Path.of("abc");
            expect(Path.of(p)).eq(p);
        });

        it("must return path from string", () => {
            const p = Path.of("a.b.c");
            expect(p.toArray()).to.deep.eq([Path.field("a"), Path.field("b"), Path.field("c")]);
        });

        it("must return path from single element", () => {
            expect(Path.of(Path.field("a")).toArray()).to.deep.eq([Path.field("a")]);
            expect(Path.of(Path.index(1)).toArray()).to.deep.eq([Path.index(1)]);
        });

        it("must return path from element array", () => {
            expect(Path.of([Path.field("a"), Path.index(1)]).toArray()).to.deep.eq([Path.field("a"), Path.index(1)]);
        });

        it("must return path from string array", () => {
            expect(Path.of(["a", "[0].b", "c"]).toArray()).to.deep.eq([Path.field("a"), Path.index(0), Path.field("b"), Path.field("c")]);
        });

        it("must return path from path array", () => {
            expect(Path.of([Path.of("a"), Path.of("b"), Path.of("c")]).toArray()).to.deep.eq([
                Path.field("a"),
                Path.field("b"),
                Path.field("c")
            ]);
        });

        it("must return path from mixed array", () => {
            expect(Path.of(["a.b[0]", Path.index(5), new Path([Path.field("c"), Path.index(1)])]).toArray()).to.deep.eq([
                Path.field("a"),
                Path.field("b"),
                Path.index(0),
                Path.index(5),
                Path.field("c"),
                Path.index(1)
            ]);
        });

        it("must return path from mixed nested arrays", () => {
            expect(Path.of(["a", ["b", 0, Path.field("c")], 5, new Path([Path.field("d")])]).toArray()).to.deep.eq([
                Path.field("a"),
                Path.field("b"),
                Path.index(0),
                Path.field("c"),
                Path.index(5),
                Path.field("d")
            ]);
        });
    })

});