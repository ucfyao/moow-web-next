/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { css } from '@emotion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import Highcharts from 'highcharts';
import DingtouChart from '@/components/DingtouChart';
import HTTP from '@/lib/http';
import iconDown from '@/assets/images/icon-down.png';

import 'swiper/css';
import 'swiper/css/pagination';

const homePageStyle = css`
  .tech_pf dl {
    transition: transform var(--transition-base), box-shadow var(--transition-base);
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }

  .display-data .card {
    transition: transform var(--transition-base), box-shadow var(--transition-base);

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
  }

  .cta-button {
    height: 48px;
    font-size: 16px;
    padding: 0 32px;
    cursor: pointer;
  }
`;

interface DingtouOrder {
  base_total: number;
  value_total: number;
  createdAt: string;
}

interface BtcHistoryItem {
  date: string;
  close: number;
}

// Fallback demo data if API is unavailable
const DEMO_ORDERS: DingtouOrder[] = [
  { base_total: 100, value_total: 98, createdAt: '2025-01-15' },
  { base_total: 200, value_total: 210, createdAt: '2025-02-15' },
  { base_total: 300, value_total: 335, createdAt: '2025-03-15' },
  { base_total: 400, value_total: 420, createdAt: '2025-04-15' },
  { base_total: 500, value_total: 560, createdAt: '2025-05-15' },
  { base_total: 600, value_total: 650, createdAt: '2025-06-15' },
  { base_total: 700, value_total: 790, createdAt: '2025-07-15' },
  { base_total: 800, value_total: 880, createdAt: '2025-08-15' },
  { base_total: 900, value_total: 1020, createdAt: '2025-09-15' },
  { base_total: 1000, value_total: 1150, createdAt: '2025-10-15' },
];

function BtcPriceChart({ data }: { data: BtcHistoryItem[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const categories = data.map((d) => d.date);
    const prices = data.map((d) => d.close);

    Highcharts.chart(chartRef.current, {
      chart: { type: 'area' },
      title: { text: undefined },
      subtitle: { text: 'BTC/USDT' },
      xAxis: {
        categories,
        tickInterval: Math.ceil(categories.length / 6),
        labels: { rotation: -45 },
      },
      yAxis: {
        title: { text: t('home.btc_price') },
        labels: { format: '${value:,.0f}' },
      },
      tooltip: {
        pointFormat: '<b>${point.y:,.2f}</b>',
      },
      plotOptions: {
        area: {
          fillOpacity: 0.15,
          marker: { enabled: false },
          lineWidth: 2,
        },
      },
      series: [
        {
          type: 'area',
          name: t('home.btc_price'),
          data: prices,
          color: '#f7931a',
        },
      ],
      credits: { enabled: false },
    });
  }, [data, t]);

  return <div ref={chartRef} style={{ width: '100%', minHeight: '300px' }} />;
}

export default function Home() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<DingtouOrder[]>([]);
  const [btcHistory, setBtcHistory] = useState<BtcHistoryItem[]>([]);

  useEffect(() => {
    // Fetch DCA demo orders from public API
    HTTP.get('/v1/public/dingtou/orders')
      .then((res: any) => {
        if (res?.data?.list?.length) {
          setOrders(res.data.list);
        } else {
          setOrders(DEMO_ORDERS);
        }
        return res;
      })
      .catch(() => {
        setOrders(DEMO_ORDERS);
      });

    // Fetch BTC price history
    HTTP.get('/v1/public/btc-history', { params: { limit: 365 } })
      .then((res: any) => {
        if (res?.data?.list?.length) {
          setBtcHistory(res.data.list);
        }
        return res;
      })
      .catch(() => {
        // silently fail — chart section just won't render
      });
  }, []);

  const swiperParams = {
    modules: [Pagination, Autoplay],
    pagination: {
      dynamicBullets: true,
      clickable: true,
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    loop: true,
  };

  return (
    <div className="home" css={homePageStyle}>
      {/* Banner Carousel */}
      <section className="swiper-box">
        <Swiper {...swiperParams}>
          <SwiperSlide>
            <div className="banner banner1" />
          </SwiperSlide>
          <SwiperSlide>
            <div className="banner banner2" />
          </SwiperSlide>
          <SwiperSlide>
            <div className="banner banner3" />
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Data Display Section */}
      <div className="display-bg">
        <div className="display-data">
          <div className="card">
            <h6 className="title is-6" style={{ paddingBottom: 0 }}>
              {t('home.live_data')}
            </h6>
            <DingtouChart orders={orders} />
            <Link href="/aip">
              <div className="button is-info">{t('home.try_it')}</div>
            </Link>
          </div>
        </div>
      </div>

      {/* BTC Price Trend */}
      {btcHistory.length > 0 && (
        <div className="display-bg" style={{ paddingTop: '1rem' }}>
          <div className="display-data">
            <div className="card">
              <h6 className="title is-6" style={{ paddingBottom: 0 }}>
                {t('home.btc_trend')}
              </h6>
              <BtcPriceChart data={btcHistory} />
            </div>
          </div>
        </div>
      )}

      {/* Pain Points & Solutions */}
      <div className="pb_st c_container c_center">
        <h1 className="title problem">{t('home.pain_points_title')}</h1>
        <div className="ps_con clearfix">
          <dl className="ps_box problem">
            <dt>{t('home.pain_points')}</dt>
            <dd>
              {t('home.pain_1_line1')}
              <br />
              {t('home.pain_1_line2')}
            </dd>
            <dd>
              {t('home.pain_2_line1')}
              <br />
              {t('home.pain_2_line2')}
            </dd>
            <dd>
              {t('home.pain_3_line1')}
              <br />
              {t('home.pain_3_line2')}
            </dd>
            <dd>
              {t('home.pain_4_line1')}
              <br />
              {t('home.pain_4_line2')}
            </dd>
          </dl>
          <Image src={iconDown} alt="" className="icon_down" />
          <dl className="ps_box solutions">
            <dt>{t('home.solutions')}</dt>
            <dd>{t('home.solution_1')}</dd>
            <dd>{t('home.solution_2')}</dd>
            <dd>{t('home.solution_3')}</dd>
            <dd>{t('home.solution_4')}</dd>
          </dl>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="tech_pf c_container c_center">
        <div className="module_top_bg">{t('home.why_choose_us')}</div>
        <dl>
          <dt></dt>
          <dd>{t('home.feature_1')}</dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>{t('home.feature_2')}</dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>{t('home.feature_3')}</dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>{t('home.feature_4')}</dd>
        </dl>
      </div>

      {/* CTA */}
      <div className="notification">
        <Link className="button is-link cta-button" href="/aip">
          {t('home.go_invest')}
        </Link>
      </div>
    </div>
  );
}
