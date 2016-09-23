import { configure } from '@kadira/storybook';

configure(() => {
    require('./basic');
    require('./data');
    require('./multiple-charts');
    require('./contract-types');
    require('./times');
    require('./dynamic-fetching');
    require('./past-contracts');
    require('./open-contracts');
    require('./indicators');
    require('./plotlines');
    require('./start-later');
    require('./ohlc');
    require('./extremes');
    require('./dynamicTypeChange');
}, module);
