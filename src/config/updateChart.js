// $FlowFixMe
import shallowEqual from 'fbjs/lib/shallowEqual';
import { areTickArraysEqual, areCandleArrayEqual,
    getLastTickQuote, getLastOHLCTick, getLast } from 'binary-utils';
import updateSeries from './updateSeries';
import updateContract from './updateContract';
import updateStartLater from './updateStartLater';
import updateTradingTimes from './updateTradingTimes';
import updateRest from './updateRest';
import updateMinRange from './updateMinRange';
// $FlowFixMe
import mergeTradeWithContract from './mergeTradeWithContract';

const ticksAreEqual = (prevProps, nextProps) =>
    prevProps.symbol === nextProps.symbol &&
    prevProps.type === nextProps.type &&
    areTickArraysEqual(prevProps.ticks, nextProps.ticks);

const ohlcAreEqual = (prevProps, nextProps) =>
    prevProps.symbol === nextProps.symbol &&
    prevProps.type === nextProps.type &&
    areCandleArrayEqual(prevProps.ticks, nextProps.ticks);

const contractsAreEqual = (prevProps, nextProps) =>
    shallowEqual(prevProps.contract, nextProps.contract) &&
        shallowEqual(prevProps.trade, nextProps.trade);

const tradingTimesAreEqual = (prevProps, nextProps) =>
    shallowEqual(nextProps.tradingTimes, prevProps.tradingTimes);

const restAreEqual = (prevProps, nextProps) =>
    nextProps.pipSize === prevProps.pipSize;


export default (chart: Chart, prevProps: Object, nextProps: Object) => {
    const contractsDiffer = !contractsAreEqual(prevProps, nextProps);

    const { contract, pipSize, theme, trade, ticks, type, shiftMode } = nextProps;

    let lastTick = {};
    let ticksDiffer = true;
    switch (type) {
        case 'line':
        case 'area': {
            lastTick = getLastTickQuote(ticks);
            ticksDiffer = !ticksAreEqual(prevProps, nextProps);
            break;
        }
        case 'ohlc':
        case 'candlestick': {
            lastTick = getLastOHLCTick(ticks);
            ticksDiffer = !ohlcAreEqual(prevProps, nextProps);
            break;
        }
        default: {
            throw new Error('Not recognized chart type: ', type);
        }
    }

    const mergedContract = mergeTradeWithContract(trade, contract, lastTick);

    // order of execution matters!
    // other update func could potentially depends on chart.userOptions.binary
    chart.userOptions.binary = Object.assign(chart.userOptions.binary, {
        contract: mergedContract,
        ticks,
        pipSize,
        theme,
        shiftMode: shiftMode || chart.userOptions.binary.shiftMode,            // use old shiftMode if no new shiftMode
        type,
    });

    if (ticksDiffer) {
        updateSeries(chart, nextProps);
        // chart.redraw();
        if (ticks.length > 0) {
            chart.hideLoading();
        }
    }

    if (mergedContract) {
        updateStartLater(chart, mergedContract.date_start, getLast(ticks));
    }

    if (contractsDiffer || ticksDiffer) {
        updateContract(chart, mergedContract, theme);
    }

    const tradingTimesDiffer = !tradingTimesAreEqual(prevProps, nextProps);
    if (tradingTimesDiffer) {
        const { tradingTimes } = nextProps;
        updateTradingTimes(chart, tradingTimes);
    }

    const restDiffer = !restAreEqual(prevProps, nextProps);
    if (restDiffer) {
        updateRest(chart, nextProps);
    }

    updateMinRange(chart);

    chart.redraw();
};
