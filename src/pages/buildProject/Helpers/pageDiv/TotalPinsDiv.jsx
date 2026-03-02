import { useSelector } from "react-redux";

const TotalPinsDiv = ({ activeTab, totalPinsUsed, projectSettings, addNewFloor }) => {
    const pinCount  = useSelector(state => state.api.pinCount); 
    const projectData  = useSelector(state => state.api.projectData); 

    let locationColor = projectData?.location_color ?? "#320101";
    let productColor = projectData?.product_color ?? "#320101";

    let locationIcon = `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none">

    <g>
     <title>Location</title>
     <path id="svg_1" fill="${locationColor}" d="m10,0c-5.53061,0 -10,4.32465 -10,9.67615c0,1.56005 0.42857,3.08055 1.08163,4.44315c0.46939,0.9873 1.55102,2.4684 1.81633,2.8238c1.53061,2.0142 7.10204,8.0569 7.10204,8.0569c0,0 5.5918,-6.0427 7.102,-8.0569c0.2653,-0.3554 1.347,-1.8167 1.8164,-2.8238c0.653,-1.3626 1.0816,-2.8831 1.0816,-4.44315c0,-5.3515 -4.4694,-9.67615 -10,-9.67615z"/>
     <path id="svg_2" fill="white" d="m9.99998,17.7923c4.63242,0 8.38772,-3.6337 8.38772,-8.11613c0,-4.4824 -3.7553,-8.11611 -8.38772,-8.11611c-4.63242,0 -8.38775,3.63371 -8.38775,8.11611c0,4.48243 3.75533,8.11613 8.38775,8.11613z"/>
     <path id="svg_3" fill="${locationColor}" d="m10,16.331c3.7984,0 6.8776,-2.9795 6.8776,-6.65486c0,-3.67535 -3.0792,-6.65482 -6.8776,-6.65482c-3.79836,0 -6.87755,2.97947 -6.87755,6.65482c0,3.67536 3.07919,6.65486 6.87755,6.65486z"/>
     <path id="svg_4" fill="white" d="m13.1429,7.80014c1.2623,0 2.2857,-0.99021 2.2857,-2.21169c0,-1.22148 -1.0234,-2.2117 -2.2857,-2.2117c-1.2624,0 -2.2858,0.99022 -2.2858,2.2117c0,1.22148 1.0234,2.21169 2.2858,2.21169z"/>
    </g>
   </svg>`;
    let productIcon = `<svg width="20" height="25" xmlns="http://www.w3.org/2000/svg" fill="none">

    <g>
     <title>Product</title>
     <path id="svg_1" fill="${productColor}" d="m10,0c-5.52783,0 -10,4.32764 -10,9.67682c0,1.56018 0.42227,3.08318 1.07486,4.43908c0.47985,1.003 1.5547,2.4703 1.82341,2.8232c1.51632,2.0245 7.10173,8.0609 7.10173,8.0609c0,0 5.5854,-6.0364 7.1017,-8.0609c0.2687,-0.3529 1.3436,-1.8202 1.8234,-2.8232c0.6526,-1.3559 1.0749,-2.8789 1.0749,-4.43908c0,-5.34918 -4.4722,-9.67682 -10,-9.67682z"/>
     <path id="svg_2" fill="white" d="m9.99999,17.7935c4.63241,0 8.38771,-3.634 8.38771,-8.11669c0,-4.48269 -3.7553,-8.11664 -8.38771,-8.11664c-4.63241,0 -8.38772,3.63395 -8.38772,8.11664c0,4.48269 3.75531,8.11669 8.38772,8.11669z"/>
     <path id="svg_3" fill="${productColor}" d="m10,16.3262c3.795,0 6.8714,-2.9771 6.8714,-6.64938c0,-3.67232 -3.0764,-6.64933 -6.8714,-6.64933c-3.79497,0 -6.8714,2.97701 -6.8714,6.64933c0,3.67228 3.07643,6.64938 6.8714,6.64938z"/>
     <path id="svg_4" fill="white" d="m10,11.9057c1.2721,0 2.3033,-0.9979 2.3033,-2.22888c0,-1.23094 -1.0312,-2.22882 -2.3033,-2.22882c-1.27206,0 -2.30327,0.99788 -2.30327,2.22882c0,1.23098 1.03121,2.22888 2.30327,2.22888z"/>
    </g>
   </svg>`;
    return (
        <div
            className={`total-pin-div ${activeTab === "floorDetails" && addNewFloor && "pin-div-adjust"
                }`}
        >
            <div
                className="icon"
                dangerouslySetInnerHTML={{ __html: locationIcon }}
            ></div>
            <p className="label  ml-1 vertical-line-pindiv">
                {pinCount?.used_locations ?? 0} /{" "}
                {pinCount?.total_locations}{" "}
            </p>
            <div
                className="icon ml-2"
                dangerouslySetInnerHTML={{ __html: productIcon }}
            ></div>
            <p className="label  ml-1 ">
                {pinCount?.used_products ?? 0} / {pinCount?.total_products}{" "}
            </p>
        </div>
    );
};

export default TotalPinsDiv;