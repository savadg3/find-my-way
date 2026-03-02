// import React, { useEffect } from 'react';
// import maplibregl from 'maplibre-gl';  
// import { useSelector } from 'react-redux';
// import { getTypeFromCategory, updatePinPosition } from '../../helpers/projectApi';
// import { useDispatch } from 'react-redux';
// import { fetchPinData } from '../../hooks/useLoadPins';
// import { setPinsByCategory } from '../../../../../store/slices/projectItemSlice';

// const MapMarkers = React.memo(({ geojson }) => { 
//   const map = useSelector(state => state.map.mapContainer);
//   const activeTab = useSelector(state => state.api.activeTab);
//   const allPins = useSelector(state => state.api.allPins);
//   const editingPinId = useSelector(state => state.api.editingPinId);
//   const currentFloor = useSelector(state => state.api.currentFloor);
//   const projectData = useSelector(state => state.api.projectData);
//   const dispatch = useDispatch()
 

//   useEffect(() => {
//     if (!map) return;
     
//     const mapInstance = map 

//     const markers = [];

//     const locationSvgString = `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none">
//         <g>
//             <title>Layer 1</title>
//             <path id="svg_1" fill="#26A3DB" d="m10,0c-5.53061,0 -10,4.32465 -10,9.67615c0,1.56005 0.42857,3.08055 1.08163,4.44315c0.46939,0.9873 1.55102,2.4684 1.81633,2.8238c1.53061,2.0142 7.10204,8.0569 7.10204,8.0569c0,0 5.5918,-6.0427 7.102,-8.0569c0.2653,-0.3554 1.347,-1.8167 1.8164,-2.8238c0.653,-1.3626 1.0816,-2.8831 1.0816,-4.44315c0,-5.3515 -4.4694,-9.67615 -10,-9.67615z"/>
//             <path id="svg_2" fill="white" d="m9.99998,17.7923c4.63242,0 8.38772,-3.6337 8.38772,-8.11613c0,-4.4824 -3.7553,-8.11611 -8.38772,-8.11611c-4.63242,0 -8.38775,3.63371 -8.38775,8.11611c0,4.48243 3.75533,8.11613 8.38775,8.11613z"/>
//             <path id="svg_3" fill="#26A3DB" d="m10,16.331c3.7984,0 6.8776,-2.9795 6.8776,-6.65486c0,-3.67535 -3.0792,-6.65482 -6.8776,-6.65482c-3.79836,0 -6.87755,2.97947 -6.87755,6.65482c0,3.67536 3.07919,6.65486 6.87755,6.65486z"/>
//             <path id="svg_4" fill="white" d="m13.1429,7.80014c1.2623,0 2.2857,-0.99021 2.2857,-2.21169c0,-1.22148 -1.0234,-2.2117 -2.2857,-2.2117c-1.2624,0 -2.2858,0.99022 -2.2858,2.2117c0,1.22148 1.0234,2.21169 2.2858,2.21169z"/>
//         </g>
//     </svg>`;

//     const productSvgString = `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none">
//         <g>
//         <title>Layer 1</title>
//         <path id="svg_1" fill="#F2C538" d="m10,0c-5.52783,0 -10,4.32764 -10,9.67682c0,1.56018 0.42227,3.08318 1.07486,4.43908c0.47985,1.003 1.5547,2.4703 1.82341,2.8232c1.51632,2.0245 7.10173,8.0609 7.10173,8.0609c0,0 5.5854,-6.0364 7.1017,-8.0609c0.2687,-0.3529 1.3436,-1.8202 1.8234,-2.8232c0.6526,-1.3559 1.0749,-2.8789 1.0749,-4.43908c0,-5.34918 -4.4722,-9.67682 -10,-9.67682z"/>
//         <path id="svg_2" fill="white" d="m9.99999,17.7935c4.63241,0 8.38771,-3.634 8.38771,-8.11669c0,-4.48269 -3.7553,-8.11664 -8.38771,-8.11664c-4.63241,0 -8.38772,3.63395 -8.38772,8.11664c0,4.48269 3.75531,8.11669 8.38772,8.11669z"/>
//         <path id="svg_3" fill="#F2C538" d="m10,16.3262c3.795,0 6.8714,-2.9771 6.8714,-6.64938c0,-3.67232 -3.0764,-6.64933 -6.8714,-6.64933c-3.79497,0 -6.8714,2.97701 -6.8714,6.64933c0,3.67228 3.07643,6.64938 6.8714,6.64938z"/>
//         <path id="svg_4" fill="white" d="m10,11.9057c1.2721,0 2.3033,-0.9979 2.3033,-2.22888c0,-1.23094 -1.0312,-2.22882 -2.3033,-2.22882c-1.27206,0 -2.30327,0.99788 -2.30327,2.22882c0,1.23098 1.03121,2.22888 2.30327,2.22888z"/>
//         </g>
//     </svg>`;

//     const beaconSvgString = `<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none">
//         <g>
//             <title>Layer 1</title>
//             <path id="svg_1" fill="#26A3DB" d="m9.95319,0.04415c-0.31035,-0.02209 -0.62066,-0.04415 -0.931,-0.04415c-0.93104,0 -1.83988,0.1325 -2.68225,0.39753c-0.84236,0.26503 -1.64041,0.64051 -2.37194,1.1264c-2.39409,1.61227 -3.968,4.3509 -3.968,7.46502c0,0.35337 0.02216,0.70674 0.0665,1.06015c0,0 0,0.0442 0,0.0662c0.04434,0.3313 0.11088,0.6847 0.17738,1.016c0.0665,0.2871 0.15516,0.5963 0.266,0.8834c0.04433,0.1105 0.08866,0.243 0.133,0.3534c0.02216,0.0662 0.06652,0.1325 0.08868,0.2209c1.39656,3.1803 4.56647,5.411 8.26844,5.411c3.702,0 6.8941,-2.2307 8.2685,-5.411c0.0222,-0.0663 0.0665,-0.1326 0.0887,-0.2209c0.0443,-0.1104 0.0887,-0.2429 0.133,-0.3534c0.0887,-0.2871 0.1995,-0.5742 0.266,-0.8834c0.0887,-0.3313 0.133,-0.6626 0.1773,-0.9939c0,0 0,-0.0441 0,-0.0662c0.0443,-0.35341 0.0665,-0.70677 0.0665,-1.06015c0,-0.3092 0,-0.61843 -0.0443,-0.92763c-0.4212,-4.2405 -3.8128,-7.59753 -8.04682,-8.01717l0.04431,-0.0221z"/>
//             <path id="svg_2" fill="white" d="m9.02202,16.5206c4.17478,0 7.55908,-3.3719 7.55908,-7.53129c0,-4.15942 -3.3843,-7.5313 -7.55908,-7.5313c-4.17479,0 -7.55913,3.37188 -7.55913,7.5313c0,4.15939 3.38434,7.53129 7.55913,7.53129z"/>
//             <path id="svg_3" fill="#26A3DB" d="m9.0223,15.1733c3.428,0 6.2069,-2.7687 6.2069,-6.18406c0,-3.41536 -2.7789,-6.18406 -6.2069,-6.18406c-3.42797,0 -6.20687,2.7687 -6.20687,6.18406c0,3.41536 2.7789,6.18406 6.20687,6.18406z"/>
//             <path id="svg_4" fill="white" d="m11.8594,7.24421c1.1386,0 2.0616,-0.91962 2.0616,-2.05401c0,-1.13438 -0.923,-2.05397 -2.0616,-2.05397c-1.1386,0 -2.06155,0.91959 -2.06155,2.05397c0,1.13439 0.92295,2.05401 2.06155,2.05401z"/>
//         </g>
//     </svg>`;

//     const amenitySvgString = `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none">
//         <g>
//         <title>Layer 1</title>
//         <path id="svg_1" fill="#9440C6" d="m10,20c5.5228,0 10,-4.4772 10,-10c0,-5.52285 -4.4772,-10 -10,-10c-5.52285,0 -10,4.47715 -10,10c0,5.5228 4.47715,10 10,10z"/>
//         <path id="svg_2" fill="#FAFAFA" d="m10.0001,5.1566c0.668,0 1.2108,-0.54278 1.2108,-1.21087c0,-0.66809 -0.5428,-1.21087 -1.2108,-1.21087c-0.66806,0 -1.21088,0.54278 -1.21088,1.21087c0,0.66809 0.54282,1.21087 1.21088,1.21087zm1.2526,0.27141l-2.54701,0c-0.85596,0 -1.52405,0.68894 -1.52405,1.56575l0,3.69524c0,0.7098 1.04386,0.7098 1.04386,0l0,-3.3821l0.25052,0l0,9.2276c0,0.9603 1.39876,0.9394 1.39876,0l0,-5.3654l0.25052,0l0,5.3654c0,0.9394 1.3988,0.9603 1.3988,0l0,-9.2276l0.2505,0l0,3.3821c0,0.7306 1.0438,0.7306 1.0438,0l0,-3.67436c0,-0.79333 -0.6262,-1.58663 -1.5448,-1.58663l-0.0209,0z"/>
//         </g>
//     </svg>`;

//     const saftySvgString = `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none">
//         <g>
//         <title>Layer 1</title>
//         <path id="svg_1" fill="#ED1C24" d="m17.9431,0l-15.88619,0c-1.136,0 -2.05691,0.92091 -2.05691,2.05691l0,15.88619c0,1.136 0.92091,2.0569 2.05691,2.0569l15.88619,0c1.136,0 2.0569,-0.9209 2.0569,-2.0569l0,-15.88619c0,-1.136 -0.9209,-2.05691 -2.0569,-2.05691z"/>
//         <path id="svg_2" fill="white" d="m16.6819,5.33801c0,0 -1.159,2.83535 1.904,4.69799l0,-1.98683c0,0 -0.9727,0.0414 -1.904,-2.71116z"/>
//         <path id="svg_3" fill="white" d="m14.4038,9.08398c0,0 -0.4967,3.70452 4.2013,4.76002l0,-1.9247c0,0 -2.38,-0.1035 -4.2013,-2.83532z"/>
//         <path id="svg_4" fill="white" d="m14.3848,14.8167c0,0 0.0207,3.2492 4.2012,2.8353l0,-1.9247c0,0 -2.3386,0.9313 -4.2012,-0.8899l0,-0.0207z"/>
//         <path id="svg_5" fill="white" d="m16.1844,13.4922c-0.3311,-0.3725 -1.0141,-0.8486 -1.0141,-0.8486c-0.9934,-0.6622 -2.1937,0.1656 -2.1937,0.1656c1.0141,0.2277 1.9454,1.428 2.1316,1.6971c0.0414,0.0621 0.0828,0.1242 0.1449,0.1862c0.3519,0.3726 0.8486,0.5588 1.2004,0.6416c0.3104,0.0621 0.6209,0.0828 0.9106,0.0414c0.8899,-0.1242 1.2004,-0.6416 1.2004,-0.6416c-1.3452,-0.1035 -2.4007,-1.2417 -2.4007,-1.2417l0.0206,0z"/>
//         <path id="svg_6" fill="white" d="m16.0598,7.6145c0,0 -0.0414,-0.10349 -0.0828,-0.16559c-0.8485,-1.57287 -2.0903,-1.24174 -2.0903,-1.24174c0.5795,0.14489 0.7244,0.91061 0.7244,0.91061c0.1035,0.49672 0.269,1.07619 0.269,1.07619c0.1656,0.47602 0.3932,0.952 0.5381,1.22104c0.1242,0.22765 0.2483,0.43463 0.4139,0.62089c1.2004,1.3866 2.7526,0.8278 2.7526,0.8278c-1.2004,-0.3725 -2.3387,-2.81461 -2.5249,-3.2699l0,0.0207z"/>
//         <path id="svg_7" fill="white" d="m7.56082,4.602l-0.47695,0l0,-1.08166l0.87521,0l0.43767,-0.43767l0,-0.65644l-0.43767,-0.43767l-1.09411,0l0,-0.43753l-1.53174,0l0,0.43753l-0.65644,0c-2.84459,1.53178 -3.28226,2.84475 -3.28226,2.84475l0,0.43754l0.65644,0l0,-0.43754c0,0 1.09411,-1.31297 2.18818,-1.53174l0.87534,0l0,1.30043l-0.49562,0c-0.87948,0 -1.59238,0.71306 -1.59238,1.59251l0,12.20539l6.12687,0l0,-12.20536c0,-0.87948 -0.7131,-1.59254 -1.59254,-1.59254z"/>
//         </g>
//     </svg>`;

//     const verticalSvgString = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"none\"> <g> <title>Stairs</title> <path id=\"svg_1\" fill=\"#374046\" d=\"m10,20c5.5228,0 10,-4.4772 10,-10c0,-5.52285 -4.4772,-10 -10,-10c-5.52285,0 -10,4.47715 -10,10c0,5.5228 4.47715,10 10,10z\"/> <path id=\"svg_2\" fill=\"white\" d=\"m16.5959,15.1063l0,-1.4893l-2.9787,0l0,-2.9788l-2.7659,0l0,-2.97868l-2.97877,0l0,-2.76597l-4.25534,0l0,1.70213l2.766,0l0,2.76597l2.76594,0l0,2.97875l2.97867,0l0,2.7659l4.4681,0z\"/> </g> </svg>";

//     const getSvgForCategory = (category) => {
//       const svgMap = {
//         beacon: beaconSvgString,
//         amenity: amenitySvgString,
//         safety: saftySvgString,
//         product: productSvgString,
//         vertical_transport: verticalSvgString,
//         location: locationSvgString,
//       };
//       return svgMap[category] || locationSvgString;
//     };

//     const bringToFront = (marker) => {
//       markers.forEach((m) => {
//         const markerElement = m.getElement();
//         markerElement.style.zIndex = '1000';
//       });

//       const clickedElement = marker.getElement();
//       clickedElement.style.zIndex = '2000';
//     }; 

//     const combinedArray = Object.values(allPins).flat();  
//     combinedArray?.forEach((feature, index) => {
//       const { iconSize, title, location_name, category, subType, enc_id, fp_id, positions } = feature;

//       if(!positions || (currentFloor?.id !== fp_id)
//       ) return
  
//       if (activeTab !== 'all' && category !== activeTab) {
//         return;  
//       } 
//       const isEditing = editingPinId === enc_id;

//       const el = document.createElement('div');
//       el.className = `marker ${category} ${subType || ''}`;
//       el.style.width = `30px`;
//       el.style.height = `30px`;
//       el.style.backgroundImage = `url(data:image/svg+xml;base64,${btoa(
//         getSvgForCategory(category)
//       )})`;
//       el.style.backgroundSize = 'contain';
//       el.style.backgroundRepeat = 'no-repeat';
//       el.style.backgroundPosition = 'center'; 

//       const wrapper = document.createElement('div');
//       el.classList.add('marker-wrapper', 'marker-pop');
//       if(isEditing){
//         el.classList.add('marker-wrapper', 'marker-wobble');
//       }
      
//       if (isEditing) {
//         wrapper.style.padding = '2px';
//         wrapper.style.boxSizing = 'border-box';
//         wrapper.style.border = '2px solid red';
//       } 
      
//       wrapper.appendChild(el);
 

//       if (title && !isEditing) {
       
//         const textEl = document.createElement('div');
//         textEl.textContent = title;
//         textEl.style.position = 'absolute';
//         textEl.style.top = `-30px`;
//         textEl.style.left = '50%';
//         textEl.style.transform = 'translateX(-50%)';
//         textEl.style.backgroundColor = '#ffffffad';
//         textEl.style.padding = '2px 6px';
//         textEl.style.borderRadius = '4px';
//         textEl.style.border = '1px solid #ccc';
//         textEl.style.fontSize = '12px';
//         textEl.style.fontWeight = 'bold';
//         textEl.style.whiteSpace = 'nowrap';
//         textEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
//         textEl.style.zIndex = '1000';
//         textEl.style.color = '#515151';
//         el.appendChild(textEl); 
//       }

//       wrapper.addEventListener('click', (e) => {
//         e.stopPropagation();
//         const clickedMarker = markers[index];
//         bringToFront(clickedMarker);
//       });
//       let {x,y} = JSON.parse(positions) 
//       try {
//         const marker = new maplibregl.Marker({
//           element: wrapper,
//           anchor: 'bottom',
//           draggable: true,
//         })
//           .setLngLat([x,y])
//           .addTo(mapInstance);

//         marker.on('dragstart', () => {
//           bringToFront(marker);
//         });

//         marker.on('dragend', async () => {
//           const { lng, lat } = marker.getLngLat(); 
//           let value = {
//             project_id: projectData?.enc_id,
//             id: feature?.enc_id,
//             type: getTypeFromCategory(category),
//             positions: {x:lng, y:lat},
//             is_published: "0",
//             discard: "1",
//             publish: "1",
//           }; 
//           let updatePins = await updatePinPosition(value)
//           if(updatePins.type){ 
//             let refetchLocation = await fetchPinData(projectData?.enc_id, ['location'])
//             dispatch(
//               setPinsByCategory({
//                   location : refetchLocation?.location
//               }
//             ));
//           }
//         });

//         markers.push(marker);
//       } catch (error) {
//         console.error('Error creating marker:', error);
//       }
//     });

//     return () => {
//       markers.forEach((marker) => {
//         try {
//           marker.remove();
//         } catch (error) {
//           console.error('Error removing marker:', error);
//         }
//       });
//     };
//   }, [map, geojson, activeTab, editingPinId, allPins, currentFloor]);  

//   return null;
// });

// export default MapMarkers;





import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useSelector, useDispatch } from 'react-redux';
import { getTypeFromCategory, updatePinPosition } from '../../helpers/projectApi';
import { fetchPinData } from '../../hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../store/slices/projectItemSlice';

const ICON_REGISTRY = {
  location: {
    width: 20, height: 25,
    svg: `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g>
        <path fill="#26A3DB" d="m10,0c-5.53061,0 -10,4.32465 -10,9.67615c0,1.56005 0.42857,3.08055 1.08163,4.44315c0.46939,0.9873 1.55102,2.4684 1.81633,2.8238c1.53061,2.0142 7.10204,8.0569 7.10204,8.0569c0,0 5.5918,-6.0427 7.102,-8.0569c0.2653,-0.3554 1.347,-1.8167 1.8164,-2.8238c0.653,-1.3626 1.0816,-2.8831 1.0816,-4.44315c0,-5.3515 -4.4694,-9.67615 -10,-9.67615z"/>
        <path fill="white" d="m9.99998,17.7923c4.63242,0 8.38772,-3.6337 8.38772,-8.11613c0,-4.4824 -3.7553,-8.11611 -8.38772,-8.11611c-4.63242,0 -8.38775,3.63371 -8.38775,8.11611c0,4.48243 3.75533,8.11613 8.38775,8.11613z"/>
        <path fill="#26A3DB" d="m10,16.331c3.7984,0 6.8776,-2.9795 6.8776,-6.65486c0,-3.67535 -3.0792,-6.65482 -6.8776,-6.65482c-3.79836,0 -6.87755,2.97947 -6.87755,6.65482c0,3.67536 3.07919,6.65486 6.87755,6.65486z"/>
        <path fill="white" d="m13.1429,7.80014c1.2623,0 2.2857,-0.99021 2.2857,-2.21169c0,-1.22148 -1.0234,-2.2117 -2.2857,-2.2117c-1.2624,0 -2.2858,0.99022 -2.2858,2.2117c0,1.22148 1.0234,2.21169 2.2858,2.21169z"/>
      </g>
    </svg>`,
  },
  product: {
    width: 20, height: 25,
    svg: `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g>
        <path fill="#F2C538" d="m10,0c-5.52783,0 -10,4.32764 -10,9.67682c0,1.56018 0.42227,3.08318 1.07486,4.43908c0.47985,1.003 1.5547,2.4703 1.82341,2.8232c1.51632,2.0245 7.10173,8.0609 7.10173,8.0609c0,0 5.5854,-6.0364 7.1017,-8.0609c0.2687,-0.3529 1.3436,-1.8202 1.8234,-2.8232c0.6526,-1.3559 1.0749,-2.8789 1.0749,-4.43908c0,-5.34918 -4.4722,-9.67682 -10,-9.67682z"/>
        <path fill="white" d="m9.99999,17.7935c4.63241,0 8.38771,-3.634 8.38771,-8.11669c0,-4.48269 -3.7553,-8.11664 -8.38771,-8.11664c-4.63241,0 -8.38772,3.63395 -8.38772,8.11664c0,4.48269 3.75531,8.11669 8.38772,8.11669z"/>
        <path fill="#F2C538" d="m10,16.3262c3.795,0 6.8714,-2.9771 6.8714,-6.64938c0,-3.67232 -3.0764,-6.64933 -6.8714,-6.64933c-3.79497,0 -6.8714,2.97701 -6.8714,6.64933c0,3.67228 3.07643,6.64938 6.8714,6.64938z"/>
        <path fill="white" d="m10,11.9057c1.2721,0 2.3033,-0.9979 2.3033,-2.22888c0,-1.23094 -1.0312,-2.22882 -2.3033,-2.22882c-1.27206,0 -2.30327,0.99788 -2.30327,2.22882c0,1.23098 1.03121,2.22888 2.30327,2.22888z"/>
      </g>
    </svg>`,
  },
  beacon: {
    width: 18, height: 18,
    svg: `<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g>
        <path fill="#26A3DB" d="m9.95319,0.04415c-0.31035,-0.02209 -0.62066,-0.04415 -0.931,-0.04415c-0.93104,0 -1.83988,0.1325 -2.68225,0.39753c-0.84236,0.26503 -1.64041,0.64051 -2.37194,1.1264c-2.39409,1.61227 -3.968,4.3509 -3.968,7.46502c0,0.35337 0.02216,0.70674 0.0665,1.06015c0,0 0,0.0442 0,0.0662c0.04434,0.3313 0.11088,0.6847 0.17738,1.016c0.0665,0.2871 0.15516,0.5963 0.266,0.8834c0.04433,0.1105 0.08866,0.243 0.133,0.3534c0.02216,0.0662 0.06652,0.1325 0.08868,0.2209c1.39656,3.1803 4.56647,5.411 8.26844,5.411c3.702,0 6.8941,-2.2307 8.2685,-5.411c0.0222,-0.0663 0.0665,-0.1326 0.0887,-0.2209c0.0443,-0.1104 0.0887,-0.2429 0.133,-0.3534c0.0887,-0.2871 0.1995,-0.5742 0.266,-0.8834c0.0887,-0.3313 0.133,-0.6626 0.1773,-0.9939c0,0 0,-0.0441 0,-0.0662c0.0443,-0.35341 0.0665,-0.70677 0.0665,-1.06015c0,-0.3092 0,-0.61843 -0.0443,-0.92763c-0.4212,-4.2405 -3.8128,-7.59753 -8.04682,-8.01717z"/>
        <path fill="white" d="m9.0223,15.1733c3.428,0 6.2069,-2.7687 6.2069,-6.18406c0,-3.41536 -2.7789,-6.18406 -6.2069,-6.18406c-3.42797,0 -6.20687,2.7687 -6.20687,6.18406c0,3.41536 2.7789,6.18406 6.20687,6.18406z"/>
        <path fill="#26A3DB" d="m9.0223,15.1733c3.428,0 6.2069,-2.7687 6.2069,-6.18406c0,-3.41536 -2.7789,-6.18406 -6.2069,-6.18406c-3.42797,0 -6.20687,2.7687 -6.20687,6.18406c0,3.41536 2.7789,6.18406 6.20687,6.18406z"/>
        <path fill="white" d="m11.8594,7.24421c1.1386,0 2.0616,-0.91962 2.0616,-2.05401c0,-1.13438 -0.923,-2.05397 -2.0616,-2.05397c-1.1386,0 -2.06155,0.91959 -2.06155,2.05397c0,1.13439 0.92295,2.05401 2.06155,2.05401z"/>
      </g>
    </svg>`,
  },
  amenity: {
    width: 20, height: 20,
    svg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g>
        <path fill="#9440C6" d="m10,20c5.5228,0 10,-4.4772 10,-10c0,-5.52285 -4.4772,-10 -10,-10c-5.52285,0 -10,4.47715 -10,10c0,5.5228 4.47715,10 10,10z"/>
        <path fill="#FAFAFA" d="m10.0001,5.1566c0.668,0 1.2108,-0.54278 1.2108,-1.21087c0,-0.66809 -0.5428,-1.21087 -1.2108,-1.21087c-0.66806,0 -1.21088,0.54278 -1.21088,1.21087c0,0.66809 0.54282,1.21087 1.21088,1.21087zm1.2526,0.27141l-2.54701,0c-0.85596,0 -1.52405,0.68894 -1.52405,1.56575l0,3.69524c0,0.7098 1.04386,0.7098 1.04386,0l0,-3.3821l0.25052,0l0,9.2276c0,0.9603 1.39876,0.9394 1.39876,0l0,-5.3654l0.25052,0l0,5.3654c0,0.9394 1.3988,0.9603 1.3988,0l0,-9.2276l0.2505,0l0,3.3821c0,0.7306 1.0438,0.7306 1.0438,0l0,-3.67436c0,-0.79333 -0.6262,-1.58663 -1.5448,-1.58663z"/>
      </g>
    </svg>`,
  },
  safety: {
    width: 20, height: 20,
    svg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g>
        <path fill="#ED1C24" d="m17.9431,0l-15.88619,0c-1.136,0 -2.05691,0.92091 -2.05691,2.05691l0,15.88619c0,1.136 0.92091,2.0569 2.05691,2.0569l15.88619,0c1.136,0 2.0569,-0.9209 2.0569,-2.0569l0,-15.88619c0,-1.136 -0.9209,-2.05691 -2.0569,-2.05691z"/>
        <path fill="white" d="m7.56082,4.602l-0.47695,0l0,-1.08166l0.87521,0l0.43767,-0.43767l0,-0.65644l-0.43767,-0.43767l-1.09411,0l0,-0.43753l-1.53174,0l0,0.43753l-0.65644,0c-2.84459,1.53178 -3.28226,2.84475 -3.28226,2.84475l0,0.43754l0.65644,0l0,-0.43754c0,0 1.09411,-1.31297 2.18818,-1.53174l0.87534,0l0,1.30043l-0.49562,0c-0.87948,0 -1.59238,0.71306 -1.59238,1.59251l0,12.20539l6.12687,0l0,-12.20536c0,-0.87948 -0.7131,-1.59254 -1.59254,-1.59254z"/>
      </g>
    </svg>`,
  },
  vertical_transport: {
    width: 20, height: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
      <g>
        <path fill="#374046" d="m10,20c5.5228,0 10,-4.4772 10,-10c0,-5.52285 -4.4772,-10 -10,-10c-5.52285,0 -10,4.47715 -10,10c0,5.5228 4.47715,10 10,10z"/>
        <path fill="white" d="m16.5959,15.1063l0,-1.4893l-2.9787,0l0,-2.9788l-2.7659,0l0,-2.97868l-2.97877,0l0,-2.76597l-4.25534,0l0,1.70213l2.766,0l0,2.76597l2.76594,0l0,2.97875l2.97867,0l0,2.7659l4.4681,0z"/>
      </g>
    </svg>`,
  },
}; 

const ICON_URL_CACHE = Object.fromEntries(
  Object.entries(ICON_REGISTRY).map(([category, { svg }]) => [
    category,
    `url(data:image/svg+xml;base64,${btoa(svg)})`,
  ])
);

const getIconUrl = (category) =>
  ICON_URL_CACHE[category] ?? ICON_URL_CACHE.location;

const parsePosition = (positions) => {
  if (!positions) return null;
  try {
    const parsed = typeof positions === 'string' ? JSON.parse(positions) : positions;
    const x = Number(parsed.x);
    const y = Number(parsed.y);
    if (isNaN(x) || isNaN(y)) return null;
    return { x, y };
  } catch {
    return null;
  }
};
 

const createMarkerElement = ({ category, subType, title, isEditing }) => {
  const wrapper = document.createElement('div');
  wrapper.className = `mm-wrapper${isEditing ? ' mm-wrapper--editing' : ''}`;

  const icon = document.createElement('div');
  icon.className = `mm-icon marker-pop ${category} ${subType || ''}`;
  if (isEditing) icon.classList.add('marker-wobble');
  icon.style.backgroundImage = getIconUrl(category);

  if (title && !isEditing) {
    const label = document.createElement('div');
    label.className = 'mm-label';
    label.textContent = title;
    wrapper.appendChild(label);
  }

  wrapper.appendChild(icon);
  return wrapper;
};

const MapMarkers = React.memo(() => {
  const map          = useSelector((s) => s.map.mapContainer);
  const activeTab    = useSelector((s) => s.api.activeTab);
  const allPins      = useSelector((s) => s.api.allPins);
  const editingPinId = useSelector((s) => s.api.editingPinId);
  const currentFloor = useSelector((s) => s.api.currentFloor);
  const projectData  = useSelector((s) => s.api.projectData);
  const dispatch     = useDispatch();

 
  const markerRegistryRef = useRef(new Map());
 
  const visiblePins = useMemo(() => { 
    const flat = Object.values(allPins).flat();
    return flat.filter((pin) => {
      if (!pin?.positions) return false;
      if (pin?.fp_id !== currentFloor?.enc_id) return false;
      if (activeTab !== 'all' && pin?.category !== activeTab) return false;
      return true;
    });
  }, [allPins, activeTab, currentFloor]);

  // console.log({allPins, activeTab, editingPinId, currentFloor, projectData, visiblePins},"asfsdfjsdbf");

 
  const handleDragEnd = useCallback(
    async (marker, feature) => {
      const { lng, lat } = marker.getLngLat();
      const { category, enc_id } = feature;

      const payload = {
        project_id: projectData?.enc_id,
        id: enc_id,
        type: getTypeFromCategory(category),
        positions: { x: lng, y: lat },
        is_published: '0',
        discard: '1',
        publish: '1',
      };

      try {
        const result = await updatePinPosition(payload);
        if (result?.type) { 
          const refetched = await fetchPinData(projectData?.enc_id, [category]);
          if (refetched?.[category]) {
            dispatch(setPinsByCategory({ [category]: refetched[category] }));
          }
        }
      } catch (err) {
        console.error('[MapMarkers] Failed to update pin position:', err);
      }
    },
    [projectData, dispatch]
  );
 
  const bringToFront = useCallback((targetMarker) => {
    markerRegistryRef.current.forEach((m) => {
      m.getElement().style.zIndex = '1000';
    });
    targetMarker.getElement().style.zIndex = '2000';
  }, []);
 
  useEffect(() => {
    if (!map) return; 

    const registry   = markerRegistryRef.current;
    const incomingIds = new Set(visiblePins.map((p) => p.enc_id));
 
    registry.forEach((marker, id) => {
      if (!incomingIds.has(id)) {
        marker.remove();
        registry.delete(id);
      }
    });
 
    visiblePins.forEach((feature) => {
      const { enc_id, category, subType, title, positions } = feature;
 
      if (registry.has(enc_id)) { 
        const existing = registry.get(enc_id);
        const el = existing.getElement();
        const isEditing = editingPinId === enc_id;
        el.className = `mm-wrapper${isEditing ? ' mm-wrapper--editing' : ''}`;
        return;
      }

      const pos = parsePosition(positions);
      if (!pos) {
        console.warn(`Invalid position for pin ${enc_id}:`, positions);
        return;
      }

      const isEditing = editingPinId === enc_id;
      const element   = createMarkerElement({ category, subType, title, isEditing });

      let marker;
      try {
        marker = new maplibregl.Marker({
          element,
          anchor: 'bottom',
          draggable: true,
        })
          .setLngLat([pos.x, pos.y])
          .addTo(map);
      } catch (err) {
        console.error(`Failed to create marker for ${enc_id}:`, err);
        return;
      }

      element.addEventListener('click', (e) => {
        e.stopPropagation();
        bringToFront(marker);
      });

      marker.on('dragstart', () => bringToFront(marker));
      marker.on('dragend', () => handleDragEnd(marker, feature));

      registry.set(enc_id, marker);
    });
 
    return () => {
      registry.forEach((marker) => {
        try { marker.remove(); } catch {}
      });
      registry.clear();
    };
  }, [map, visiblePins, editingPinId, bringToFront, handleDragEnd]);

  return null;
});

MapMarkers.displayName = 'MapMarkers';

export default MapMarkers;

// -----------------------------------------------------------------------------------------------


// import React, { useEffect, useRef, useMemo, useCallback } from 'react';
// import maplibregl from 'maplibre-gl';
// import { useSelector, useDispatch } from 'react-redux';
// import { getTypeFromCategory, updatePinPosition } from '../../helpers/projectApi';
// import { fetchPinData } from '../../hooks/useLoadPins';
// import { setPinsByCategory } from '../../../../../store/slices/projectItemSlice';
 

// const ICON_REGISTRY = {
//   location: {
//     svg: `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none"><g><path fill="#26A3DB" d="m10,0c-5.53061,0 -10,4.32465 -10,9.67615c0,1.56005 0.42857,3.08055 1.08163,4.44315c0.46939,0.9873 1.55102,2.4684 1.81633,2.8238c1.53061,2.0142 7.10204,8.0569 7.10204,8.0569c0,0 5.5918,-6.0427 7.102,-8.0569c0.2653,-0.3554 1.347,-1.8167 1.8164,-2.8238c0.653,-1.3626 1.0816,-2.8831 1.0816,-4.44315c0,-5.3515 -4.4694,-9.67615 -10,-9.67615z"/><path fill="white" d="m9.99998,17.7923c4.63242,0 8.38772,-3.6337 8.38772,-8.11613c0,-4.4824 -3.7553,-8.11611 -8.38772,-8.11611c-4.63242,0 -8.38775,3.63371 -8.38775,8.11611c0,4.48243 3.75533,8.11613 8.38775,8.11613z"/><path fill="#26A3DB" d="m10,16.331c3.7984,0 6.8776,-2.9795 6.8776,-6.65486c0,-3.67535 -3.0792,-6.65482 -6.8776,-6.65482c-3.79836,0 -6.87755,2.97947 -6.87755,6.65482c0,3.67536 3.07919,6.65486 6.87755,6.65486z"/><path fill="white" d="m13.1429,7.80014c1.2623,0 2.2857,-0.99021 2.2857,-2.21169c0,-1.22148 -1.0234,-2.2117 -2.2857,-2.2117c-1.2624,0 -2.2858,0.99022 -2.2858,2.2117c0,1.22148 1.0234,2.21169 2.2858,2.21169z"/></g></svg>`,
//   },
//   product: {
//     svg: `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none"><g><path fill="#F2C538" d="m10,0c-5.52783,0 -10,4.32764 -10,9.67682c0,1.56018 0.42227,3.08318 1.07486,4.43908c0.47985,1.003 1.5547,2.4703 1.82341,2.8232c1.51632,2.0245 7.10173,8.0609 7.10173,8.0609c0,0 5.5854,-6.0364 7.1017,-8.0609c0.2687,-0.3529 1.3436,-1.8202 1.8234,-2.8232c0.6526,-1.3559 1.0749,-2.8789 1.0749,-4.43908c0,-5.34918 -4.4722,-9.67682 -10,-9.67682z"/><path fill="white" d="m9.99999,17.7935c4.63241,0 8.38771,-3.634 8.38771,-8.11669c0,-4.48269 -3.7553,-8.11664 -8.38771,-8.11664c-4.63241,0 -8.38772,3.63395 -8.38772,8.11664c0,4.48269 3.75531,8.11669 8.38772,8.11669z"/><path fill="#F2C538" d="m10,16.3262c3.795,0 6.8714,-2.9771 6.8714,-6.64938c0,-3.67232 -3.0764,-6.64933 -6.8714,-6.64933c-3.79497,0 -6.8714,2.97701 -6.8714,6.64933c0,3.67228 3.07643,6.64938 6.8714,6.64938z"/><path fill="white" d="m10,11.9057c1.2721,0 2.3033,-0.9979 2.3033,-2.22888c0,-1.23094 -1.0312,-2.22882 -2.3033,-2.22882c-1.27206,0 -2.30327,0.99788 -2.30327,2.22882c0,1.23098 1.03121,2.22888 2.30327,2.22888z"/></g></svg>`,
//   },
//   beacon: {
//     svg: `<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none"><g><path fill="#26A3DB" d="m9.95319,0.04415c-0.31035,-0.02209 -0.62066,-0.04415 -0.931,-0.04415c-0.93104,0 -1.83988,0.1325 -2.68225,0.39753c-0.84236,0.26503 -1.64041,0.64051 -2.37194,1.1264c-2.39409,1.61227 -3.968,4.3509 -3.968,7.46502c0,0.35337 0.02216,0.70674 0.0665,1.06015c0,0 0,0.0442 0,0.0662c0.04434,0.3313 0.11088,0.6847 0.17738,1.016c0.0665,0.2871 0.15516,0.5963 0.266,0.8834c0.04433,0.1105 0.08866,0.243 0.133,0.3534c0.02216,0.0662 0.06652,0.1325 0.08868,0.2209c1.39656,3.1803 4.56647,5.411 8.26844,5.411c3.702,0 6.8941,-2.2307 8.2685,-5.411c0.0222,-0.0663 0.0665,-0.1326 0.0887,-0.2209c0.0443,-0.1104 0.0887,-0.2429 0.133,-0.3534c0.0887,-0.2871 0.1995,-0.5742 0.266,-0.8834c0.0887,-0.3313 0.133,-0.6626 0.1773,-0.9939c0,0 0,-0.0441 0,-0.0662c0.0443,-0.35341 0.0665,-0.70677 0.0665,-1.06015c0,-0.3092 0,-0.61843 -0.0443,-0.92763c-0.4212,-4.2405 -3.8128,-7.59753 -8.04682,-8.01717z"/><path fill="white" d="m9.0223,15.1733c3.428,0 6.2069,-2.7687 6.2069,-6.18406c0,-3.41536 -2.7789,-6.18406 -6.2069,-6.18406c-3.42797,0 -6.20687,2.7687 -6.20687,6.18406c0,3.41536 2.7789,6.18406 6.20687,6.18406z"/><path fill="#26A3DB" d="m9.0223,14.1733c3.028,0 5.2069,-2.3687 5.2069,-5.18406c0,-2.91536 -2.1789,-5.18406 -5.2069,-5.18406c-3.02797,0 -5.20687,2.2687 -5.20687,5.18406c0,2.91536 2.1789,5.18406 5.20687,5.18406z"/><path fill="white" d="m11.8594,7.24421c1.1386,0 2.0616,-0.91962 2.0616,-2.05401c0,-1.13438 -0.923,-2.05397 -2.0616,-2.05397c-1.1386,0 -2.06155,0.91959 -2.06155,2.05397c0,1.13439 0.92295,2.05401 2.06155,2.05401z"/></g></svg>`,
//   },
//   amenity: {
//     svg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none"><g><path fill="#9440C6" d="m10,20c5.5228,0 10,-4.4772 10,-10c0,-5.52285 -4.4772,-10 -10,-10c-5.52285,0 -10,4.47715 -10,10c0,5.5228 4.47715,10 10,10z"/><path fill="#FAFAFA" d="m10.0001,5.1566c0.668,0 1.2108,-0.54278 1.2108,-1.21087c0,-0.66809 -0.5428,-1.21087 -1.2108,-1.21087c-0.66806,0 -1.21088,0.54278 -1.21088,1.21087c0,0.66809 0.54282,1.21087 1.21088,1.21087zm1.2526,0.27141l-2.54701,0c-0.85596,0 -1.52405,0.68894 -1.52405,1.56575l0,3.69524c0,0.7098 1.04386,0.7098 1.04386,0l0,-3.3821l0.25052,0l0,9.2276c0,0.9603 1.39876,0.9394 1.39876,0l0,-5.3654l0.25052,0l0,5.3654c0,0.9394 1.3988,0.9603 1.3988,0l0,-9.2276l0.2505,0l0,3.3821c0,0.7306 1.0438,0.7306 1.0438,0l0,-3.67436c0,-0.79333 -0.6262,-1.58663 -1.5448,-1.58663z"/></g></svg>`,
//   },
//   safety: {
//     svg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none"><g><path fill="#ED1C24" d="m17.9431,0l-15.88619,0c-1.136,0 -2.05691,0.92091 -2.05691,2.05691l0,15.88619c0,1.136 0.92091,2.0569 2.05691,2.0569l15.88619,0c1.136,0 2.0569,-0.9209 2.0569,-2.0569l0,-15.88619c0,-1.136 -0.9209,-2.05691 -2.0569,-2.05691z"/><path fill="white" d="m7.56082,4.602l-0.47695,0l0,-1.08166l0.87521,0l0.43767,-0.43767l0,-0.65644l-0.43767,-0.43767l-1.09411,0l0,-0.43753l-1.53174,0l0,0.43753l-0.65644,0c-2.84459,1.53178 -3.28226,2.84475 -3.28226,2.84475l0,0.43754l0.65644,0l0,-0.43754c0,0 1.09411,-1.31297 2.18818,-1.53174l0.87534,0l0,1.30043l-0.49562,0c-0.87948,0 -1.59238,0.71306 -1.59238,1.59251l0,12.20539l6.12687,0l0,-12.20536c0,-0.87948 -0.7131,-1.59254 -1.59254,-1.59254z"/></g></svg>`,
//   },
//   vertical_transport: {
//     svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><g><path fill="#374046" d="m10,20c5.5228,0 10,-4.4772 10,-10c0,-5.52285 -4.4772,-10 -10,-10c-5.52285,0 -10,4.47715 -10,10c0,5.5228 4.47715,10 10,10z"/><path fill="white" d="m16.5959,15.1063l0,-1.4893l-2.9787,0l0,-2.9788l-2.7659,0l0,-2.97868l-2.97877,0l0,-2.76597l-4.25534,0l0,1.70213l2.766,0l0,2.76597l2.76594,0l0,2.97875l2.97867,0l0,2.7659l4.4681,0z"/></g></svg>`,
//   },
// };

// const ICON_URL_CACHE = Object.fromEntries(
//   Object.entries(ICON_REGISTRY).map(([cat, { svg }]) => [
//     cat,
//     `url(data:image/svg+xml;base64,${btoa(svg)})`,
//   ])
// );

// const getIconUrl = (cat) => ICON_URL_CACHE[cat] ?? ICON_URL_CACHE.location;

// const parsePosition = (positions) => {
//   if (!positions) return null;
//   try {
//     const p = typeof positions === 'string' ? JSON.parse(positions) : positions;
//     const x = Number(p.x), y = Number(p.y);
//     return isNaN(x) || isNaN(y) ? null : { x, y };
//   } catch { return null; }
// };

// const jsonEqual = (a, b) => {
//   if (a === b) return true;
//   try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
// };

// const createMarkerElement = ({ category, subType, title }) => {
//   const wrapper = document.createElement('div');
//   wrapper.className = 'mm-wrapper';

//   if (title) {
//     const label = document.createElement('div');
//     label.className = 'mm-label';
//     label.textContent = title;
//     wrapper.appendChild(label);
//   }

//   const icon = document.createElement('div');
//   icon.className = `mm-icon marker-pop ${category} ${subType || ''}`.trim();
//   icon.style.backgroundImage = getIconUrl(category);
//   wrapper.appendChild(icon);

//   return wrapper;
// };
 
// const CHUNK_SIZE = 50;
 

// const MapMarkers = React.memo(() => {
//   const map          = useSelector((s) => s.map.mapContainer);
//   const activeTab    = useSelector((s) => s.api.activeTab);
//   const allPins      = useSelector((s) => s.api.allPins);
//   const editingPinId = useSelector((s) => s.api.editingPinId);
//   const currentFloor = useSelector((s) => s.api.currentFloor);
//   const projectData  = useSelector((s) => s.api.projectData);
//   const dispatch     = useDispatch();
 
//   const registryRef    = useRef(new Map()); 
//   const mapRef         = useRef(null);
//   const projectDataRef = useRef(null);
//   const dispatchRef    = useRef(dispatch);
//   const rafHandleRef   = useRef(null);
//   const prevAllPinsRef = useRef(null); 
 
//   useEffect(() => { 
//     mapRef.current = map;         
//   }, [map]);

//   useEffect(() => { 
//     projectDataRef.current = projectData; 
//   }, [projectData]);

//   useEffect(() => { 
//     dispatchRef.current = dispatch;    
//   }, [dispatch]);
 

//   const bringToFront = useCallback((targetMarker) => {
//     registryRef.current.forEach(({ marker }) => {
//       marker.getElement().style.zIndex = '1000';
//     });
//     targetMarker.getElement().style.zIndex = '2000';
//   }, []);

//   const handleDragEnd = useCallback(async (marker, feature) => {
//     const { lng, lat }       = marker.getLngLat();
//     const { category, enc_id } = feature;
//     const pd = projectDataRef.current;

//     const payload = {
//       project_id:   pd?.enc_id,
//       id:           enc_id,
//       type:         getTypeFromCategory(category),
//       positions:    { x: lng, y: lat },
//       is_published: '0',
//       discard:      '1',
//       publish:      '1',
//     };

//     try {
//       const result = await updatePinPosition(payload);
//       if (result?.type) {
//         const refetched = await fetchPinData(pd?.enc_id, [category]);
//         if (refetched?.[category]) {
//           dispatchRef.current(setPinsByCategory({ [category]: refetched[category] }));
//         }
//       }
//     } catch (err) {
//       console.error('[MapMarkers] dragend failed:', err);
//     }
//   }, []);  

//   const stableAllPins = useMemo(() => {
//     if (jsonEqual(allPins, prevAllPinsRef.current)) return prevAllPinsRef.current;
//     prevAllPinsRef.current = allPins;
//     return allPins;
//   }, [allPins]);
 
//   const visiblePins = useMemo(() => {
//     const flat = Object.values(stableAllPins ?? {}).flat();
//     return flat.filter((pin) => {
//       if (!pin.positions)                                    return false;
//       if (pin.fp_id !== currentFloor?.id)                   return false;
//       if (activeTab !== 'all' && pin.category !== activeTab) return false;
//       return true;
//     });
//   }, [stableAllPins, currentFloor?.id, activeTab]);
 
//   useEffect(() => {
//     if (!map) return; 

//     return () => {
//       if (rafHandleRef.current) cancelAnimationFrame(rafHandleRef.current);
//       registryRef.current.forEach(({ marker }) => {
//         try { marker.remove(); } catch {}
//       });
//       registryRef.current.clear();
//     };
//   }, [map]);

//   useEffect(() => {
//     const currentMap = mapRef.current;
//     if (!currentMap) return;

//     const registry    = registryRef.current;
//     const incomingIds = new Set(visiblePins.map((p) => p.enc_id));
//     registry.forEach(({ marker }, id) => {
//       if (!incomingIds.has(id)) {
//         try { marker.remove(); } catch {}
//         registry.delete(id);
//       }
//     });
 
//     const toAdd = visiblePins.filter((p) => !registry.has(p.enc_id));
//     if (toAdd.length === 0) return;
 
//     if (rafHandleRef.current) cancelAnimationFrame(rafHandleRef.current);

//     let i = 0;
//     const addChunk = () => {
//       const end = Math.min(i + CHUNK_SIZE, toAdd.length);

//       for (; i < end; i++) {
//         const feature = toAdd[i];
//         const { enc_id, category, subType, title, positions } = feature;

//         const pos = parsePosition(positions);
//         if (!pos) {
//           console.warn(`[MapMarkers] Invalid position for pin ${enc_id}`);
//           continue;
//         }

//         const element = createMarkerElement({ category, subType, title });

//         let marker;
//         try {
//           marker = new maplibregl.Marker({ element, anchor: 'bottom', draggable: true })
//             .setLngLat([pos.x, pos.y])
//             .addTo(currentMap);
//         } catch (err) {
//           console.error(`[MapMarkers] Failed to create marker ${enc_id}:`, err);
//           continue;
//         }

//         element.addEventListener('click', (e) => {
//           e.stopPropagation();
//           bringToFront(marker);
//         });

//         marker.on('dragstart', () => bringToFront(marker));
//         marker.on('dragend',   () => handleDragEnd(marker, feature));

//         registry.set(enc_id, { marker, feature });
//       }

//       if (i < toAdd.length) {
//         rafHandleRef.current = requestAnimationFrame(addChunk);
//       } else {
//         rafHandleRef.current = null;
//       }
//     };

//     rafHandleRef.current = requestAnimationFrame(addChunk);
//   }, [visiblePins, bringToFront, handleDragEnd]);
 
//   const prevEditingIdRef = useRef(null);

//   useEffect(() => {

//     const registry = registryRef.current;
//     const prevId   = prevEditingIdRef.current;
 
//     if (prevId) {
//       const entry = registry.get(prevId);
//       if (entry) {
//         const el = entry.marker.getElement();
//         el.className = 'mm-wrapper';
//         el.querySelector('.mm-icon')?.classList.remove('marker-wobble');
//       }
//     }
 
//     if (editingPinId) {
//       const entry = registry.get(editingPinId);
//       if (entry) {
//         const el = entry.marker.getElement();
//         el.className = 'mm-wrapper mm-wrapper--editing';
//         el.querySelector('.mm-icon')?.classList.add('marker-wobble');
//       }
//     }

//     prevEditingIdRef.current = editingPinId;
//   }, [editingPinId]);

//   return null;
// });

// MapMarkers.displayName = 'MapMarkers';
// export default MapMarkers;
