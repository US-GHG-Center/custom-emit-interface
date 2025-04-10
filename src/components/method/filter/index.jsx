import { useState } from 'react';
import { Slider, Typography, Box } from '@mui/material';
import moment from 'moment';
/**
 * FilterByDate Component
 *
 * Provides an interactive slider to filter STAC items by observation date.
 * Displays the selected date range and emits filtered results on commit.
 *
 * @param {Object} props
 * @param {Array<Object>} props.vizItems - Array of STACItems to filter.
 * @param {Function} props.onFilteredItems - Callback with filtered STACItems based on selected date range.
 * @param {Function} props.onDateChange - Callback to emit selected date range (in milliseconds).
 *
 * @returns {JSX.Element}
 */

export function FilterByDate({ vizItems, onFilteredItems, onDateChange }) {
  const minDate = moment('2022-08-09').valueOf();
  const maxDate = moment().valueOf();
  const [dateRange, setDateRange] = useState([minDate, maxDate]);

  /**
   * Handles slider commit: filters data and emits range + results.
   *
   * @param {Event}
   * @param {[number, number]} dateRange - Selected timestamp range
   */
  const handleSliderChange = (_, dateRange) => {
    onDateChange(dateRange);
    const filteredVizItems = vizItems.filter((vizItem) => {
      const vizItemDate = moment(vizItem?.properties?.datetime).valueOf();
      const item = vizItemDate >= dateRange[0] && vizItemDate <= dateRange[1];
      return item;
    });
    onFilteredItems(filteredVizItems);
  };

  return (
    <Box
      sx={{
        width: '100%',
        padding: '20px 15px 20px 10px',
      }}
    >
      <Typography
        gutterBottom
        variant='body2'
        sx={{
          marginBottom: '0px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {moment(dateRange[0]).format('ddd, DD MMM YYYY')} -{' '}
        {moment(dateRange[1]).format('ddd, DD MMM YYYY')}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Slider
          value={dateRange}
          onChange={(_, newValue) => {
            setDateRange(newValue);
          }}
          onChangeCommitted={(_, newValue) => handleSliderChange(_, newValue)}
          getAriaLabel={() => 'Date range'}
          min={minDate}
          max={maxDate}
          step={86400000} // One day step
          sx={{
            display: 'flex',
            height: '8px',
            '& .MuiSlider-track': {
              backgroundColor: '#082A63',
              height: '14px',
              borderRadius: '1px',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#ffffff',
              height: '14px',
              borderRadius: '3px',
              border: '1px solid #aaaaaa',
            },
            '& .MuiSlider-thumb': {
              width: '22px',
              height: '26px',
              backgroundColor: '#fffffe',
              border: '1px solid #eeeeee',
              borderRadius: 2,
              boxShadow: '0 0 0px rgba(0,0,0,0.2)',
              '&:hover': {
                boxShadow: '0 0 8px rgba(0,0,0,0.3)',
              },
            },
          }}
        />

        <div
          style={{
            display: 'flex',
            margin: '-4px',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            gutterBottom
            variant='body2'
            sx={{
              marginBottom: '0px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            Start Date
          </Typography>
          <Typography
            gutterBottom
            variant='body2'
            sx={{
              marginBottom: '0px',

              display: 'flex',
              justifyContent: 'center',
            }}
          >
            End Date
          </Typography>
        </div>
      </div>
    </Box>
  );
}
