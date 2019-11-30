// Main integration test
import test from 'ava';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import {
    createStrategy,
    readCSV,
    talibIndicator,
    convertInstrumentToHighstock,
    exportResult,
} from '../main.mjs';


const workingDirectory = dirname(fileURLToPath(import.meta.url));


async function executeTest() {

    await createStrategy()

        .useData(readCSV(
            join(
                workingDirectory,
                'input/*.csv',
            ),
            ([key, value]) => [
                key.toLowerCase(),
                key === 'date' ? new Date(value).getTime() : Number(value),
            ],
        ))

        .truncate(
            // Oct is month 9
            // JS uses UTC time for new Date('yyyy-mm-dd') – we have to adjust for them
            new Date(2018, 9, 9, new Date(2018, 9, 9).getTimezoneOffset() / -60, 0, 0).getTime(),
            new Date(2019, 9, 9, new Date(2019, 9, 9).getTimezoneOffset() / -60, 0, 0).getTime(),
        )

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

        // Get average (high + low + close) / 3; don't display it
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

        // Add linear regression of average (dependent indicator)
        .addIndicator(talibIndicator({
            name: 'LINEARREG',
            inputs: { inReal: 'averagePrice' },
            outputs: { outReal: 'linearRegressionSlow' },
            options: { optInTimePeriod: 25 },
        }))


        // Indicator in new panel
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

        .do(data => data)

        .configure({
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.5,
        })

        .select((instrument) => {
            // Don't select if previous bar is not available or previous bar does not (yet) have
            // data for linearRegressionSlow
            if (instrument.length < 2 || !instrument[1].get('linearRegressionSlow')) return 0;
            return instrument[0].get('linearRegressionSlow') >
                instrument[1].get('linearRegressionSlow') ? 1 : 0;
        })

        // Weight by slowK (does not really make sense, but … anyhow)
        .weight(instrument => instrument[0].get('slowK') || 1)

        // Only trade on even days (i.e. rest on every uneven day)
        .rest(instrument => new Date(instrument[0].get('date')).getDate() % 2 === 1)

        .trade(10 ** 5)

        // Only write one instrument (to be displayed in browser)
        .writeFile(
            join(workingDirectory, 'output/aapl.json'),
            convertInstrumentToHighstock('aapl'),
        )

        .writeFile(
            join(workingDirectory, 'output/result.json'),
            exportResult(),
        )

        // Actually runs the stack – must be at the end
        .run();

}

test('creates expected output', async(t) => {

    const resultPath = join(workingDirectory, 'output/result.json');
    const aaplPath = join(workingDirectory, 'output/aapl.json');

    // Only delete files if they exist; we'll get an error thrown otherwise
    [resultPath, aaplPath].forEach((filePath) => {
        if (existsSync(filePath)) unlinkSync(filePath);
    });

    await executeTest();

    [resultPath, aaplPath].forEach((filePath) => {
        t.is(
            readFileSync(filePath, 'utf8'),
            readFileSync(filePath.replace('output', 'expectedOutput'), 'utf8'),
        );
    });

});


// Execute function to generate output
/* (async() => {
    executeTest();
})(); */
