/* global HTMLElement, document, window */

/**
 * Listens to changes on data, renders <high-stock-view> every time data changes
 */
class ResultView extends HTMLElement {

    listening = false;

    constructor() {
        super();
        console.log('ResultView: Constructed');
    }

    /**
     * Use public setter as we must start watching data whenever it is set.
     * @param  {*} data        Data (must be an eventEmitter)
     */
    set data(data) {
        console.log('ResultView: Data updated');
        this.internalData = data;
        this.setupWatcher();
    }

    connectedCallback() {
        console.log('ResultView: Connected');
        this.setupWatcher();
    }

    setupWatcher() {
        if (this.listening) return;
        if (!this.internalData) {
            console.log('ResultView: Data not set, cannot listen');
            return;
        }
        this.internalData.addEventListener('change', (data) => {
            let parsedData;
            try {
                parsedData = JSON.parse(data);
            } catch (err) {
                console.error('ResultView: Could not parse data %o: %o', data, err);
                return;
            }
            console.log('ResultView: Data changed, create HighStockView');
            this.innerHTML = '<high-stock-view />';
            this.firstChild.data = parsedData;
        });
        this.listening = true;
    }
}

window.customElements.define('result-view', ResultView);
