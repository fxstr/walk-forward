import test from 'ava';
import handleViewOptions from './handleViewOptions.mjs';

function setupData() {
    const options1 = {
        panels: new Map([
            ['panel1', { height: 0.5 }],
        ]),
        series: new Map([
            ['series1', { type: 'line', panel: 'panel1' }],
        ]),
    };
    const options2 = {
        panels: new Map([
            ['panel2', { height: 0.7 }],
        ]),
        series: new Map([
            ['series2', { type: 'dots', panel: 'panel2' }],
        ]),
    };
    return { options1, options2 };
}

test('throws on invalid data', (t) => {
    t.throws(() => handleViewOptions('notAnObject'), /previousOptions must be an object/);
    t.throws(() => handleViewOptions({}, 'notAnObject'), /newOptions must be an object/);
    t.throws(() => handleViewOptions({}, { panels: 'notAMap' }), /panels property on newOptions/);
    t.throws(() => handleViewOptions({}, { series: 'notAMap' }), /series property on newOptions/);
});

test('creates empty data if empty options are given', (t) => {
    const result = handleViewOptions({}, {});
    t.deepEqual(result, {
        series: new Map(),
        panels: new Map(),
    });
});

test('returns previous result if no data is given', (t) => {
    const { options1 } = setupData();
    const result = handleViewOptions(options1, {});
    t.deepEqual(result, options1);
});

test('does not modify data passed in', (t) => {
    const { options1, options2 } = setupData();
    handleViewOptions(options1, options2);
    t.deepEqual(options1, setupData().options1);
    t.deepEqual(options2, setupData().options2);
});

test('throws if panel does not exist', (t) => {
    const { options1 } = setupData();
    delete options1.panels;
    t.throws(
        () => handleViewOptions({}, options1),
        /Panel panel1 does not exist, was used for series series1/,
    );
});

test('handles only panel options', (t) => {

    const { options1, options2 } = setupData();
    delete options2.series;

    const result = handleViewOptions(options1, options2);

    const expected = setupData().options1;
    expected.panels.set('panel2', options2.panels.get('panel2'));

    t.deepEqual(result, expected);

});


test('handles only series options', (t) => {

    const { options1, options2 } = setupData();
    delete options2.panels;
    options2.series.get('series2').panel = 'panel1';

    const result = handleViewOptions(options1, options2);

    const expected = setupData().options1;
    expected.series.set('series2', { type: 'dots', panel: 'panel1' });

    t.deepEqual(result, expected);

});


test('converts series and panel data', (t) => {

    const { options1, options2 } = setupData();

    // Check if data is correctly being added to empty and non-empty previous data
    const result = handleViewOptions(handleViewOptions({}, options1), options2);

    t.deepEqual(result, {
        panels: new Map([
            ...options1.panels,
            ...options2.panels,
        ]),
        series: new Map([
            ...options1.series,
            ...options2.series,
        ]),
    });

});

