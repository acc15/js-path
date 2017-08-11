
import Path, {parsePathParts, parseIntOrThrow, makePathFromPathLikeValue} from "./Path";

export default class PathExpression {

    parts;

    constructor(parts) {
        this.parts = parts;
    }

    traverse(obj, callback, index = 0, parts = []) {

        while (index < this.parts.length) {

            const part = this.parts[index];
            if (part === null) {

                if (obj !== null && obj !== undefined) {
                    for (const p in obj) {
                        if (!obj.hasOwnProperty(p)) {
                            continue;
                        }

                        const nested = obj[p];
                        this.traverse(nested, callback, index + 1, parts.concat(Array.isArray(obj) ? Number(p) : p));
                    }
                }
                return;

            }

            parts.push(part);
            if (obj !== null && obj !== undefined) {
                obj = obj[part];
            }
            ++index;
        }

        callback(Path.of(parts), obj);
    }

    static of(p) {
        if (p instanceof Path) {
            return PathExpression.of(p.parts);
        }
        return makePathFromPathLikeValue(PathExpression, p);
    }

    static parse(path) {
        return PathExpression.of(parsePathParts(path,
            (part, isIndex) => isIndex ? part.length === 0 ? null : parseIntOrThrow(part) : part));
    }
}