const addEventListener = map => (eventType, handler) => (
    new Map(map).set(eventType, map.has(eventType) ? [...map.get(eventType), handler] : [handler])
);

const emitEvent = map => (eventType, ...args) => {
    if (map.has(eventType)) map.get(eventType).forEach(handler => handler(...args));
};

export { addEventListener, emitEvent };
