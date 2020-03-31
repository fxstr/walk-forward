const createOptimization = () => {};
const backtest = (params) => { alert(params.get('test')); };

createOptimization()
    .addParam({
        name: 'test',
        from: 0,
        to: 20,
        steps: 10,
    })
    .setBacktest(backtest)
    .run()
    .export('./result');
