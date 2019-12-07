import test from 'ava';
import convertInstrumentToHighstock from './convertInstrumentToHighstock.mjs';
import createTestData from '../testData/createTestData.mjs';

test('uses ohlc/main for ohlc data', (t) => {
    const { data } = createTestData();
    data.timeSeries.forEach((entry) => {
        entry.set('low', Math.min(entry.get('open'), entry.get('close')) - 1);
        entry.set('high', Math.max(entry.get('open'), entry.get('close')) + 1);
    });
    const result = convertInstrumentToHighstock('aapl')(data);
    t.deepEqual(result, {
        series: [{
            type: 'ohlc',
            data: [
                [1546297200000, 13.2, 15.1, 12.2, 14.1],
                [1546383600000, 13.9, 14.9, 12.1, 13.1],
                [1546556400000, 14.1, 15.3, 13.1, 14.3],
                [1546729200000, 13.4, 14.6, 12.4, 13.6],
                [1546815600000, 13.4, 14.4, 12.1, 13.1],
            ],
            yAxis: 'main',
            name: 'aapl',
        }],
        yAxis: [{
            top: '0%',
            height: '100%',
            id: 'main',
        }],
    });
});


test('does not fail if ohlc is missing, uses line instead', (t) => {
    const { data } = createTestData();
    data.timeSeries.forEach((entry) => {
        entry.delete('close');
    });
    const result = convertInstrumentToHighstock('aapl')(data);
    t.deepEqual(result, {
        series: [{
            type: 'line',
            data: [
                [1546297200000, 13.2],
                [1546383600000, 13.9],
                [1546556400000, 14.1],
                [1546729200000, 13.4],
                [1546815600000, 13.4],
            ],
            yAxis: 'main',
            name: 'open',
        }],
        yAxis: [{
            top: '0%',
            height: '100%',
            id: 'main',
        }],
    });
});


test('creates new panel, uses line as default', (t) => {
    const { data } = createTestData();
    data.timeSeries.forEach((entry) => {
        entry.delete('close');
    });
    data.viewOptions = {
        panels: new Map([
            ['panel1', { height: 3 }],
        ]),
        series: new Map([
            ['open', { panel: 'panel1' }],
        ]),
    };
    const result = convertInstrumentToHighstock('aapl')(data);
    t.deepEqual(result, {
        series: [{
            type: 'line',
            data: [
                [1546297200000, 13.2],
                [1546383600000, 13.9],
                [1546556400000, 14.1],
                [1546729200000, 13.4],
                [1546815600000, 13.4],
            ],
            yAxis: 'panel1',
            name: 'open',
        }],
        yAxis: [{
            top: '0%',
            height: '25%',
            id: 'main',
        }, {
            top: '25%',
            height: '75%',
            id: 'panel1',
        }],
    });
});

test('fails if instrument does not exist', (t) => {
    const { data } = createTestData();
    t.throws(
        () => convertInstrumentToHighstock('nope')(data),
        /Instrument nope does not exist; please use any of aapl, amzn/,
    );
});

test('does not output if panel is false', (t) => {
    const { data } = createTestData();
    data.timeSeries.forEach((entry) => {
        entry.delete('close');
    });
    data.viewOptions = {
        series: new Map([
            ['open', { panel: false }],
        ]),
    };
    const result = convertInstrumentToHighstock('aapl')(data);
    t.deepEqual(result, {
        series: [],
        yAxis: [{
            top: '0%',
            height: '100%',
            id: 'main',
        }],
    });
});


test('creates result panel if available', (t) => {
    const { data } = createTestData();
    data.result = [{
        positions: [],
        orders: new Map(),
        positionValues: new Map(),
    }];
    const result = convertInstrumentToHighstock('aapl')(data);
    // Only test basically; detailed tests are in createResultChart.
    const resultPanel = result.yAxis.find(axis => axis.id === 'resultPanel');
    t.is(resultPanel.constructor, Object);
    const resultSeries = result.series.find(series => series.yAxis === 'resultPanel');
    t.is(resultSeries.constructor, Object);
});

