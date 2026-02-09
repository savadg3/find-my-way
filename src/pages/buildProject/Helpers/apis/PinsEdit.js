import moment from "moment";
import { environmentaldatas } from "../../../../constant/defaultValues";
import { getRequest } from "../../../../hooks/axiosClient";
import { getSafetyIconDropDown, getVerticalTransportIconDropDown } from "./getPins";
import { dayMap } from "../constants/constant";
const { image_url } = environmentaldatas;


const editLocation = async (location, setAddNewLocation, setPromotions, setIsBoundary, setSelLocationDtls,setwebsiteLinks, setHours, type) => {
    try {
        const reqUrl = `location/${location.enc_id}`;
        const response = await getRequest(reqUrl);
        const data = response.data ?? [];

        setAddNewLocation(true);
        let promotionData = data.promotions ? JSON.parse(data.promotions) : [];
        promotionData?.forEach((el) => {
            el.image_path = el.image_path ? image_url + el.image_path : null;
            el.start_date = el.start_date ? moment(el.start_date).toDate() : "";
            el.end_date = el.end_date ? moment(el.end_date).toDate() : "";
        });
        setPromotions(promotionData);

        const webArray = data?.website
            ? safeParse(data?.website)
            : []; 
        const filteredWebArray = Array.isArray(webArray) ? webArray : [...webArray]; 
        const weblink = data?.website ? filteredWebArray : [];

        let prefillData = {
            ...data,
            position: data.positions ? JSON.parse(data.positions) : null,
            tags: data.tags ? JSON.parse(data.tags) : [],
            boundary_attributes:
                data.boundary_attributes && data.boundary_attributes != "null"
                    ? JSON.parse(data.boundary_attributes)
                    : null,
        
            // firstClick: { location: data.positions ? JSON.parse(data.positions) : [] },
        };
        const converted = {};
        Object.keys(dayMap).forEach((day) => {
            const isOpen = data[`${day}_open`] == 1;
            if (isOpen) {
                const dayPrefix = dayMap[day];
                0;
                const from = data[`${day}_start`];
                const to = data[`${day}_end`];
                converted[dayPrefix] = { from, to };
            }
        });
        if (!type) {
            setIsBoundary(prefillData?.boundary_color ? true : false);
        }

        setSelLocationDtls(prefillData);
        setwebsiteLinks(weblink);
 
        setHours(converted ?? {});

    } catch (error) {
        //////// console.log(error);
    }
};

const editProduct = async (row, setAddNewProduct, setImages, setSpecifications, setwebsiteLinks, setSelProductDtls, type = false) => {
    try {
        let id = row?.enc_id ?? row?.id

        console.log("editProduct");

        let response;

        if (type == 'subpin') {
            response = await getRequest(`group-product/${id}`);
        } else {
            response = await getRequest(`product/${id}`);
        }

        const data = response.data ?? [];
        const specArray = data?.specifications
            ? JSON.parse(data?.specifications)
            : []; 
            
        const filteredSpecificationsArray = specArray;
        const TagsArray = JSON.parse(data?.tags);
        const specification = data?.specifications ? filteredSpecificationsArray : [];
            
        
        const webArray = data?.website
            ? safeParse(data?.website)
            : []; 
        const filteredWebArray = Array.isArray(webArray) ? webArray : [...webArray];
        const weblink = data?.website ? filteredWebArray : [];
        
        const positions = data?.positions ? JSON.parse(data?.positions) : null;

        const imageUrlArray = data?.image_path
            ? data?.image_path?.map((item) => image_url + item)
            : [];
        
        let uniqueImages = imageUrlArray.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        let values = {
            ...data,
            tags: TagsArray === null ? [] : TagsArray,
            position: positions
        }; 

        if (values?.name) {
            values = {
                ...values,
                product_name:values.name
            }
        }

        setAddNewProduct(true);
        setImages(uniqueImages);
        setSpecifications(specification);
        setwebsiteLinks(weblink);

        console.log(values, 'modifiedData')
        setTimeout(() => {
            setSelProductDtls(values);
        }, 1000);
    } catch (error) {
        console.log(error);
    }
};

const editBeacon = async (row, setSelBeaconDtls, setAddNewQrCodeBeacon) => {
    try {
        const response = await getRequest(`qr-beacon/${row?.enc_id}`);
        const data = response.data ?? [];
        // const positions = data?.positions ? JSON.parse(data?.positions) : "";
        const positions = data?.positions ? JSON.parse(data?.positions) : null;
        let values = {
            ...data,
            position: positions,
            message: data?.message
        };
        console.log(values, 'values')
        setSelBeaconDtls(values);
        setAddNewQrCodeBeacon(true);
    } catch (error) {
        //// console.log(error);
    }
};

const editAmenity = async (row, setAddNewAmenity, setSelAmenityDtls) => {
    try {
        const response = await getRequest(`amenity/${row?.enc_id}`);
        const data = response.data ?? [];
        // const positions = data?.positions ? JSON.parse(data?.positions) : "";
        const positions = data?.positions ? JSON.parse(data?.positions) : null;
        let values = {
            ...data,
            position: positions,
            icon: data?.icon_id
            // icon: iconID?.enc_id
        };
        console.log(values, 'values')
        setAddNewAmenity(true);
        setSelAmenityDtls(values);
    } catch (error) {
        //// console.log(error);
    }
};

const editSafety = async (row, setSafetyIcons, setAddNewSafety, setSelSafetyDtls) => {
    try {
        const response = await getRequest(`safety/${row?.enc_id}`);
        const data = response.data ?? [];
        getSafetyIconDropDown(data?.enc_icon, setSafetyIcons);
        // const positions = data?.positions ? JSON.parse(data?.positions) : "";
        const positions = data?.positions ? JSON.parse(data?.positions) : null;
        let values = {
            ...data,
            position: positions,
            icon: data?.icon_id
        };
        setAddNewSafety(true);
        setSelSafetyDtls(values);
        // handleEnableDisable();
    } catch (error) {
        //// console.log(error);
    }
};

const editVerticaltransport = async (row, setVerticalIcons, setAddNewVertical, setselVerticalDtls, handleEnableDisable, type) => {
    try {
        const response = await getRequest(`vertical-transport/${row?.enc_id}`);
        const data = response.data ?? [];

        getVerticalTransportIconDropDown(data?.enc_icon, setVerticalIcons);
        const positions = data?.positions ? JSON.parse(data?.positions) : "";
        let values = {
            ...data,
            icon_id: data?.enc_icon,
            icon: data?.enc_icon,
            icon_path: data?.path,
            position: positions,
            is_wheelchair: data?.is_wheelchair == 1 ? true : false,
            connectionPins: data?.transport_details?.map((item) => ({
                id: item?.enc_id,
                value: item?.fp_id,
                label: item?.floor_plan,
                position: JSON.parse(item?.positions)
            }))
        };
        if (!type) {
            console.log(values, "vertical-open");
            setAddNewVertical(true);
            setselVerticalDtls(values);
        }
        // setselVerticalDtls(values);
        handleEnableDisable();
    } catch (error) {
        //// console.log(error);
    }
};

const editAd = async (row, setAddNewAd, setSelAd) => {
    try {
        const response = await getRequest(`advertisements/${row?.enc_id}`);
        const data = response.data?.data ?? [];
        let values = {
            ...data,
            start_date: moment(data?.start_date).toDate(),
            end_date: data?.end_date ? moment(data?.end_date).toDate() : '',
            ad_image: data?.ad_image ? image_url + data?.ad_image : null,
            ad_type: data?.link == null ? 2 : 1,
            type_id: data?.location_id !== null ? data?.location_id : data?.product_id
        };
        // console.log(values, "ad edit");
        setAddNewAd(true);
        setSelAd(values);
        // handleEnableDisable();
    } catch (error) {
        //// console.log(error);
    }
};

const handleTraversibleData = (floorPlanDtls, graph, setSelTraversibleDetails, findShortestPath, renderTraversiblePaths, selTraversibleDetails, type, vt_Value) => {
    // console.log(floorPlanDtls,'floorPlanDtls')
    if (!floorPlanDtls) {
        graph.restoreEdges();
        graph.restoreNodes();
        graph.restoreHighlightNode();
        graph.restorePositions();

        graph.restoreSubnode()
        graph.restoreConnectedMainPathNodes()
        return

    }

    if (floorPlanDtls.edges_data) {
        const edges = JSON.parse(floorPlanDtls.edges_data);
        if (edges?.length === 0) {
            graph.restoreEdges();
            graph.restoreNodes();
            graph.restoreHighlightNode();
        } else {
            graph.restoreEdges(edges);
            const nodeFromAPI = Object.keys(edges);
            nodeFromAPI?.forEach((n) => {
                graph.addNode(n);
            });
        }
    } else {
        graph.restoreEdges();
        graph.restoreNodes()
        graph.restoreHighlightNode()
    }

    if (floorPlanDtls.points_data) {
        const points = JSON.parse(floorPlanDtls.points_data);
        if (points?.length === 0) {
            graph.restorePositions();
        } else {
            graph.restorePositions(points);
        }
    } else {
        graph.restorePositions();
    }

    if (floorPlanDtls.highlight_data) {
        const node = JSON.parse(floorPlanDtls.highlight_data);
        if (node?.length === 0) {
            graph.restoreHighlightNode();
        } else {
            graph.restoreHighlightNode(node);
        }
    } else {
        graph.restoreHighlightNode();
    }

    if (floorPlanDtls.sub_node) {
        const node = JSON.parse(floorPlanDtls.sub_node);
        if (node?.length === 0) {
            graph.restoreSubnode();
        } else {
            graph.restoreSubnode(node);
        }
    } else {
        graph.restoreSubnode();
    }
    
    if (floorPlanDtls.connected_nodes) {
        const node = JSON.parse(floorPlanDtls.connected_nodes);
        if (node?.length === 0) {
            graph.restoreConnectedMainPathNodes();
        } else {
            graph.restoreConnectedMainPathNodes(node);
        }
    } else {
        graph.restoreConnectedMainPathNodes();
    }

    if (floorPlanDtls.auto_connected_nodes) {
        const node = JSON.parse(floorPlanDtls.auto_connected_nodes);
        if (node?.length === 0) {
            graph.restoreAutoConnectNode();
        } else {
            graph.restoreAutoConnectNode(node);
        }
    } else {
        graph.restoreAutoConnectNode();
    }

    if (type == "switchFloor") {
        setSelTraversibleDetails((prev) => ({
            ...prev,
            edges_data: graph.getEdges(),
            points_data: graph.getPositions()
        }));
        setTimeout(() => {
            findShortestPath(
                vt_Value,
                selTraversibleDetails?.to,
                graph,
                graph.getPositions()
            );
        }, 1000);
    } else if (setSelTraversibleDetails) {
        setSelTraversibleDetails((prev) => ({
            ...prev,
            edges_data: graph.getEdges(),
            points_data: graph.getPositions()
        }));
    }
    
    if (renderTraversiblePaths) {
        renderTraversiblePaths();
    }
};

export function safeParse(value) {
  if (value == null) return null;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export {
    editProduct,
    editBeacon,
    editAmenity,
    editSafety,
    editVerticaltransport,
    editAd,
    editLocation,
    handleTraversibleData
};