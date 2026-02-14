'use client';

import { useEffect, useRef } from 'react';
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

export default function DingtouChart({ orders }: DingtouChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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

    Highcharts.chart(chartRef.current, {
      chart: { type: 'spline' },
      title: { text: undefined },
      subtitle: { text: 'BTC/USDT' },
      xAxis: { categories },
      yAxis: [
        {
          title: { enabled: false },
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
      credits: { enabled: false },
    });
  }, [orders, t]);

  return <div ref={chartRef} className="dingtou-line" />;
}
