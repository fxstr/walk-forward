/* global HTMLElement, document, window, Highcharts */
class HighStockView extends HTMLElement {

    set data(data) {

        console.log('HighStockView: Update data to %o', data);

        const div = document.createElement('div');
        div.setAttribute('class', 'high-stock-container');
        this.appendChild(div);

        // Convert instrument's data (object with timestamps as keys) to array that can be used
        // with HighStock. See https://www.highcharts.com/samples/data/aapl-ohlc.json

        // Add scroll wheel support, see http://jsfiddle.net/d_paul/xcqd8ccb/11/
        const extendedData = {
            ...data,
            mapNavigation: { enableMouseWheelZoom: true },

        };
        extendedData.xAxis = {
            scrollbar: { enabled: true },
        };

        Highcharts.stockChart(div, extendedData);

    }

}

window.customElements.define('high-stock-view', HighStockView);
