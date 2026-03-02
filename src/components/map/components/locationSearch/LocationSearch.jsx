import { useState, useRef, useEffect } from 'react';  
import { setMapCenter } from '@/store/slices/mapSlice';
import { MdOutlineMyLocation } from 'react-icons/md';
import { useDispatch } from 'react-redux';
 
export default function LocationSearch({ 
  placeholder = "Search locations...",
  showRecent = true,
}) { 
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const showSuggestions = useRef(false);
  const recentLocations = [];
  const inputRef = useRef(null);
  const dispatch = useDispatch();


  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => { 
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        // if(!showSuggestions.current){
        //   showSuggestions.current = true ;
        // }
      } catch (error) {
        console.error('Error searching locations:', error); 
        setSuggestions([]);
      } finally { 
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchLocations = async (searchQuery) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    const data = await response.json();
    
    return data.map((item) => ({
      id: item.place_id,
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  };

  const getCurrentLocation = () => {
    showSuggestions.current = false
    if (!navigator.geolocation) { 
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try { 
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            // const location= {
            //   id: 'current',
            //   name: data.display_name,
            //   latitude,
            //   longitude,
            // }; 

            // setMapCenter([longitude, latitude])
            dispatch(setMapCenter([longitude, latitude]));

            setQuery(data.display_name)
            showSuggestions.current = false; 
          }
        } catch (error) {
          console.error('Error getting location name:', error); 
          // const location= {
          //   id: 'current',
          //   name: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          //   latitude,
          //   longitude,
          // }; 
        }
        //  finally { 
        // }
      },
      (error) => {
        console.error('Error getting current location:', error); 
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSuggestionClick = (location) => {
    setQuery(location.name)
    console.log(location);
    let {latitude, longitude} = location
    if(latitude && longitude){
      // setMapCenter([longitude, latitude])
      dispatch(setMapCenter([longitude, latitude]));
    }  
    showSuggestions.current = false; 
  };

  const handleRecentLocationClick = (location) => {
    setQuery(location.name);
    let {latitude, longitude} = location
    if(latitude && longitude){
      // setMapCenter([longitude, latitude])
      dispatch(setMapCenter([longitude, latitude]));
    }  
    showSuggestions.current = false; 
  };

  const handleInputBlur = () => {
    setTimeout(() => showSuggestions.current = false, 200);
  };

  const displaySuggestions = showRecent && query.length === 0 && recentLocations.length > 0 
    ? recentLocations 
    : suggestions; 

  const showRecentLabel = showRecent && query.length === 0 && recentLocations.length > 0;

  return (
    <div className="location-container">
      <div className="relative flex items-center"> 
        <svg className='absolute left-3 h-4 w-4 text-gray-400' xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => showSuggestions.current = true}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full text-gray-500 pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* <button
          type="button"
          onClick={togglePlace} 
          className="absolute right-10 p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          title="Choose location"
        > 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" width="24" height="24"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </button> */}

        <button
          type="button"
          onClick={getCurrentLocation} 
          className="absolute right-2 p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          title="Use current location"
        > 
          <MdOutlineMyLocation />
        </button>

      </div>
 
      {showSuggestions.current && (displaySuggestions.length > 0 ) && (
        <div className="absolute z-10 w-full mt-1 bg-[#686262] border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* {isLoading ? (
            <div className="p-4 text-center text-light">
              Searching...
            </div>
          ) : ( */}
            <>
              {showRecentLabel && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 flex items-center"> 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" width="24" height="24"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>

                  Recent Locations
                </div>
              )}
              
              {displaySuggestions?.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  className="w-full p-3 text-left hover:bg-gray-500 border-b border-gray-100 last:border-b-0 flex items-start"
                  onClick={() => 
                    showRecentLabel 
                      ? handleRecentLocationClick(location)
                      : handleSuggestionClick(location)
                  }
                > 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-light mt-0.5 mr-3 flex-shrink-0" width="24" height="24"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-light truncate">
                      {location?.name?.split(',')[0]}
                    </div>
                    <div className="text-xs text-light truncate">
                      {location?.name?.split(',').slice(1).join(',').trim()}
                    </div>
                  </div>
                </button>
              ))}
            </> 
        </div>
      )}
    </div>
  );
}