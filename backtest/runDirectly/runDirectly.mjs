/**
 * Directly runs the function passed in; used e.g. for functions that retrieve data.
 * @param  {Map} data       Data returned from previously called function
 * @param  {Function} fn    Function to be run
 * @return {Promise}        Promise that resolves to the executed function
 */
export default async(data, fn) => fn(data);
