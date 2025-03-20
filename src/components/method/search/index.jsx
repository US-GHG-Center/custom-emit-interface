import { useState, useRef, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

import { TrieSearch } from './helper/trieSearch';
import { selectClasses } from '@mui/material';
/*
      Search stacItem compoents

      @param {STACItem} vizItems   - An array of stac items from which search is to be done
      @param {function} onSelectedVizItemSearch -  will provide vizItemId as a parameter to the callback when a item is clicked from dropdown 
      
*/
export function Search({ vizItems, onSelectedVizItemSearch }) {
  const ids = vizItems?.map((vizItem) => {
    const id = vizItem?.id;
    const location = vizItem?.plumeProperties?.location;
    const idString = id.split('_').join('-');
    const locationString = location
      ?.split(',')
      .reverse()
      .map((part) => part.trim())
      .join('_');
    return `${locationString}_${idString}`;
  });

  const trieSearch = useRef(null);
  const [searchOptions, setSearchOptions] = useState([]);

  const handleSearch = (prefix) => {
    const searchResult = trieSearch.current.getRecommendations(prefix);
    return searchResult;
  };

  const handleOnInputTextChange = (event) => {
    const text = event.target.value;
    const searchResults = handleSearch(text);
    setSearchOptions(searchResults);
  };

  const handleOnOptionClicked = (event, clickedValue) => {
    const temp = clickedValue.split('_')[3];
    const vizItemId = temp.split('-').join('_');
    onSelectedVizItemSearch(vizItemId);
  };

  useEffect(() => {
    trieSearch.current = new TrieSearch();
    // id in ids are expected to be _ separated for better search result.
    if (ids && ids.length) trieSearch.current.addItems(ids);
  }, [ids]);

  return (
    <Autocomplete
      freeSolo
      id='free-solo-2-demo'
      disableClearable
      options={searchOptions}
      style={{ width: '100%' }}
      renderInput={(params) => (
        <TextField
          {...params}
          id='outlined-basic'
          label='Search by Plume ID or Location'
          variant='outlined'
          style={{ width: '100%', backgroundColor: '#EEEEEE' }}
          onChange={handleOnInputTextChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onChange={handleOnOptionClicked}
    />
  );
}
