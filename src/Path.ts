/**
 * Represent single path element, it can be either an numeric index or string field
 */
export interface PathElement {
    /**
     * Whether this element is index or field
     */
    index: boolean;

    /**
     * Element value (number when index === true, string otherwise)
     */
    item: string | number;
}

/**
 * Union of types which can be treated as path or path element(s)
 */
type AnyPath = undefined | null | string | number | PathElement | Path | AnyPathArray;

/**
 * Helper interface to allow recursion in [[AnyPath]]
 */
interface AnyPathArray extends Array<AnyPath> {}

/**
 *
 * Path is a sequence of [[PathElement]]s which can represent a path
 * to single value of any type inside complex object graphs
 *
 * Path can be used to simplify value retrieval and immutable set
 *
 * Path is fully immutable - any mutating method
 * will create new instances instead of modification
 *
 */
export default class Path {

    /**
     * Creates indexed [[PathElement]]
     * @param i index
     */
    public static index(i: number): PathElement {
        return { item: i, index: true };
    }

    /**
     * Creates empty indexed [[PathElement]]
     */
    public static emptyIndex(): PathElement {
        return { item: "", index: true };
    }

    /**
     * Creates field [[PathElement]]
     * @param name field name
     */
    public static field(name: string): PathElement {
        return { item: name, index: false };
    }

    /**
     * Returns empty path
     */
    public static empty(): Path {
        return Path.EMPTY;
    }

    /**
     * Converts [[AnyPath]] to [[Path]]
     * @param p item to convert
     */
    public static of(p: AnyPath): Path {
        if (p instanceof Path) {
            return p;
        }

        const els: Array<PathElement> = [];
        Path.collectElements(p, els);
        return els.length === 0 ? Path.EMPTY : new Path(els);
    }

    private static EMPTY: Path = new Path([]);

    private static makeElObject(el: PathElement, src: any) {
        return el.index
            ? (Array.isArray(src) ? [...src] : [])
            : typeof src === "object" && src ? {...src} : {};
    }

    private static parseElements(p: string, els: Array<PathElement> = []) {
        let keepEmpty: boolean = false;
        let isIndex: boolean = false;
        let buf: string = "";

        function resetBuf(nextIsIndex: boolean, nextKeepEmpty: boolean) {
            if (buf !== "" || keepEmpty) {
                els.push({
                    index: isIndex,
                    item: isIndex && buf ? parseInt(buf, 10) : buf
                });
                buf = "";
            }
            isIndex = nextIsIndex;
            keepEmpty = nextKeepEmpty;
        }

        for (let i = 0; i < p.length; i++) {
            const c = p[i];
            if (isIndex) {
                if (c === ']') {
                    resetBuf(false, false);
                    continue;
                }
            } else {
                if (c === '[') {
                    resetBuf(true, true);
                    continue;
                }
                if (c === '.') {
                    keepEmpty = i === 0 || p[i - 1] !== ']';
                    resetBuf(false, true);
                    continue;
                }
            }
            buf += c;
        }
        resetBuf(false, false);
        return els;
    }

    private static collectElements(p: AnyPath, els: Array<PathElement>) {
        if (p instanceof Path) {
            for (let i = p.offset; i < p.offset + p.length; i++) {
                els.push(p.elements[i]);
            }
        } else if (Array.isArray(p)) {
            p.forEach(e => Path.collectElements(e, els));
        } else if (typeof p === "object" && p !== null) {
            els.push(p);
        } else if (typeof p === "string") {
            Path.parseElements(p, els);
        } else if (typeof p === "number") {
            els.push(Path.index(p));
        }
    }

    private readonly elements: Array<PathElement>;
    private readonly offset: number;
    private readonly length: number;

    constructor(els: Array<PathElement>, offset: number = 0, length: number = els.length) {
        this.elements = els;
        this.offset = offset;
        this.length = length;
    }

    /**
     * Returns elements at `i` index
     * @param i element index
     * @throws Error if `i` is out of bounds
     */
    public at(i: number): PathElement {
        if (i < 0 || i >= this.length) {
            throw new Error(`PathElement index ${i} is out of bounds (length is ${this.length})`);
        }
        return this.elements[this.offset + i];
    }

    /**
     * Checks whether `this` path is empty or not
     */
    public isEmpty(): boolean {
        return this.length === 0;
    }

    /**
     * Concatenates `this` path with `other`
     * @param other path to concatenate with
     * @return concatenated path (i.e. `this + other`)
     */
    public concat(other: AnyPath): Path {
        const p = Path.of(other);
        return p.length === 0 ? this : new Path([...this.toArray(), ...p.toArray()]);
    }

    /**
     * Returns [[Path]] with first element of `this` [[Path]]
     */
    public first(): Path {
        return this.subPath(0, 1);
    }

    /**
     * Returns [[Path]] with last element of `this` [[Path]]
     */
    public last(): Path {
        return this.subPath(this.length - 1, 1);
    }

    /**
     * Returns [[Path]] with elements of specified `length` and started with `offset`
     * @param offset path offset
     * @param length path length
     */
    public subPath(offset: number, length: number = this.length - offset): Path {
        offset = Math.max(0, offset);
        const newOffset = this.offset + offset;
        const newLength = Math.max(0, Math.min(this.length - offset, length));
        return newLength ? new Path(this.elements, newOffset, newLength) : Path.empty();
    }

    /**
     * Retrieves value from `root` expressed by `this` path
     * @param root object from which value must be retrieved
     */
    public get(root: any): any {
        for (let i = this.offset; i < this.offset + this.length; i++) {
            if (root == null || root === undefined) {
                break;
            }
            root = root[this.elements[i].item];
        }
        return root;
    }

    /**
     * Creates a deep copy of `root` with an applied `value` located by `this` path
     * @param root value to copy
     * @param value value to set
     * @return copied `root` with applied `value`
     */
    public set(root: any, value: any): any {
        if (this.length === 0) {
            return value;
        }

        const result = Path.makeElObject(this.elements[this.offset], root);
        const end = this.offset + this.length - 1;

        let target = result;
        let source = root;
        for (let i = this.offset; i < end; i++) {
            const element = this.elements[i];
            const nextElement = this.elements[i + 1];
            const nextSource = source[element.item];
            target[element.item] = Path.makeElObject(nextElement, nextSource);
            source = nextSource || source;
            target = target[element.item];
        }
        target[this.elements[end].item] = value;

        return result;
    }

    /**
     * Converts `this` path to string
     */
    public toString(): string {
        let str = "";
        for (let i = this.offset; i < this.offset + this.length; i++) {
            const e = this.elements[i];
            if (e.index) {
                str += `[${e.item}]`;
                continue;
            }
            if (i > 0) {
                str += ".";
            }
            str += e.item;
        }
        return str;
    }

    /**
     * Returns copy of elements array
     */
    public toArray(): Array<PathElement> {
        return this.elements.slice(this.offset, this.offset + this.length);
    }
}
