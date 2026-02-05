import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  pageInfo: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, pageInfo }) => {
  return (
    <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <h2 className="text-2xl font-serif font-bold text-brand-dark uppercase tracking-wide">
          {title}
        </h2>
        <span className="hidden md:block text-gray-300 text-2xl font-light">|</span>
        <span className="text-lg text-gray-400 font-light uppercase tracking-wide">
          {subtitle}
        </span>
      </div>
      <div className="text-xs text-gray-400 font-mono hidden sm:block">
        {pageInfo}
      </div>
    </div>
  );
};

export default PageHeader;