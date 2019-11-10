/**
 * Runs every function in a stack; uses initalData as the argument for the first function, passes
 * its return value to the second function etc.
 */
export default async(stack, initialData) => {

    let data = initialData;

    // Just go through all methods and execute them serially
    for await (const methodData of stack) {
        const [stackFunction, ...parameters] = methodData;
        data = await stackFunction(data, ...parameters);
    }

    return data;

};
