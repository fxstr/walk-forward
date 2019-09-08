export default class SocketListener {
    
    constructor(exportedData) {
        this.exportedData = exportedData;
    }

    listen() {
        const stream = new EventSource('//localhost:8000/result');
        stream.addEventListener('message', (ev) => {
            console.log('SocketListener: Got message %o', ev);
            this.exportedData.updateData(ev.data);
        });
        console.log('SocketListener: Listening');
    }

}