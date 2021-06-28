export function callWithProbability(probability: number, callback: Function): boolean {
    if (probability > 1) {
        probability = 1;
    } else if (probability < 0) {
        probability = 0;
    }
    const random = Math.floor(Math.random() * 100)
    if (random < probability * 100) {
        callback();
        return true;
    }
    return false;
}