function createFunctions(value) {

    console.log('createFunctions', value);

    return {
        add: (summand) => { 
            const newValue = new Promise(async(resolve) => {
                const resolvedValue = value instanceof Promise ? await value : value;
                setTimeout(() => resolve(resolvedValue + summand), 1000);
            });
            console.log('add', newValue);
            return createFunctions(newValue);
        },
        sub: (nr) => {
            const newValue = new Promise(async(resolve) => {
                const resolvedValue = value instanceof Promise ? await value : value;
                resolve(resolvedValue - nr);
            });
            console.log('sub', newValue);
            return createFunctions(newValue);
        },
        val: () => value,
    }

}


function zero() {
    return createFunctions(0);    
}

const res = zero()
    .add(5)
    .sub(2)
    .val();

res.then(val => console.log(val));