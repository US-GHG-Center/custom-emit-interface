
export const fetchAllFromSTACAPI = async (STACApiUrl) => {
  // it will fetch all collection items from all stac api.
  // do not provide offset and limits in the url
  // console.log({ STACApiUrl });
  try {
    let requiredResult = [];
    // fetch in the collection from the stac api
    const response = await fetch(STACApiUrl);
    if (!response.ok) {
      throw new Error('Error in Network');
    }
    const jsonResult = await response.json();
    requiredResult.push(...getResultArray(jsonResult));

    // need to pull in remaining data based on the pagination information
    const { matched, returned } = jsonResult.context;
    if (matched > returned) {
      let allData = await fetchAllDataSTAC(STACApiUrl, matched);
      requiredResult = [...allData];
    }
    // console.log({ requiredResult });
    return requiredResult;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const fetchAllDataSTAC = async (STACApiUrl, numberMatched) => {
  // NOTE: STAC API doesnot accept offset as a query params. So, need to pull all the items using limit.
  try {
    const fullDataPromise = fetch(
      addOffsetsToURL(STACApiUrl, 0, numberMatched)
    );
    let result = await fullDataPromise;
    let jsonResult = await result.json();
    let allResult = [...getResultArray(jsonResult)];
    return allResult;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const fetchAllFromFeaturesAPI = async (featureApiUrl) => {
  // it will fetch everthing from all the pages.
  // do not provide offset and limits in the url
  console.log('fetching data from:', featureApiUrl);
  try {
    let requiredResult = [];
    // fetch in the collection from the features api
    let offset = 0;
    let pageLimit = getMaxLimitPerPage(featureApiUrl);
    let url = addOffsetsToURL(featureApiUrl, offset, pageLimit);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error in Network');
    }
    const jsonResult = await response.json();
    requiredResult.push(...getResultArray(jsonResult));

    // need to pull in remaining data based on the pagination information
    const { numberMatched, numberReturned } = jsonResult;
    if (numberMatched > numberReturned) {
      let remainingData = await fetchRemainingData(
        featureApiUrl,
        numberMatched,
        numberReturned,
        pageLimit
      );
      requiredResult.push(...remainingData);
    }
    return requiredResult;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const fetchRemainingData = async (
  featureApiUrl,
  numberMatched,
  numberReturned,
  limit
) => {
  let remaining = numberMatched - numberReturned;
  // so we still have some remaining data to fetch
  let batches = Math.ceil(remaining / limit);
  let offsets = []; // when we are pulling data in the capacity of 1000 per batches
  for (let i = 1; i <= batches; i++) {
    offsets.push(i * limit);
  }

  let dataFetchPromises = [];

  offsets.forEach(async (offset) => {
    const response = fetch(addOffsetsToURL(featureApiUrl, offset, limit));
    dataFetchPromises.push(response);
  });

  try {
    let results = await Promise.all(dataFetchPromises);
    let jsonResult = await Promise.all(results.map((result) => result.json()));
    let remainingRequiredResult = [];
    jsonResult.forEach((data) => {
      remainingRequiredResult.push(...getResultArray(data));
    });
    return remainingRequiredResult;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const getMaxLimitPerPage = (url) => {
  // Note: as of current features api deployment, the max limit is 1000 for collection result and 10,000 for colleciton item result
  if (url.includes('items')) {
    // https://<url>/api/features/collections/<collection_id>/items
    return 10000;
  }
  if (url.includes('collections')) {
    // https://<url>/api/features/collections
    return 1000;
  }
  return 10;
};

// helpers

const addOffsetsToURL = (url, offset, limit) => {
  if (url.includes('?')) {
    return `${url}&limit=${limit}&offset=${offset}`;
  } else {
    return `${url}?limit=${limit}&offset=${offset}`;
  }
};

export const getResultArray = (result) => {
  if ('features' in result) {
    // the result is for collection item
    return result.features;
  }
  if ('collections' in result) {
    // the result is for collection
    return result.collections;
  }
  return [];
};

export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Error in Network');
    }
    const jsonResult = await response.json();
    return jsonResult;
  } catch (err) {
    console.error('Error while getting data');
  }
};

