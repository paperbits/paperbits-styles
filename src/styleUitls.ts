// export function getBreakpointStructure(): Object {

// }

export function formatUnicode(unicode: number): string {
    const unicodeString = unicode.toString(16);

    if (unicodeString.length > 4) {
        return ("000000" + unicodeString.toLowerCase()).substr(-6);
    }
    else {
        return ("0000" + unicodeString.toLowerCase()).substr(-4);
    }
}