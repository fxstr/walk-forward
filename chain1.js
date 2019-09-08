const addIndicator = (data, name, fn) => {
    applyToInstrument(data, fn)
}

const sort = (data, fn) => {
    const dataByDate = reorderDataByDate(data); // Copies every single entry
    dataByDate.forEach((row, date) => {
        row.values().sort(fn);
        row.values().forEach((value, index) => {
            value.sortOrder = index;
        })
    })
    return reorderDataByInstrument(dataByDate); // Copies every single entry    q
}

const createStrategy = (stack = []) => ({
    addIndicator: (name, fn) => createStrategy([...stack, ['indicator', name, fn]]),
    sort: (fn) => createStrategy([...stack, ['sort', fn]]),
    get: () => stack,
});

const strategy = createStrategy()
    .addIndicator('name', () => {})
    .sort(() => {});

console.log(strategy.get());

executeStrategy()
    .getDataFromCSV('*.csv')
    .set(strategy)
    .run(new Map([['slowSma', 5]]));



// Data
new Map([
    ['aapl', {
        columns: new Map([
            ['fastSma', {
                base: ['open'], 
                type: 'SMA',
            }
        ]),
        data: [
            {
                date: 1912341231
                data: new Map([
                    ['open', 5.12],
                    ['close', 5.31],
                    ['fastSma', 5.1]
                ]),
                selected: false,
                sortOrder: 1,
                weight: 3.71,
            }
        ],
    }]
])

// By date
new Map([
    [195912311, new Map([
        'aapl', {
            data: new Map(),
            selected: true,
            sortOrder: 3,
            weight: 3.71
        }
    ])]
])
