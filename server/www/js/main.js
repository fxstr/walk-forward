import ExportedData from './ExportedData.js';
import SocketListener from './SocketListener.js';

const data = new ExportedData();
const socket = new SocketListener(data);

socket.listen();

/* global document */
document.querySelector('result-view').data = data;
