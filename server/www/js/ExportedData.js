import { emitEvent, addEventListener } from './observer.js';

/**
 * Observer that emits a 'change' event with new data every time data changes on the server.
 */
export default class ExportedData {

    eventHandlerMap = new Map();
    data = new Map();

    emit(type, ...args) {
        emitEvent(this.eventHandlerMap)(type, ...args);
    }

    addEventListener(type, handler) {
        this.eventHandlerMap = addEventListener(this.eventHandlerMap)(type, handler);
    }

    updateData(data) {
        this.data = data;
        // console.log('Data changed to', data);
        this.emit('change', data);
    }

}
