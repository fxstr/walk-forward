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
            const element = document.createElement('div');
            element.innerHTML = data.replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;') + '<hr/>';
            this.appendChild(element);
        });
        this.listening = true;
    }
}

window.customElements.define('result-view', ResultView);