import React, { useEffect } from 'react';
import Highcharts from 'highcharts';

interface ChartProps {
  id: string;
  categories: string[];
  series1: number[];
  series2: number[];
  series3: number[];
  max: number;
  min: number;
}

const Chart: React.FC<ChartProps> = ({ id, categories, series1, series2, series3, max, min }) => {
  useEffect(() => {
    Highcharts.chart('line-container', {
      chart: {
        type: 'spline'
      },
      title: {
        text: 'Investment Returns Chart'
      },
      subtitle: {
        text: 'Data source: xiaobao.io'
      },
      xAxis: {
        categories
      },
      yAxis: [
        {
          title: {
            enabled: false
          },
          labels: {
            format: '${value}'
          },
          tickAmount: 8
        },
        {
          title: {
            text: 'Profit Rate'
          },
          labels: {
            format: '{value}%'
          },
          max,
          min,
          tickAmount: 8,
          opposite: true
        }
      ],
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true
          },
          enableMouseTracking: false,
          lineWidth: 1,
          marker: {
            radius: 0,
            states: {
              hover: {
                enabled: false,
                lineWidth: 1
              }
            }
          }
        }
      },
      series: [
        {
          yAxis: 1,
          name: 'Profit Rate',
          data: series3,
          color: Highcharts.getOptions().colors[8]
        },
        {
          name: 'Total Quote',
          data: series1
        },
        {
          yAxis: 0,
          name: 'Total Value',
          data: series2
        }
      ]
    });
  }, [categories, series1, series2, series3, max, min]);

  return <div id="line-container"></div>;
};

export default Chart;
