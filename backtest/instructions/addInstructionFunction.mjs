/**
 * Adds an instruction function to data.instructionFunctions that will be executed on trade
 */
export default (data, instructionFunction, instructionField, validate) => {

    if (typeof instructionFunction !== 'function') {
        throw new Error(`addInstructionFunction: Instruction function provided must be a function, is ${typeof instructionFunctions}`);
    }

    return {
        ...data,
        instructionFunctions: [
            ...data.instructionFunctions,
            {
                instructionFunction,
                instructionField,
                validate,
            },
        ],
    };

};

