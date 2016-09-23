export default (data: ChartTick, id: string) => ({
    type: 'line',
    data,
    id,
    lineWidth: 0,
    enableMouseTracking: false,
    dataGrouping: {
        enabled: false,
    },
});
