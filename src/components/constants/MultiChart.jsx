/* eslint-disable prefer-rest-params */
import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';

import { barChartOptionsSpeed } from './config';

const MultiBar = ({
  data,
  shadow = false,
  optionsPage = null,
  dblclickevent = null,
  // from
}) => {
  const chartContainer = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const doubliceClickCanvas = (canvasevent) => {
    const point = chartInstance.getElementsAtEventForMode(
      canvasevent,
      'nearest',
      {
        intersect: true,
      },
      true
    );
    if (point.length > 0) {
      const firstpoint = point[0];
      if (firstpoint) {
        // eslint-disable-next-line no-underscore-dangle
        const datasetindex = firstpoint._datasetIndex ?? null;
        // eslint-disable-next-line no-underscore-dangle
        const dataindex = firstpoint._index ?? null;
        const value =
          chartInstance.data.datasets[datasetindex]?.data[dataindex];
        if (dblclickevent && value) {
          dblclickevent(value);
        }
      }
    }
  };

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      if (shadow) {
        Chart.defaults.global.datasets.barWithShadow =
          Chart.defaults.global.datasets?.bar;
        Chart.defaults.barWithShadow = Chart.defaults.bar;
        Chart.controllers.barWithShadow = Chart.controllers.bar.extend({
          draw(ease) {
            Chart.controllers.bar.prototype.draw.call(this, ease);
            const {
              chart: { ctx },
            } = this;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 7;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 7;
            ctx.responsive = true;
            Chart.controllers.bar.prototype.draw.apply(this, arguments);
            ctx.restore();
          },
        });
      }
      const context = chartContainer.current.getContext('2d');
      context.onDoubleClick = dblclickevent;
      const newChartInstance = new Chart(context, {
        type: shadow ? 'barWithShadow' : 'bar',
        options: optionsPage || barChartOptionsSpeed,
        data,
      });

      // if (dblclickevent) {

      // }

      setChartInstance(newChartInstance);

    }
  }, [chartContainer, data, shadow]);

  return <canvas ref={chartContainer} onDoubleClick={doubliceClickCanvas} />;
};

export default MultiBar;
