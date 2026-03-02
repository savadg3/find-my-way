import { getRequest, postRequest } from "../../../../hooks/axiosClient";

const getProduct = async (floorID, id, setProducts, setProductList,) => {
    try {
        const response = await getRequest(`product-list/${id}`);
        const response2 = await getRequest(`product-list/${id}?type=2`);
        let data = response.data ?? [];
        let data2 = response2.data ?? []; 
        if (data2.length > 0) {
            data.forEach(item => {
                if (Array.isArray(item.group_details)) {
                    item.group_details.sort((a, b) => a.display_index - b.display_index);
                }
            });
        }
        data = [...data,...data2] 
        const modifiedData = data.map((el) => ({
            ...el, 
            position: el?.positions ? JSON.parse(el?.positions) : null,
            search_name: `${el?.product_name}${el?.floor_plan ? ` (${el.floor_plan})` : ''}`
        }));
        const currentFloorPins = modifiedData?.filter(
            (item) => floorID == item?.fp_id
        ); 
        setProducts(currentFloorPins);
        setProductList(modifiedData);
    } catch (error) {
        console.log(error);
    }
};

const getLocation = async (floorID, id, setLocations, setLocationList) => {

    try {
        const reqUrl = `list-location/${id}`;
        const response = await getRequest(reqUrl);
        const data = response.data ?? [];
        const modifiedData = data.map((el) => ({
            ...el, 
            position: el?.positions ? JSON.parse(el?.positions) : null,
            search_name: `${el?.location_name} (${el?.floor_plan})`
        }));

        // const currentFloorPins = modifiedData?.filter(
        //     (item) => floorID == item?.fp_id
        // ); 
        // setLocations(currentFloorPins);
        // setLocationList(modifiedData);

        // return {currentFloorPins,modifiedData};
    } catch (error) {
         console.log(error);
    }
};

const getBeacon = async (floorID, id, setBeacons, setBeaconList) => {
    try {
        const response = await getRequest(`list-QrBeacon/${id}`);
        const data = response.data ?? [];
        const modifiedData = data.map((el) => ({
            ...el, 
            position: el?.positions ? JSON.parse(el?.positions) : null,
            search_name: `${el?.beacon_name} (${el?.floor_plan})`
        }));
        const currentFloorPins = modifiedData?.filter(
            (item) => floorID == item?.fp_id
        );
        setBeacons(currentFloorPins);
        setBeaconList(modifiedData);
    } catch (error) {
       console.log(error);
    }
};

const getAmenity = async (floorID, id, setAmenities, setAmenityList) => {
    try {
        const response = await getRequest(`list-amenity/${id}`);
        const data = response.data ?? [];
        const modifiedData = data.map((el) => ({
            ...el, 
            position: el?.positions ? JSON.parse(el?.positions) : null,
            search_name: `${el?.amenity_name} (${el?.floor_plan})`
        }));
        const currentFloorPins = modifiedData?.filter(
            (item) => floorID == item?.fp_id
        );
        setAmenities(currentFloorPins);
        setAmenityList(modifiedData);
    } catch (error) {
         console.log(error);
    }
};

const getSafety = async (floorID, id, setSafeties, setSafetyList) => {
    try {
        const response = await getRequest(`list-safety/${id}`);
        const data = response?.data ?? [];
        const modifiedData = data.map((el) => ({
            ...el, 
            position: el?.positions ? JSON.parse(el?.positions) : null,
            search_name: `${el?.safety_name} (${el?.floor_plan})`
        }));
        const currentFloorPins = modifiedData?.filter(
            (item) => floorID == item?.fp_id
        );
        setSafeties(currentFloorPins);
        setSafetyList(modifiedData);
    } catch (error) {
         console.log(error);
    }
};

const getVerticalTransport = async (floorID, setVerticalTransportlist) => {
    try {
        const response = await getRequest(`list-vTransport/${floorID}`);
        const data = response.data ?? [];
        const modifiedData = data.map((el) => ({
            ...el,
            position: el?.positions ? JSON.parse(el?.positions) : ""
        })); 
        setVerticalTransportlist(modifiedData);
    } catch (error) {
         console.log(error);
    }
};

const getVerticalTransportCurrentFloor = async (id, setVerticalTransports) => {
    try {
        const response = await getRequest(`floor-plan/${id}`);
        const data = response.data ?? [];
        const modifiedData = data?.vertical_transports?.map((el) => ({
            ...el,
            position: el?.positions ? JSON.parse(el?.positions) : "",
        }));
        setVerticalTransports(modifiedData);

    } catch (error) {
         console.log(error);
    }
};

const getAdvertisement = async (id, setAdList) => {
    try {
        const response = await getRequest(`advertisement-list/${id}`);
        const data = response?.data?.data ?? [];
        setAdList(data);
    } catch (error) {
         console.log(error);
    }
};

const getTraversablePins = async (id, setDropValues) => {
    try {
        const response = await getRequest(`project-navigation/${id}`);
        const data = response.data ?? [];
        // const pins = data?.destinations?.map((item) => ({
        //     // ...item,
        //     // id: item?.type == 6 ? `${item?.vt_name} - ${item?.floor_plan}` : `${item?.name} - ${item?.floor_plan}`,
        //     id: item?.type == 6 ? item?.vtd_id : item?.enc_id,
        //     label: `${item?.name} - ${item?.floor_plan}`,
        //     name:
        //         item?.type == 1
        //             ? "location"
        //             : item?.type == 2
        //                 ? "product"
        //                 : item?.type == 3
        //                     ? "beacon"
        //                     : item?.type == 4
        //                         ? "amenity"
        //                         : item?.type == 5
        //                             ? "safety"
        //                             : item?.type == 6
        //                                 ? "vertical"
        //                                 : undefined,
        //     enc_id: item?.type == 6 ? item?.vtd_id : item?.enc_id,
        //     // value: item?.type == 6 ? `${item?.vt_name} - ${item?.floor_plan}` : `${item?.name} - ${item?.floor_plan}`,
        //     value: item?.type == 6 ? item?.vtd_id : item?.enc_id,
        //     floorplan_id: item?.floorplan_id
        // }));
        
        const pins = data?.destinations?.map((item) => {
            const isChild = !!item?.product_id;
            const parent = isChild
                ? data?.destinations?.find((itm) => itm?.enc_id === item?.product_id)
                : item;

            const returnValue = isChild
                ? { ...parent, name: item?.name, product_id: item?.product_id, id: item?.enc_id }
                : item;

            const typeNameMap = {
                1: "location",
                2: "product",
                3: "beacon",
                4: "amenity",
                5: "safety",
                6: "vertical"
            };

            const isVertical = returnValue?.type === 6;
            const id = isVertical ? returnValue?.vtd_id : returnValue?.enc_id;

            const returnItem = {
                id,
                label: `${returnValue?.name} - ${isChild ? "(" + parent?.name + ")" : returnValue?.floor_plan}`,
                // label: `${returnValue?.name} - ${returnValue?.floor_plan}`,
                name: typeNameMap[returnValue?.type],
                enc_id: id,
                value: id,
                floorplan_id: returnValue?.floorplan_id,
                product_id: returnValue?.product_id || null,
                ...(isChild && { pin_id: item?.enc_id })
            };

            return returnItem;
        });

        setDropValues(pins);
    } catch (error) {
        console.log(error);
    }
};

const getAmenityIconDropDown = async (id, setAminityIcons) => {
    let value = {
        id: id,
        type: 1
    };
    try {
        const reqUrl = `dropdown-icons`;
        const response = await postRequest(reqUrl, value);
        const data = response.response?.data ?? [];
        if (response.type === 1) {
            setAminityIcons(data);
        }
    } catch (error) {
         console.log(error);
    }
};

const getSafetyIconDropDown = async (id, setSafetyIcons) => {
    let value = {
        id: id,
        type: 2
    };
    try {
        const reqUrl = `dropdown-icons`;
        const response = await postRequest(reqUrl, value);
        const data = response.response?.data ?? [];
        if (response.type === 1) {
            setSafetyIcons(data);
        }
    } catch (error) {
         console.log(error);
    }
};

const getVerticalTransportIconDropDown = async (id, setVerticalIcons) => {
    let value = {
        id: id,
        type: 3
    };
    try {
        const reqUrl = `dropdown-icons`;
        const response = await postRequest(reqUrl, value);
        const data = response.response?.data ?? [];
        if (response.type === 1) {
            setVerticalIcons(data);
        }
    } catch (error) {
        console.log(error);
    }
};

const getFloors = async (id, setFloorPlans, setFloorPlansPathSort) => {
    try {
        const response = await getRequest(`list-floor-plan/${id}`);
        const data = response.data ?? [];
        setFloorPlans(data);
        setFloorPlansPathSort(data)

    } catch (error) {
         console.log(error);
    }
};

export {
    getProduct,
    getLocation,
    getBeacon,
    getAmenity,
    getSafety,
    getVerticalTransport,
    getAdvertisement,
    getTraversablePins,
    getAmenityIconDropDown,
    getSafetyIconDropDown,
    getVerticalTransportIconDropDown,
    getFloors,

    getVerticalTransportCurrentFloor
}