import React,{useEffect} from 'react'
import { useDrag } from 'react-dnd'
import { LocationSvg } from "../CustomSvg";
const LocationPin = ({ active, location, mapDivSize, projectSettings }) => {
 
  const [{ isDragging }, drag] = useDrag(
    
    () => ({
      
      type: 'LOCATION_PIN',
      item: { id: location?.id, left: mapDivSize.width / location?.position?.x, top: mapDivSize.height / location?.position?.y },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [location?.id, location?.position?.x, location?.position?.y],
  )
  return (
    
    <div className='location-pin' style={{ left: mapDivSize.width / location?.position?.x, top: mapDivSize?.height / location?.position?.y ,zIndex:100}} >
      <LocationSvg color={active ? "#26a3db" : location.location_color ?? projectSettings?.ipc ?? "#6A6D73"} />
    </div>
  )
}

export default LocationPin