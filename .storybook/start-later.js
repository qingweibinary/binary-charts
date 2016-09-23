import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { nowAsEpoch } from 'binary-utils';
import BinaryChart from '../src/BinaryChart';
import ticks, { massiveTicks } from './ticks';


const fakeTrade = {
    date_start: nowAsEpoch() + 60000,
    duration: 2,
    amount: 50,
    duration_unit: 'm',
    contract_type: 'CALL',
    basis: 'stake',
};

storiesOf('Start in future', module)
    .add('Static', () =>
        <BinaryChart
            ticks={ticks}
            pipSize={3}
            trade={fakeTrade}
        />
    )
    .add('Much more data', () =>
        <BinaryChart
            ticks={massiveTicks}
            pipSize={3}
            trade={fakeTrade}
        />
    );