import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import './index.css';

const ToggleSwitch = ({ title, onToggle, enabled, initialState }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    if (onToggle) {
      onToggle(newState); // Callback with the updated state
    }
  };

  return (
    <div className='toggle-container'>
      <Typography variant='body2' gutterBottom>
        {title}
      </Typography>
      <label className='toggle-switch'>
        <input
          type='checkbox'
          className='toggle-input'
          id='showCoverage'
          checked={isChecked}
          disabled={!enabled}
          onChange={handleToggle}
        />
        <span className='slider'></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
