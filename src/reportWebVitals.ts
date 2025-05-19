// src/reportWebVitals.ts
import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals')
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        if (onCLS) {
          onCLS(onPerfEntry);
        }
        if (onINP) {
          onINP(onPerfEntry);
        }
        if (onFCP) {
          onFCP(onPerfEntry);
        }
        if (onLCP) {
          onLCP(onPerfEntry);
        }
        if (onTTFB) {
          onTTFB(onPerfEntry);
        }
      })
      .catch((err) => {
        console.error(
          'Failed to load web-vitals module or an error occurred during import:',
          err
        );
      });
  }
};

export default reportWebVitals;
