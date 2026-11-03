import React from 'react';
import GlobalLoader from './GlobalLoader';

export default function Loader({ fullScreen = true, label, subLabel, className = '' }) {
  return (
    <GlobalLoader
      fullScreen={fullScreen}
      label={label}
      subLabel={subLabel}
      className={className}
    />
  );
}
