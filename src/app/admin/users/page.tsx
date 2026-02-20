'use client';

import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function AdminUsers() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="title is-4">{t('admin.users')}</h1>
      <p className="subtitle is-6">{t('admin.coming_soon')}</p>
    </div>
  );
}
