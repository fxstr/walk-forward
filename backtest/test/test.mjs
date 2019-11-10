import createStrategy from '../createStrategy/createStrategy.mjs';
import readFromCSV from '../readFromCSV/readFromCSV.mjs';
import talibIndicator from '../talibIndicator/talibIndicator.mjs';
import convertInstrumentToHighstock from '../writeFile/convertInstrumentToHighstock.mjs';

(async() => {

    const result = await createStrategy()
        .useData(() => readFromCSV(
            'test/input/*.csv',
            ([key, value]) => [
                key.toLowerCase(),
                key === 'date' ? new Date(value).getTime() : Number(value),
            ],
        ))

        // Add panel for volume, add volume indicator to it
        .addViewOptions({
            panels: new Map([
                ['volume', { height: 0.2 }],
            ]),
            series: new Map([
                ['volume', { panel: 'volume' }],
                ['adj close', { panel: false }],
            ]),
        })

        // Will be added to main panel
        .addIndicator(talibIndicator({
            name: 'SMA',
            inputs: { inReal: 'close' },
            outputs: { outReal: 'sma4' },
            options: { optInTimePeriod: 4 },
        }))

        // Get average (high + low + close) / 3
        .addIndicator(talibIndicator({
            name: 'AVGPRICE',
            inputs: {
                close: 'close',
                high: 'high',
                low: 'low',
                open: 'open',
            },
            outputs: { outReal: 'averagePrice' },
            options: {},
        }))
        .addViewOptions({
            series: new Map([['averagePrice', { panel: false }]]),
        })

        // Add linear regression of average
        .addIndicator(talibIndicator({
            name: 'LINEARREG',
            inputs: { inReal: 'averagePrice' },
            outputs: { outReal: 'linearRegressionSlow' },
            options: { optInTimePeriod: 25 },
        }))
        /* .addIndicator(talibIndicator({
            name: 'LINEARREG',
            inputs: { inReal: 'averagePrice' },
            outputs: { outReal: 'linearRegressionFast' },
            options: { optInTimePeriod: 40 },
        })) */
        /* .addViewOptions({
            panels: new Map([
                ['linearReg', { height: 0.2 }],
            ]),
            series: new Map([
                ['linearRegressionSlow', { panel: 'linearReg' }],
                // ['linearRegressionFast', { panel: 'linearReg' }],
            ]),
        }) */

        // Will be added to new panel
        .addIndicator(talibIndicator({
            name: 'STOCH',
            inputs: { high: 'high', low: 'low', close: 'close' },
            outputs: { outSlowK: 'slowK', outSlowD: 'slowD' },
            options: {
                optInFastK_Period: 15,
                optInSlowK_Period: 12,
                optInSlowD_Period: 12,
                optInSlowK_MAType: 0,
                optInSlowD_MAType: 0,
            },
        }))

        .addViewOptions({
            panels: new Map([
                ['stoch', { height: 0.2 }],
            ]),
            series: new Map([
                ['slowK', { panel: 'stoch' }],
                ['slowD', { panel: 'stoch' }],
            ]),
        })

        .configure({
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.1,
        })

        // Only write one instrument (to be displayed in browser)
        .writeFile(
            'test/output/result.json',
            convertInstrumentToHighstock('aapl'),
        )
        // Actually runs the stack – must be at the end
        .run();

    console.log(result);

})();
