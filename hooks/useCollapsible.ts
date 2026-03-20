import { useState } from 'react';

/**
 * Manages a collapsed/expanded state for a list of items identified by numeric id.
 * Extracted from StepPracownicy — reusable wherever an accordion-style list is needed.
 */
export const useCollapsible = () => {
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) =>
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  return { expandedIds, toggleExpand };
};
