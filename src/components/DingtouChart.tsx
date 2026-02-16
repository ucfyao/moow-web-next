'use client';

import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import { useTranslation } from 'react-i18next';

interface DingtouOrder {
  base_total: number;
  value_total: number;
  createdAt: string;
}

interface DingtouChartProps {
  orders: DingtouOrder[];
}

function formatNumber(value: number, mantissa: number = 2): number {
  return +Number(value).toFixed(mantissa);
}

function formatDate(date: string): string {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

function getChartHeight(): number {
  if (typeof window === 'undefined') return 400;
  return window.innerWidth < 768 ? 250 : 400;
}

export default function DingtouChart({ orders }: DingtouChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Highcharts.Chart | null>(null);
  const [chartHeight, setChartHeight] = useState(getChartHeight);
  const { t } = useTranslation();

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    function handleResize() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setChartHeight(getChartHeight());
        if (chartInstanceRef.current) {
          chartInstanceRef.current.reflow();
        }
      }, 200);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || orders.length === 0) return;

    const categories: string[] = [];
    const series1: number[] = []; // total invested
    const series2: number[] = []; // total value
    const series3: number[] = []; // profit rate

    orders.forEach((v) => {
      series1.push(formatNumber(v.base_total));
      series2.push(formatNumber(v.value_total));
      const profitRate =
        v.value_total !== 0
          ? formatNumber(((v.value_total - v.base_total) / v.value_total) * 100, 2)
          : 0;
      series3.push(profitRate);
      categories.push(formatDate(v.createdAt));
    });

    let max = Math.max(...series3);
    let min = Math.min(...series3);
    const b = max - min * 1.4 - (max - min);
    max = max + b / 2;
    min = min - b / 2;

    chartInstanceRef.current = Highcharts.chart(chartRef.current, {
      chart: {
        type: 'spline',
        height: chartHeight,
        reflow: true,
        zooming: {
          type: 'x',
          resetButton: {
            position: { align: 'right', verticalAlign: 'top', x: -10, y: 10 },
          },
        },
      },
      title: { text: undefined },
      subtitle: { text: 'BTC/USDT' },
      xAxis: { categories },
      yAxis: [
        {
          title: { text: undefined },
          labels: { format: '${value}' },
          tickAmount: 8,
        },
        {
          title: { text: t('chart.profit_rate') },
          labels: { format: '{value}%' },
          max,
          min,
          tickAmount: 8,
          opposite: true,
        },
      ],
      tooltip: {
        shared: true,
        crosshairs: true,
        headerFormat: '<b>{point.key}</b><br/>',
        pointFormat:
          '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b><br/>',
      },
      plotOptions: {
        line: {
          dataLabels: { enabled: true },
          enableMouseTracking: false,
        },
      },
      series: [
        {
          type: 'spline',
          yAxis: 1,
          name: t('chart.profit_rate'),
          data: series3,
          color: Highcharts.getOptions().colors?.[8],
        },
        {
          type: 'spline',
          name: t('chart.total_invested'),
          data: series1,
        },
        {
          type: 'spline',
          yAxis: 0,
          name: t('chart.total_value'),
          data: series2,
        },
      ],
      accessibility: {
        description: 'Investment performance chart showing profit rate, total invested, and total value over time',
      },
      credits: { enabled: false },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [orders, t, chartHeight]);

  return (
    <div
      ref={chartRef}
      className="dingtou-line"
      style={{ width: '100%' }}
      aria-label={t('chart.investment_performance')}
      role="img"
    />
  );
}
