/**
 * Returns true with the given Probability. Optional calls a Callback function when returning true.
 * @param probability float between 0 and 1
 * @param callback callback to get calles with the given probability
 * @returns 
 */
export function probability(probability: number, callback?: Function): boolean {
    if (probability > 1) {
        probability = 1;
    } else if (probability < 0) {
        probability = 0;
    }
    const random = Math.floor(Math.random() * 100)
    if (random < probability * 100) {
        if (callback) {
            callback();
        }
        return true;
    }
    return false;
}