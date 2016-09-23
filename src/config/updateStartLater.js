import { getLast } from 'binary-utils';
import createHiddenSeries from './createHiddenSeries';
import getMainSeries from '../utils/getMainSeries';

export default (chart: Chart, startLaterEpoch: number, lastData: Object) => {
    const lastTick = Object.keys(lastData).length === 2 ? lastData.quote : lastData.close;
    if (startLaterEpoch <= lastData.epoch) {
        return;
    }

    const xAxis = chart.xAxis[0];
    const { min, max } = xAxis.getExtremes();

    if (!min || !max) return;               // if chart is not drawn yet, abort

    const oldSeries = chart.get('future');
    const startLaterDate = (startLaterEpoch + 5) * 1000; // 5 secs space to the right

    if (startLaterEpoch && lastTick) {
        if (oldSeries) {
            const oldStartLater = Math.round(oldSeries.options.data[0][0] / 1000);
            if (oldStartLater !== startLaterEpoch) {
                oldSeries.setData([startLaterDate, lastTick]);
                xAxis.setExtremes(min, startLaterDate);
            }
        } else {
            const lastDataX = lastData.epoch * 1000;
            const tenArray = Array.apply(null, Array(10)).map(() => 0);
            const interval = (startLaterDate - lastDataX) / 10;
            const futureSeriesData = tenArray.map((v, idx) => {
                const addition = interval * (idx + 1);
                return [lastDataX + addition, lastTick];
            });

            chart.addSeries(createHiddenSeries(futureSeriesData, 'future'));
            xAxis.setExtremes(min, startLaterDate);
        }
    }

    if (!startLaterEpoch) {
        if (oldSeries) {
            oldSeries.remove();
            const mainSeries = getMainSeries(chart);
            const mainSeriesMax = mainSeries && getLast(mainSeries.options.data)[0];

            if (mainSeriesMax && max > mainSeriesMax) {
                xAxis.setExtremes(min, mainSeriesMax);
            }
        }
    }
};
