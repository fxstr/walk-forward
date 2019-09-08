import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:run');

export default (data, sortFunction) => {
    console.log('sort everything with function', sortFunction);
}