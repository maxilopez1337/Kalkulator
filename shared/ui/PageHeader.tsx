import React, { ReactNode } from 'react';

interface PageHeaderProps {
  /** Left-side icon — wrapped automatically in a coloured pill */
  icon?: ReactNode;
  /** Icon background + text colour, e.g. 'bg-blue-50 text-blue-700' */
  iconColor?: string;
  title: string;
  description?: string;
  /** Right-side slot — buttons, badges, etc. */
  actions?: ReactNode;
}

/**
 * Consistent page/step header: icon + title + description + optional right-side actions.
 * Used at the top of each step view to replace one-off inline header markup.
 *
 * @example
 * <PageHeader
 *   icon={<TrendingUp />}
 *   iconColor="bg-blue-50 text-blue-700"
 *   title="Analiza Opłacalności"
 *   description="Wybierz strategię wdrożeniową."
 *   actions={<ButtonSecondary>Eksportuj</ButtonSecondary>}
 * />
 */
export const PageHeader = ({
  icon,
  iconColor = 'bg-[#eff6fc] text-[#0078d4]',
  title,
  description,
  actions,
}: PageHeaderProps) => (
  <div className="flex flex-col gap-2 mb-2">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`p-2 rounded-md flex-shrink-0 ${iconColor}`}>{icon}</div>
        )}
        <h2 className="text-xl font-bold text-[#201f1e] leading-tight">{title}</h2>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
    {description && (
      <p className="text-sm text-[#605e5c] max-w-3xl leading-relaxed">{description}</p>
    )}
  </div>
);
