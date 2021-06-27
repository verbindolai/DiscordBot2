//https://stackoverflow.com/questions/39877156/how-to-extend-string-prototype-and-use-it-next-in-typescript
//https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely

declare global {
    interface String {
        similarity(str: string): number | undefined;
    }
}

String.prototype.similarity = function (str: string): number {
    let longer = str;
    let shorter = String(this);

    if (str.length < shorter.length) {
        longer = String(this);
        shorter = str;
    }
    let longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0) {
                costs[j] = j;
            }
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) {
            costs[s2.length] = lastValue;
        }

    }
    return costs[s2.length];
}

//Needed: "The empty export on the bottom is required if you declare global in .ts and do not export anything. This forces the file to be a module. *"
export { };