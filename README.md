# Run

Run backtest:

```bash
# Use nodemon to run script whenever it changes
npm i -g nodemon
cd backtest
nodemon --experimental-modules test/test.mjs
```

Display results from backtest in browser (with live reload):

```bash
cd server
node --experimental-modules main.mjs file=../backtest/test/output/result.json
```

Run tests:

```bash
npm test
```