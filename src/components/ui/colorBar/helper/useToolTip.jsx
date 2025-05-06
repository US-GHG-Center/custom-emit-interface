import { useState, useCallback } from 'react';

export const useTooltipPosition = () => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: null,
  });

  const handleMouseMove = (event, valueScale) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTooltip({
      visible: true,
      x,
      y,
      value: valueScale(x),
    });
  };

  const hideTooltip = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  return { tooltip, handleMouseMove, hideTooltip };
};
