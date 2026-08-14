'use client';

import { useTranslation } from 'react-i18next';

export function MemberList() {
  const { t } = useTranslation();
  return (
    <section aria-label={t('serverMembersLabel', { defaultValue: 'Members' })}>
      <p className="eyebrow px-3 pb-2">{t('serverMembersLabel', { defaultValue: 'Members' })}</p>
      <p className="px-3 text-sm font-semibold">{t('serverMemberSelf', { defaultValue: 'You' })}</p>
      <p className="px-3 pt-1 text-xs text-muted-foreground">
        {t('serverMemberCount', { defaultValue: '1 member' })}
      </p>
    </section>
  );
}
