import React from 'react';

interface PageFooterProps {
  pageNumber: string;
}

const PageFooter: React.FC<PageFooterProps> = ({ pageNumber }) => {
  return (
    <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
      <div>STRATTON PRIME SP. Z O.O.</div>
      <div>STRONA {pageNumber}</div>
    </div>
  );
};

export default PageFooter;