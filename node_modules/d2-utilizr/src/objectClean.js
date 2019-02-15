import isEmpty from './isEmpty';

/**
 * Applies properties from "config" if they are undefined in "object.
 *
 * @param {Object} object The object to be cleaned
 * @param {Function} isEmptyFn Optional isEmpty function
 * @returns {Object} A new cleaned object
 *
 * @example
 * let object = {id: 1, name: undefined}
 * objectClean(object); // returns: {id: 1}
 */

export default function cleanObject(object, isEmptyFn = isEmpty) {
    return Object
        .keys(object)
        .reduce((acc, key) => {
            if (!isEmptyFn(object[key])) {
                acc[key] = object[key];
            }
        return acc;
    }, {});
}
