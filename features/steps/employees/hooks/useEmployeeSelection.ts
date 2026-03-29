
import { useState } from 'react';

export const useEmployeeSelection = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const selectEmployee = (id: number) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const deselectEmployee = () => setActiveId(null);

  return {
    activeId,
    selectEmployee,
    deselectEmployee,
  };
};
