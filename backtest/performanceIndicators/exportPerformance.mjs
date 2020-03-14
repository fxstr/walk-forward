export default () => (data) => {

    const { performance } = data;
    if (!performance || !(performance instanceof Map)) {
        throw new Error(`exportPerformance: Make sure strategy's performance property is set (e.g. by calling calculatePerformance) before you're exporting performance; is currently ${JSON.stringify(performance)}.`);
    }

    return Array.from(performance.entries())
        .map(([name, value]) => `${name},${value}`).join('\n');

};
