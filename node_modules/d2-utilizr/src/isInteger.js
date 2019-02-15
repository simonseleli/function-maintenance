/**
 * Check if a value is an integer
 *
 * @param param Value that will be checked if it is an integer
 * @returns {boolean} Returns `true` when param is a integer otherwise false
 *
 * @example
 * isInteger(17); // Returns: true
 *
 * @example
 * isInteger(0xFF); // Returns: true
 *
 * @example
 * isInteger(-17); // Returns: true
 *
 * @example
 * isInteger(2e-3); // Returns: false
 */
export default function isInteger(param) {
    return (typeof param === 'number') && (parseFloat(param) == parseInt(param, 10)) && ! isNaN(param);
}
