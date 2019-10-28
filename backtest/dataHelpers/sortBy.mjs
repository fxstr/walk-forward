import getField from './getField.mjs';

/**
 * Sort function for arrays that sorts by multiple arguments passed in. Returns the corresponding
 * sort function.
 * @param {*} *      Keys to sort by, e.g. 'time', 'name' if we want to sort by time as a first
 *                   priority and by name as a second priority (if time is identical)
 *@return {function} Sort function
 */
export default (...sortPriorities) => (a, b) => {
    for (const priority of sortPriorities) {
        if (getField(a, priority) < getField(b, priority)) return -1;
        else if (getField(a, priority) > getField(b, priority)) return 1;
    }
    return 0;
};
