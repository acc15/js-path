

export function parseIntOrThrow(str) {
    if (str.indexOf('.') >= 0) {
        throw new Error("array indexes must be integer");
    }
    if (str.indexOf('-') >= 0) {
        throw new Error("array indexes must be positive");
    }
    if (!/^[0-9]+$/.test(str)) {
        throw new Error("array indexes must be a number");
    }
    return Number(str);
}

export function parsePathParts(path, partParser) {
    const parts = [];

    let part = null;
    let index = false;

    for (const ch of path) {
        if (index ? ch === ']' : (ch === '[' || ch === '.')) {
            if (part !== null) {
                parts.push(partParser(part, index));
            }
            part = index ? null : "";
            index = !index && ch === '[';
            continue;
        }
        part = part === null ? ch : part + ch;
    }
    if (part !== null) {
        parts.push(partParser(part, index));
    }
    return parts;
}

export function makePathFromPathLikeValue(Type, val) {
    if (val instanceof Type) {
        return val;
    } else if (Array.isArray(val)) {
        return new Type(val);
    } else if (typeof val === "string") {
        return Type.parse(val);
    } else if (typeof val === "number") {
        return Type.of([val]);
    } else {
        throw new Error(`Unknown (or unsupported) path-like value: ${val}`);
    }
}

export default class Path {

    parts;

    constructor(parts) {
        this.parts = parts;
    }

    get(obj) {
        for (const part of this.parts) {
            if (obj === null || obj === undefined) {
                break;
            }
            obj = obj[part];
        }
        return obj;
    }

    set(obj, val) {
        if (this.parts.length === 0) {
            return val;
        }

        if (obj === null || obj === undefined) {
            obj = Path.createByPart(this.parts[0]);
        }

        const root = obj;
        for (let i = 0; i < this.parts.length - 1; i++) {
            const part = this.parts[i];
            if (obj[part] === null || obj[part] === undefined) {
                obj[part] = Path.createByPart(this.parts[i + 1]);
            }
            obj = obj[part];
        }
        obj[this.parts[this.parts.length - 1]] = val;
        return root;
    }

    apply(obj, val) {
        if (this.parts.length === 0) {
            return val;
        }

        const root = Path.shallowCopyForPart(obj, this.parts[0]);

        let copy = root;
        for (let i = 0; i < this.parts.length - 1; i++) {
            const part = this.parts[i];
            obj = (obj !== null && obj !== undefined) ? obj[part] : obj;
            copy = copy[part] = Path.shallowCopyForPart(obj, part);
        }

        copy[this.parts[this.parts.length - 1]] = val;
        return root;
    }

    empty() {
        return this.parts.length === 0;
    }

    concat(p) {
        if (p instanceof Path) {
            return Path.of(this.parts.concat(p.parts));
        } else {
            return this.concat(Path.of(p));
        }
    }

    eq(p) {
        const other = Path.of(p);
        if (this.parts.length !== other.parts.length) {
            return false;
        }
        for (let i = 0; i < this.parts.length; i++) {
            if (this.parts[i] !== other.parts[i]) {
                return false;
            }
        }
        return true;
    }

    toString() {
        let s = "";
        for (let part of this.parts) {
            s += typeof part === "number" ? `[${part}]` : (s.length > 0 ? "." : "") + part;
        }
        return s;
    }

    static empty() {
        return new Path([]);
    }

    static of(p) {
        return makePathFromPathLikeValue(Path, p);
    }

    static shallowCopyForPart(obj, part) {
        if (!obj) {
            return Path.createByPart(part);
        }

        if (Array.isArray(obj)) {
            return obj.slice();
        }

        const result = {};
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== part) {
                result[prop] = obj[prop];
            }
        }
        return result;
    }

    static createByPart(part) {
        return typeof part === "number" ? [] : {};
    }

    static parse(path) {
        return Path.of(parsePathParts(path, (part, isIndex) => isIndex ? parseIntOrThrow(part) : part));
    }

}