import numberIsFinite from './numberIsFinite';
import isInteger from './isInteger';

/**
 * Returns the number of decimal places in a number
 *
 * @param {Number} number The number to be checked
 * @returns {Number} The number of decimal places in the given number
 */
export default function numberDecimals(number) {
    const abs = Math.abs(number);
    let tmp = abs;
    let count = 1;

    while (! isInteger(tmp) && numberIsFinite(tmp)) {
        tmp = abs * Math.pow(10, count++);
    }

    return count - 1;
}
