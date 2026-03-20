import React from 'react';

interface DataTableToolbarProps {
  /** Left slot — SearchInput node */
  search: React.ReactNode;
  /** Right slot — alert, buttons, etc. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Toolbar row that sits between the grid header and the data table.
 * Contains a left-aligned search input and an optional right-side actions slot.
 */
export const DataTableToolbar = ({
  search,
  actions,
  className = '',
}: DataTableToolbarProps) => (
  <div
    className={`px-4 md:px-6 py-2 bg-[#f8f9fa] border-b border-[#edebe9] flex-shrink-0 flex flex-col xl:flex-row gap-2 justify-between items-center ${className}`}
  >
    <div className="flex-1 max-w-md">{search}</div>
    {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
  </div>
);
