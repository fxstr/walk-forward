
# Walk Forward

Walk Forward is a JavaScript framework that lets you backtest your trading strategies (stocks, futures, forex, crypto currencies, …).

# Example

```javascript
import {
    createStrategy,
    readCSV,
    talibIndicator,
    exportResult,
} from 'walk-forward';

createStrategy()

    // Import data from CSV. Make sure the CSV has columns for open, close and date.
    .useData(readCSV(
        // Read data from CSV files in futures folder; file name (without extension) will
        // become the instrument's name
        './futures/*.csv',
        // Convert CSV data: Lowercase the column name and convert the values to dates
        // (for the date column) or numbers (for all other columns)
        ([key, value]) => [
            key.toLowerCase(),
            key === 'date' ? new Date(value).getTime() : Number(value),
        ],
    ))

    // Add talib Indicator for SMA (slow and fast)
    .addIndicator(talibIndicator({
        // Indicator's name for talib
        name: 'SMA',
        // Mapping of our instrument's columns to talib's input columns: 'close' becomes
        // 'inReal'
        inputs: { inReal: 'close' },
        // Mapping of talib's output fields to our fields: 'outReal' will become 'slowSma'
        outputs: { outReal: 'slowSma' },
        // Talib options
        options: { optInTimePeriod: 50 },
    }))

    .addIndicator(talibIndicator({
        name: 'SMA',
        inputs: { inReal: 'close' },
        outputs: { outReal: 'fastSma' },
        options: { optInTimePeriod: 25 },
    }))

    // To go long, return 1; to go short, return -1. To not trade, return 0. Also, we have to
    // make sure there is SMA data for the current bar
    .select((bar) => {
        const slow = bar.get('slowSma');
        const fast = bar.get('fastSma');
        // SMAs are undefined until enough bars (total SMA period) have passed
        if (!fast || !slow) return 0;
        // Go long if fast SMA is *above* slow SMA
        if (fast > slow) return 1;
        // Go short if fast SMA is *below* slow SMA
        if (fast < slow) return -1;
        // Don't do any trades if fast equals slow SMA
        return 0;
    })

    // Set start capital for backtest to 1 mio
    .trade(10 ** 6)

    // Export result of the backtest to result.json
    .writeFile(
        'test/output/result.json',
        exportResult(),
    )

    // Run the whole backtest
    .run();

````


# Main Features

- Lets you plug in any data source you like (CSVs, web services, a broker's API etc.)
- Supports import for CSV files out of the box
- Lets you use any indicator library you like
- Provices [talib indicators](https://www.npmjs.com/package/talib) out of the box
- Handles any instrument type you wish to backtest: Futures, stocks, crypto currencies, forex etc.
- Produces standardized Highstock formatted output that can easily be displayed on the web
- Provides you with a frontend that supports live-reload
- Is well tested
- Uses newest JavaScript standards
- Uses a declarative programming style (which reduces your code base's length and complexity and improves re-usability)
- Open source (ISC license)



# Documentation

## Prerequisites

1. Install [Node.js](https://nodejs.org) and [NPM](https://www.npmjs.com/get-npm).
2. Install nodemon for 
2. Install WalkForward: `npm i -S walk-forward`
4. Get data for the instruments you intend to backtest. Store the corresponding CSV files e.g. in `data/input` folder and use the instrument name as file name (data for instrument `aapl` is in `aapl.csv`). Use CSVs with the following structure – date, open and close fields are mandatory:
    ```
        date, open, high, low, close, volume
        2018-01-01, 13.5, 15.7, 13.3, 13.9, 15392
    ```

## Backtest

1. Create a `backtest.mjs` file.
2. Import the relevant modules:
    ````javascript
import {
    createStrategy,
    readFromCSV,
    talibIndicator,
    convertInstrumentToHighstock,
    exportResult,
} from 'walk-forward';
    ````
3. …

## Run it

From the console, call

```bash
nodemon --experimental-modules ./backtest.mjs
```

## See it

Start the webserver that displays the results from `writeFile`:

```bash
cd server
node --experimental-modules ./main.js file=./path/to/result.json
```

## Logging

To enable logs, set the log level and [components](https://github.com/visionmedia/debug) through your environment:

```bash
export DEBUG=WalkForward:*
```




## Roadmap
- [ ] Parameter optimization
- [ ] Configure spread, commission and slippage depending on an order
- [x] Output relevant display data as JSON (for formatted output in frontend)
- [x] Interactive web frontend
- [ ] Instrument configuration (type of instrument, whole sizes, margins)
- [ ] Margin handling
- [ ] More parameter optimization techniques (in addition to current log, e.g. linear, other log bases, integers only instead of floats)
- [ ] Relevant ouptut in form of tables (orders, positions in addition to charts)
- [ ] Performance indicators
- [ ] Better charts for parameter optimization (2D/3D visualization)
- [ ] Currency handling
- [ ] Walk forward optimization
- [ ] More data sources out of the box
- Better docs, always better docs

