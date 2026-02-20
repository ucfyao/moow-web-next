'use client';

import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function AdminRates() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="title is-4">{t('admin.rates')}</h1>
      <p className="subtitle is-6">Coming soon</p>
    </div>
  );
}
