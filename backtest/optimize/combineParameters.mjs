/**
 * Takes single input parameters and combines them into an array with Maps of parameter sets.
 * @param  {Map.<string, number[]>} parameters    (Raw) parameters; key is the parameter's name,
 *                                                Value are all parameter values, e.g.
 *                                                new Map([['slow', [5, 10, 15]]])
 * @return {Map.<string, number>[]}               All possible combined parameters, e.g.
 *                                                [new Map([['slow', 5], ['fast', 2]])]
 */
export default inputParameters => (

    Array.from(inputParameters.entries())
        .reduce((merged, [parameterName, parameterValues]) => (

            // Go through every parameter value for current parameter
            parameterValues.flatMap(value => (

                // Go through every entry of merged parameterSets and add current parameter value
                merged.map(mergedEntry => new Map([
                    ...mergedEntry,
                    [parameterName, value],
                ]))

            ))

        ), [new Map()])

);
