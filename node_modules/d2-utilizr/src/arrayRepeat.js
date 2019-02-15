/**
 * 
 * Repeats content of array by structure or by index, returns flattened array.
 * 
 * @param   {array}   array 
 * @param   {number}  n 
 * @param   {boolean} [byIndex=false] 
 * @returns {array}
 *
 * @example
 * const values = [1, 2, 3];
 * arrayRepeat(values, 3) // returns: [1, 2, 3, 1, 2, 3, 1, 2, 3]
 *
 * @example
 * const values = [1, 2, 3];
 * arrayRepeat(values, 3, true) // returns: [1, 1, 1, 2, 2, 2, 3, 3, 3]
 */
export default function arrayRepeat(array, n=1, byIndex=false) {
    
    if (typeof array === 'undefined') {
        throw `Cannot repeat array of type undefined`;
    }

    let newArray = [];

    if (byIndex) {

        for (let i=0; i<array.length; i++) {            
            for (let j = 0; j < n; j++) {
                newArray.push(array[i]);
            }
        }
        
        return newArray
    }

    for (let i=0; i<n; i++) {
        newArray.push(...array);
    }

    return newArray
};

