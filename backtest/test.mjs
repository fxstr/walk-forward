import createStrategy from './createStrategy/createStrategy.mjs';
import readFromCSV from './readFromCSV/readFromCSV.mjs';

(async() => {

    const result = await createStrategy()
        .useData(() => readFromCSV(
            'data/input/*.csv',
            ([key, value]) => [key, key === 'date' ? new Date(value).getTime() : Number(value)],
        ))
        .writeFile('data/output/result.json', data => data.instruments.get('aapl'))
        .run(); // Actually runs the stack – must be at the end

    console.log(result);

})();

// export default data.get('aapl');
