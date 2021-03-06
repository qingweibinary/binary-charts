import { merge, wrap, Chart } from 'highcharts';

const defaultOptions = {
    color: 'red',
    enabled: true,
    style: {
        color: 'white',
        fontSize: '11px',
    },
    zIndex: 100,
};

const lastPriceFromSeries = series =>
    series.yData.length && series.yData[series.yData.length - 1] || 0;

const polyPath = (x, y, width, height) => [
    'M', 0, y - 0.5,
    'L',
    x - 8, y,
    x, y - (height / 2),
    x + width + 5, y - (height / 2),
    x + width + 5, y + (height / 2),
    x, y + (height / 2),
    x - 8, y + 0.5,
    0, y + 0.5,
];

const initialize = ({ renderer, options, currentPrice, x, y, spotIndicator, priceYAxis }) => {
    spotIndicator.group = renderer.g('spot')
        .attr({ zIndex: options.zIndex })
        .add();

    spotIndicator.poly = renderer
        .path(polyPath(priceYAxis.width + x - 5, y, x, 15))
        .attr({
            fill: options.color,
        })
        .add(spotIndicator.group);

    spotIndicator.label = renderer
        .label(currentPrice.toFixed(2), priceYAxis.width + x, y - 8)
        .attr({
            padding: 1,
        })
        .css({
            cursor: 'default',
            textAnchor: 'end',
            color: options.style.color,
            fontSize: options.style.fontSize,
        })
        .add(spotIndicator.group);
};

const update = ({ currentPrice, x, y, spotIndicator, priceYAxis }) => {
    spotIndicator.label.attr({
        text: currentPrice.toFixed(2),
    });

    spotIndicator.label.animate({
        x: priceYAxis.width + x - 5,
        y: y - 8,
    });

    spotIndicator.poly.animate({
        d: polyPath(priceYAxis.width, y, 60, 15),
    });

    const extremes = priceYAxis.getExtremes();

    if (currentPrice > extremes.min && currentPrice < extremes.max) {
        priceYAxis.spotIndicator.group.show();
    } else {
        priceYAxis.spotIndicator.group.hide();
    }
};

export default () => {
    const renderSpotIndicator = chart => {
        let options = chart.options.yAxis[0].spotIndicator;
        if (!options || !options.enabled) return;
        options = merge(true, defaultOptions, options);

        const priceYAxis = chart.yAxis[0];
        const currentPrice = lastPriceFromSeries(chart.series[0]);

        let x = chart.marginRight;
        let y = priceYAxis.toPixels(currentPrice);

        if (priceYAxis.spotIndicator) {
            update({ currentPrice, x, y, spotIndicator: priceYAxis.spotIndicator, priceYAxis });
        } else {
            priceYAxis.spotIndicator = {};
            initialize({
                renderer: chart.renderer,
                options,
                currentPrice,
                x, y,
                spotIndicator: priceYAxis.spotIndicator,
                priceYAxis,
            });
        }
    };

    wrap(Chart.prototype, 'init', function init(proceed, ...args) {
        proceed.apply(this, args);
        renderSpotIndicator(this);
    });

    wrap(Chart.prototype, 'redraw', function redraw(proceed, ...args) {
        proceed.apply(this, args);
        renderSpotIndicator(this);
    });
};
