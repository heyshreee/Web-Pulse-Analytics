import React from 'react';
import GlobalLoader from './GlobalLoader';

const Spinner = ({ fullScreen = true, label, subLabel, className = '' }) => {
  return (
    <GlobalLoader
      fullScreen={fullScreen}
      label={label}
      subLabel={subLabel}
      className={className}
    />
  );
};

export default Spinner;
