import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import BPCommonSideBar from "./components/BPCommonSideBar";
import FloorPlanDtlsBar from "./components/FloorPlanDtlsBar";
import PSSideBar from "./components/PSSideBar";
import { Button, Modal, ModalBody, Spinner, UncontrolledTooltip } from "reactstrap";
import * as Yup from "yup";
import FloorPlanDtls from "./components/FloorPlanDtls";
import "./BuildProject.css";
import LocationsSideBar from "./components/LocationsSideBar";
import CustomSelect from "../../components/constants/CustomSelect";
import ProductSideBar from "./components/ProductSideBar";
import QrcodeBeaconSideBar from "./components/QrCodeBeaconSideBar";
import TraversableSideBar from "./components/TraversablePathDtlsBar";
import TraversablePathTools from "./components/TraversablePathTools";
import AmenitySideBar from "./components/AmenitySideBar";
import SafetySideBar from "./components/safetySideBar";
import VerticalTransportSideBar from "./components/VerticalTransportSideBar";
import VerticalTransportModal from "./components/VerticalTransportModal";
import AdvertisementSideBar from "./components/AdvertisementSidebar";
import { ChangeSvgColorPassingBE } from "./CustomSvg";
import { useDrop } from "react-dnd";
import { postRequest, getRequest, getRequestForFile } from "../../hooks/axiosClient";
import { fabric } from "fabric";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { environmentaldatas } from "../../constant/defaultValues";
import { MdPanTool } from "react-icons/md";
import { getCurrentUser, decode } from "../../helpers/utils";
import FontFaceObserver from "fontfaceobserver";
import { standardFontSize, standardFonts } from "../../components/constants/standardFonts";
const { image_url } = environmentaldatas;
import PaymentForm from "../../components/stripe/payment";
import Pencil from "../../assets/icons/pencil.png";
import Eraser from "../../assets/icons/erase-cursor-large.svg";

import { getVerticalOrHorizontalMove } from "./Helpers/getVerticalOrHorizontalMove";
import createCornerPoint from "./Helpers/createCornerPoint";
import {
  bringFabricObjectsToFrontByName,
  bringToFrontPinNameNodes,
  sendToBackObjects,
  removeFabricObjectsByName,
  removeFabricObjectsBId,
  HoverCursorChanger,
  changeSelectionAllObjs,
  changeFabricObjectSelectionByName,
  removeFabricObjectsEncId,
  reinitializeFabricCanvas,
  changePropertyById,
  getFabricObject,
  findObjectById,
  changeSelectionById,
  findPinNameGroup,
  findObjectByEnc_id,
} from "./Helpers/bringFabricObjects";
import {
  navigationPathZoomLevel,
  tracingLengthZoomLevel,
} from "./Helpers/tracingLengthZoomLevel";
import {
  calculateDistance,
  isInsideRadius,
  getPolygonVertices,
  getSquareCoordinates,
  getObjectSizeWithStroke,
  hexToRgb,
  normalizeValue,
  scaleVertices,
  getRectangleVertices,
  removeDuplicatePoints,
  getTypeByName,
  // lineToPolygon,
  getLineVertices,
  adjustPositionIfNeeded
} from "./Helpers/calculateDistance";
import { updateText, updateTracing, updateTracingCircle } from "./Helpers/updateText&Tracing";
import { anchorWrapper } from "./Helpers/anchorWrapper";
import {
  getAmenityPin,
  getBeaconPin,
  getLocationPin,
  getProductPin,
  getSafetyPin,
  getVerticalPin,
} from "./Helpers/getPinIcons";
import addPins from "./Helpers/addPins";
import generateNodeName from "./Helpers/generateNodeName";
import drawLine from "./Helpers/drawLine";
import addConnectionBtwnEdges from "./Helpers/addConnectionBtwnEdges";
import { removeLine, removeNode } from "./Helpers/removeLine&Node";
import nodePositionUpdate from "./Helpers/nodePositionUpdate";
import handleCursor from "./Helpers/handleCursor";
import controllPan from "./Helpers/controllPan";
import {  dragNodeOnMainPath } from "./Helpers/dragNodeAndItsPath";
// import  dragNodeOnMainPath  from './Helpers/movePath';
import handleMouseWheel, { triggerMouseWheelManually } from "./Helpers/handleMouseWheel";
import { checkPinConnection, renderAmenity, renderBeacon, renderLocation, renderProduct, renderSafetie, renderText, renderTracing, renderTracingCircle, renderTraversiblePath, renderVT } from "./Helpers/renderObjs";
import initCanvas from "./Helpers/canvas/initCanvas";
import { addNodePoint, addPolyLine } from "./Helpers/addNodeOrLine";
import {
  dayMap,
  initialValues,
  objPinNames,
  objPinNamesOnly,
} from "./Helpers/constants/constant";
import {
  getAdvertisement,
  getAmenity,
  getBeacon,
  getFloors,
  getLocation,
  getProduct,
  getSafety,
  getSafetyIconDropDown,
  getTraversablePins,
  getVerticalTransport,
  getVerticalTransportCurrentFloor,
  getVerticalTransportIconDropDown,
} from "./Helpers/apis/getPins";
import {
  EnableDisable,
  discardClick,
  publishClick,
  revertPackage,
  totalPinCountApi,
  uploadTraversibleData,
} from "./Helpers/apis/otherApis";
import TotalPinsDiv from "./Helpers/pageDiv/TotalPinsDiv";
import deleteObjects from "./Helpers/deleteSelectedObjects";
import showObjLength from "./Helpers/fabric/showObjLength";
import {
  updateAmenityPin,
  updateBeaconPin,
  updateProductPin,
  updateSafetyPin,
  updateVerticalPin,
} from "./Helpers/updatePins";
import {
  editAd,
  editAmenity,
  editBeacon,
  editLocation,
  editProduct,
  editSafety,
  editVerticaltransport,
  handleTraversibleData,
} from "./Helpers/apis/PinsEdit";
import canvasBGimage from "./Helpers/canvas/canvasBGimage";
import canvasBackGroundColor from "./Helpers/canvas/canvasBGcolor";
import { dijkstra } from "./Helpers/algorithm/dijkstra";
import { dijkstraWithLength } from "./Helpers/algorithm/dijkstraWithLength";
import highligthNodes from "./Helpers/pathComponent/highligthNodes";
import pathLine from "./Helpers/pathComponent/pathLines";
import { onSelectVT } from "./Helpers/pathCalculations/checkPathCalculation";
import EditProjectModal from "./Helpers/pageDiv/editProjectNameModal";
import ProjectHeaderDiv from "./Helpers/pageDiv/headerDiv";
import CanvasDiv from "./Helpers/pageDiv/canvasDiv";
import Graph from "./Helpers/pathCalculations/graph";
import {
  highLightSelectedPaths,
  nodeLinesSelected,
} from "./Helpers/pathComponent/highLightSelectedPaths";
import { removeEmptyNode } from "./Helpers/removeEmptyNodes";
import ReferenceImageModal from "./Helpers/modal/ReferenceImageModal";
import moment from "moment";
import { map } from "lodash";
import ShortestpathModal from "./Helpers/modal/ShortestpathModal";
import Overlay from "./Helpers/pageDiv/Overlay";
import { IoMdClose } from "react-icons/io";
import { RiRestartLine } from "react-icons/ri";
import { IoImageOutline } from "react-icons/io5";
import MapComponent from "../../components/map/components/Map";
import LocationMapComponent from "../../components/map/components/ChooseLocationMap";
import NewComponent from "./NewComponent";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux"; 
import { useLoadPins } from "../../components/map/components/hooks/useLoadPins";
import { PinCountApi } from "../../components/map/components/helpers/projectApi";
import { setCurrentFloor, setFloorList, setPinCount, setProjectData } from "../../store/slices/projectItemSlice";

var obj,
  polyline,
  polyObj,
  mouseDown = false,
  mouseDown2 = false,
  mouseDownShape = false,
  mouseDownSelect = false,
  pts = [],
  lastPt = 1,
  originalObjCenterPoints,
  polyBtn,
  poly = false,
  bgColor,
  id = -1,
  draggingCanvas = false,
  lastPosX = 0,
  lastPosY = 0,
  key1,
  key2,
  lastTraversibleUndoIndex,
  activeText;
//------------------- restric subpath drawing -------------------
let nodeNameArray = []
let nodeTypeArray = []
//------------------- restric subpath drawing -------------------
let boundaryAttributes;
let drawingLine;
let prevSelectedBoundary;
let prevMouseClick;
let viewportTransform;
const graph = new Graph();
const ViewFloor = () => {
  let { id } = useParams();
  id = id && decode(id);

  let isEnterKey = false;

  let firstClick = {
    location: { x: null, y: null },
    verticalTransport: { x: null, y: null },
    safety: { x: null, y: null },
    amenity: { x: null, y: null },
    beacon: { x: null, y: null },
    product: { x: null, y: null },
  };

  const canvas = useRef(null);
  const canvasContainerRef = useRef(null);
  const dispatch = useDispatch()

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [isEdit, setIsEdit] = useState(false);
  const [selFloorPlanDtls, setSelFloorPlanDtls] = useState();
  const [floorPlans, setFloorPlans] = useState([]);
  const [floorPlansPathSort, setFloorPlansPathSort] = useState([]);
  const [floorPlanSelect, setFloorPlanSelect] = useState([]);
  // const [floorID, setFloorID] = useState(null);
  
  const [floorIDs, setFloorIDs] = useState(null);
  const [traversibleHistory, setTraversibleHistory] = useState([]);
  const [dropDownFloor, setDropDownFloor] = useState();
  const [selLocationDtls, setSelLocationDtls] = useState({});
  const [selBeaconDtls, setSelBeaconDtls] = useState({});
  const [selAmenityDtls, setSelAmenityDtls] = useState({});
  const [selSafetyDtls, setSelSafetyDtls] = useState({});
  const [selVerticalDtls, setselVerticalDtls] = useState({});
  const [selAd, setSelAd] = useState({});
  const [locations, setLocations] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [beaconList, setBeaconList] = useState([]);
  const [amenityList, setAmenityList] = useState([]);
  const [safetyList, setSafetyList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [adList, setAdList] = useState([]);
  const [selProductDtls, setSelProductDtls] = useState({});
  const [products, setProducts] = useState([]);
  const [beacons, setBeacons] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [safeties, setSafeties] = useState([]);
  const [verticalTransports, setVerticalTransports] = useState([]);
  const [verticalTransportlist, setVerticalTransportlist] = useState([]);
  const [allVerticalTransports, setAllVerticalTransports] = useState([]);
  const [allPointsAndEdges, setAllPointsAndEdges] = useState([]);
  const [aminityIcons, setAminityIcons] = useState([]);
  const [verticalIcons, setVerticalIcons] = useState([]);
  const [safetyIcons, setSafetyIcons] = useState([]);
  const [totalPinsUsed, setTotalPinsUsed] = useState();
  const [tracings, setTracings] = useState([]);
  const [tracingCircle, setTracingCircle] = useState([]);
  const [tempPolygon, setTempPolygon] = useState([]);
  const [mapDivSize, setMapDivSize] = useState({ width: 0, height: 0 });
  const [projectSettings, setProjectSettings] = useState({});
  const [addNewProduct, setAddNewProduct] = useState(false);
  const [addNewLocation, setAddNewLocation] = useState(false);
  const [addNewQrCodeBeacon, setAddNewQrCodeBeacon] = useState(false);
  const [addNewTraversablePath, setAddNewTraversablePath] = useState(true);
  const [addNewAmenity, setAddNewAmenity] = useState(false);
  const [addNewSafety, setAddNewSafety] = useState(false);
  const [addNewVertical, setAddNewVertical] = useState(false);
  const [addNewAd, setAddNewAd] = useState(false);
  const [showAlret, setShowAlret] = useState(false);
  const [addNewFloor, setAddNewFloor] = useState(false);
  const [selTracingId, setSelTracingId] = useState(false);
  const [tracingIntialValue, setTracingIntialValue] = useState({
    fill_color: null,
    border_color: null,
    border_thick: null,
  });
  const [textStyleValue, setTextStyleValue] = useState();
  const [toolActive, setToolActive] = useState("Draw");
  const [toolTraversible, setToolTraversible] = useState("Draw");
  const [selectedPaths, setSelectedPaths] = useState(false);
  const [posits, setPosits] = useState([]);
  const [dropValues, setDropValues] = useState([]);
  const [selTraversibleDetails, setSelTraversibleDetails] = useState();
  const [verticalFloorId, setVerticalFloorId] = useState(null);
  const [savingTimer, setSavingTimer] = useState(false);
  const [typeId, setTypeId] = useState("1");
  const [isPublish, setIsPublish] = useState("");
  const [isDiscard, setIsDiscard] = useState("");
  const [croppedImage, setCroppedImage] = useState(null);
  const [canvasUpdated, setCanvasUpdated] = useState(false);
  const [zoomInOut, setZoomInOut] = useState(1);
  const [undoRedoPath, setUndoRedoPath] = useState({});
  const [texts, setTexts] = useState([]);
  const [selObject, setSelObject] = useState();
  const [currentZoom, setCurrentZoom] = useState(1);
  const [canvasCenter, setCanvasCenter] = useState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchTerm, setSearchTerm] = useState("");
  const [panTool, setPanTool] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [images, setImages] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [websiteLinks, setwebsiteLinks] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isBoundary, setIsBoundary] = useState(false);
  const [hours, setHours] = useState(selLocationDtls?.hours ?? {});

  const validationSchema = Yup.object().shape({
    project_name: Yup.string().required("This field is required."),
    is_pass_protected: Yup.boolean(),
    password: Yup.string()
      .when('is_pass_protected', {
        is: true,
        then: (schema) =>
          schema
            .required('Password field is required.')
            .min(6, 'Password must be at least 6 characters'),
        otherwise: (schema) => schema.notRequired(),
      }),
    confirm_password: Yup.string()
      .when('is_pass_protected', {
        is: true,
        then: (schema) =>
          schema
            .required('Confirm Password field is required.')
            .oneOf([Yup.ref('password'), null], 'Passwords must match'),
        otherwise: (schema) => schema.notRequired(),
      }),
  });
  const [projectSettingData, setProjectSettingData] = useState(initialValues);
  const [modal, setModal] = useState(false);
  const [showpassfield, setshowpassfield] = useState(false);
  const toggle = (type) => {
    if (type == 'passprotect') {
      setshowpassfield(true)
    } else {
      setshowpassfield(false)
    }
    
    setModal(!modal)
  };
  const [modalVertical, setModalVertical] = useState(false);
  const [isWheechairChecked, setIsWheechairChecked] = useState(false);


  // ------------------------- canvas clustering code -------------------------
  const [canvasObjectList, setCanvasObjectList] = useState(new Map());
  // const storedObjects = new Map();
  const [storedObjects, setStoredObjects] = useState(new Map());
  const [mouseTrigger, setMousetrigger] = useState(0)
  const cellSize = 250;
  const clustersMap = useRef(new Map());
  const zoomThreshold = 1;
  const visibleObjects = useRef(new Set());
  const cornersVisible = useRef(false);
  // ------------------------- canvas clustering code over -------------------------

  const [selectedObjects, setSelectedObjects] = useState([])


  const floorList = useSelector(state => state.api.floorList);
  const currentFloor = useSelector(state => state.api.currentFloor); 
  const floorID = currentFloor?.id || null

  useEffect(() => {  
    let isFromEditor = localStorage.getItem("return")
    if (isFromEditor) {
      onSideBarIconClick('beacons',undefined)
      localStorage.removeItem("return")
    }
  }, []);


  const toggleVertical = () => {
    getProjectById();
    setModalVertical(!modalVertical);
  };

  const toggleVerticalClose = (isloading=false) => {
    const updatedVerticalTransport = verticalTransports?.map((item) => {
      const { noAccess, ...rest } = item;
      return rest; // Keep 'noAccess' property unchanged
    });
    setVerticalTransports(updatedVerticalTransport);
    setModalVertical(false);
    if (isloading) {
      setOverlay(false)
    }
  };

  const [planDetails, setPlanDetails] = useState();
  const [stripeModal, setStripeModal] = useState(false);
  const toggleStripe = () => setStripeModal(!stripeModal);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [isCommonSidebarVisible, setCommonSidebarVisible] = useState(true);

  const [floorPlanModal, setFloorPlanModal] = useState(false);
  const toggleReferanceImg = () => setFloorPlanModal(!floorPlanModal);
  const [selImageOrSvgValues, setSelImageOrSvgValues] = useState();
  const [fileKey, setFileKey] = useState(Date.now());
  const [loadingScale, setLoadingSacle] = useState(false);
  const [svgFile, setSvgFile] = useState();

  const [verticalPathConnectionResult, setVerticalPathConnectionResult] = useState([]);

  const dragPin = useRef(null)

  const [overlay, setOverlay] = useState(false)


  // const navPathStorage = useRef(null)

  let messageContents = `<b>Step 1: Scan the QR code</b><br>`
  messageContents += `Open your device's camera and aim your camera at the QR code provided.<br>`
  messageContents += `Wait for the QR code to be recognised, and tap the link that appears on your screen.<br><br>`
  messageContents += `<b>Step 2: Select Your Destination</b><br>`
  messageContents += `On the main screen, tap the “To:” search box and select either the product or place that you are looking for.<br>`
  messageContents += `Once you've made your selection, review the details of the selected product or place and tap the "Set as destination" button to confirm.<br><br>`
  messageContents += `<b>Step 3: Get Directions</b><br>`
  messageContents += `After selecting your destination, tap the "Find my way" button to generate the best route to your chosen destination.<br>`
  messageContents += `Follow the displayed directions to reach your desired product or place.
`;
  const [prefilledMessage, setPrefilledMessage] = useState(messageContents);

  const onSideBarIconClick = (tabName, type) => {
    // setStripeModal(false);
    getProjectById();
    if (viewportTransform) {
      canvas.current.viewportTransform = viewportTransform;
    }

    if (tabName == "traversable") {
      if (floorList?.length == 0) {
        toast.warning("Please select a floor plan to navigate.");
        return;
      }
    }
    if (tabName == "advertisements") {
      getAdvertisementList();
    }
    setActiveTab(tabName);
    setCommonSidebarVisible(false);
    // canvasBackgroundImageHandler(null);
    setSelObject();
    setSearchTerm("");
    // setActiveTab(tabName);
    setSelProductDtls();
    setSelLocationDtls();
    setSelBeaconDtls();
    setSelAmenityDtls();
    setSelSafetyDtls();
    setselVerticalDtls();
    setSelAd();
    setSelTraversibleDetails();
    // setTempPolygon([])
    setAddNewLocation(false);
    setAddNewProduct(false);
    setAddNewQrCodeBeacon(false);
    setAddNewAmenity(false);
    setAddNewSafety(false);
    setAddNewTraversablePath(true);
    setAddNewVertical(false);
    setAddNewAd(false);
    // setLocations([])
    // setProducts([])
    setPanTool(false);
    setFloorIDs(null);
    setAddNewFloor(false);
    if (type !== 1) {
      setVerticalFloorId(null);
    }
    obj = "";
    setToolActive(null);
    firstClick = {
      location: null,
      verticalTransport: null,
      safety: null,
      amenity: null,
      beacon: null,
      product: null,
    };
    setSavingTimer(false);
    if (tabName === "verticalTransport") {
      getVerticalTransportList(projectSettings?.enc_id);
    }
    if (tabName === "traversable") {
      getTraversablePins(id, setDropValues);
      setToolTraversible("Draw");
    }
    const lastAddedFloor = floorList[0];

    const floor = floorList.find((el) => el.enc_id == floorID);
    if (floorID) {

      // getFloorPlanByid(floorID, tabName, "0", "default");
      // setDropDownFloor({
      //   value: floor?.enc_id,
      //   label: floor?.floor_plan,
      //   id: floor?.enc_id,
      //   plan: floor?.plan,
      //   dec_id: floor?.dec_id,
      // });
      
      dispatch(setCurrentFloor({
        value: floor?.enc_id,
        label: floor?.floor_plan,
        id: floor?.enc_id,
        plan: floor?.plan,
        dec_id: floor?.dec_id,
      }))
    } else {
      if (lastAddedFloor) {
        

        // setFloorID(lastAddedFloor?.enc_id);
        // getFloorPlanByid(lastAddedFloor?.enc_id, tabName, "0", "default");

        // handleEnableDisable(lastAddedFloor?.enc_id);
        // setDropDownFloor({
        //   value: lastAddedFloor?.enc_id,
        //   label: lastAddedFloor?.floor_plan,
        //   id: lastAddedFloor.enc_id,
        //   plan: lastAddedFloor.plan,
        //   dec_id: lastAddedFloor?.dec_id,
        // });
        dispatch(setCurrentFloor({
          value: lastAddedFloor?.enc_id,
          label: lastAddedFloor?.floor_plan,
          id: lastAddedFloor.enc_id,
          plan: lastAddedFloor.plan,
          dec_id: lastAddedFloor?.dec_id,
        }))
      } else {
        // console.log("floors null");
        // setFloorID(null);
        // handleEnableDisable(lastAddedFloor?.enc_id);
        dispatch(setCurrentFloor(null))
        // setDropDownFloor();
      }
    }
    /* For bulk pinload */
    // if (floorPlans?.length === 0) {
    //   if (tabName === 'products') {
    //     getProductList()
    //   } else if (tabName === 'locations')
    //     getLocationList()
    // }
  };

  useEffect(() => {
    // Set the scroll position to the top
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {  
    getProjectById();
    getFloorDropdown(); 
  }, [id]);

  useEffect(() => {
    // return
    if (id && floorList) { 
      const lastAddedFloor = floorList[0];
      // console.log(object);
      const floor = floorList.find((el) => el.enc_id == floorID);  
      if (floorID) {
        getFloorPlanByid(floorID, activeTab, "0", "default");
        // setDropDownFloor({
        //   value: floor?.enc_id,
        //   label: floor?.floor_plan,
        //   id: floor?.enc_id, 
        //   plan: floor?.plan,
        //   dec_id: floor?.dec_id,
        // });

        dispatch(setCurrentFloor({
          value: floor?.enc_id,
          label: floor?.floor_plan,
          id: floor?.enc_id,
          plan: floor?.plan,
          dec_id: floor?.dec_id,
        }))
      } else {
        if (lastAddedFloor) { 
          getFloorPlanByid(lastAddedFloor?.enc_id, "0", "default");

          // handleEnableDisable(lastAddedFloor?.enc_id);
          // setDropDownFloor({
          //   value: lastAddedFloor?.enc_id,
          //   label: lastAddedFloor?.floor_plan,
          //   id: lastAddedFloor.enc_id,
          //   plan: lastAddedFloor.plan,
          //   dec_id: lastAddedFloor?.dec_id,
          // });

          dispatch(setCurrentFloor({
            value: lastAddedFloor?.enc_id,
            label: lastAddedFloor?.floor_plan,
            id: lastAddedFloor?.enc_id,
            plan: lastAddedFloor?.plan,
            dec_id: lastAddedFloor?.dec_id,
          }))
        }
      }
    }
  }, [id, floorList]);

  const clearPinsList = () => {
    setLocationList([]);
    setProductList([]);
    setBeaconList([]);
    setAmenityList([]);
    setSafetyList([]);
  };

  // useEffect(() => {
  //   // return
  //   // console.log('selFloorPlanDtls');
  //   // return
  //   if (selFloorPlanDtls) {
  //     // setDropDownFloor({
  //     //   value: selFloorPlanDtls?.enc_id,
  //     //   label: selFloorPlanDtls?.floor_plan,
  //     //   id: selFloorPlanDtls.enc_id,
  //     //   plan: selFloorPlanDtls.plan,
  //     //   dec_id: selFloorPlanDtls?.dec_id,
  //     // });
  //     dispatch(setCurrentFloor({
  //       value: selFloorPlanDtls?.enc_id,
  //       label: selFloorPlanDtls?.floor_plan,
  //       id: selFloorPlanDtls.enc_id,
  //       plan: selFloorPlanDtls.plan,
  //       dec_id: selFloorPlanDtls?.dec_id,
  //     }))
  //   }
  // }, [selFloorPlanDtls]);

  const handleResize = () => {
    const { clientWidth, clientHeight } =
      window.document.getElementById("map-div");
    setMapDivSize({ height: clientHeight, width: clientWidth });
  };

  const onMapDivClick = (e) => {
    const { clientWidth, clientHeight } =
      window.document.getElementById("map-div");

    if (!mapDivSize.height) {
      setMapDivSize({ height: clientHeight, width: clientWidth });
    }
  };

  useEffect(() => { 
    // console.log('selProductDtls');
    // return
    // if (selProductDtls?.position) {
    //   setShowAlret(true);
    // } else {
    //   setShowAlret(false);
    // }
  }, [selProductDtls]);

  const onLevelDDChange = (selected) => {
    // setFloorID(null);
    if (selected) {
      // setOverlay(true)
      // removePins()
      
      setSearchTerm("");
      setSelTracingId();
      // setVerticalFloorId(null);
      // setFloorIDs();
      // setFloorIDs(selected?.id);
      // setFloorID(selected?.id);
      getFloorPlanByid(selected?.id, activeTab, "0", "default");
      // setDropDownFloor(selected);
      dispatch(setCurrentFloor(selected))
      // handleEnableDisable(selected?.id);
      setSelProductDtls();
      setSelLocationDtls();
      setSelBeaconDtls();
      setSelAmenityDtls();
      setSelSafetyDtls();
      setSelAd();
      setselVerticalDtls();
      setAddNewAmenity(false);
      setAddNewLocation(false);
      setAddNewProduct(false);
      setAddNewQrCodeBeacon(false);
      setAddNewSafety(false);
      setAddNewVertical(false);
      setAddNewAd(false);
      // resetCanvasTransform();
      setToolTraversible("Draw"); 
      setSelTraversibleDetails((prev) => ({
        ...prev,
        is_miltiple: false,
        isNext: null,
      }));
    }
  };

  const onLevelDDChangeVT = (selected) => {
    // console.log(selVerticalDtls, "selVerticalDtls");
    if (
      selVerticalDtls?.connectionPins[
        selVerticalDtls?.connectionPins.length - 1
      ]?.value &&
      !selVerticalDtls?.connectionPins[
        selVerticalDtls?.connectionPins.length - 1
      ]?.position
    ) {
      toast.warning("Please click on map to add Vertical Transport");
      return;
    }
    setVerticalFloorId(null);
    setFloorIDs(selected?.id);
    // setFloorID(selected?.id);
    getFloorPlanByid(selected?.id, activeTab, "0", "default");
    // setDropDownFloor(selected);
    dispatch(setCurrentFloor(selected))
    handleEnableDisable(selected?.id);
  };

  useEffect(() => {
    return
    // console.log('verticalFloorId return');
    // return
    // getVerticalTransportList()
    if (addNewVertical) {
      getFloorPlanByid(verticalFloorId ?? floorID, activeTab, "0", "default");
      setLocations([]);
      setProducts([]);
      setBeacons([]);
      setAmenities([]);
      setSafeties([]);
      setTracings([]);
      setTexts([]);
      setVerticalTransports([]);
    }
  }, [verticalFloorId]);

  const onMove = useCallback(
    (key, left, top, type, idx) => {
      if (type == "VCP") {
        onDragFinishedPVCP(key, idx, left, top);
      }
    },
    [setTracings, tracings]
  );
  const onDragFinishedPVCP = (polygonId, coordinatesId, left, top) => {
    let tempCoordinates = [...tracings[polygonId]];

    tempCoordinates[coordinatesId].xa = mapDivSize.width / left;
    tempCoordinates[coordinatesId].ya = mapDivSize.height / top;
    let tempPolygons = [...tracings];
    tempPolygons[polygonId] = tempCoordinates;
    setTracings([...tempPolygons]);
  };

  const [, drop] = useDrop(
    () => ({
      accept: "node",
      drop(item, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset();
        const left = item.left + delta?.x;
        const top = item.top + delta?.y;
        onMove(item.id, left, top, item.type, item.idx);
        return undefined;
      },
    }),
    [onMove]
  );

  useEffect(() => {
    return
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

 

  const getFloorDropdown = async (type) => { 
    try {
      const response = await getRequest(`dropdown-floor-plan/${id}`);
      const data = response.data ?? [];
      // setFloorPlanSelect(data);
      dispatch(setFloorList(data))  
      if (type == "discard") {
        const lastAddedFloor = data[0];
        if (lastAddedFloor) {
          // getFloorPlanByid(lastAddedFloor?.enc_id, activeTab, "0", "default");
          // setDropDownFloor({
          //   value: lastAddedFloor?.enc_id,
          //   label: lastAddedFloor?.floor_plan,
          //   id: lastAddedFloor?.enc_id,
          //   plan: lastAddedFloor?.plan,
          //   dec_id: lastAddedFloor?.dec_id,
          // });
          dispatch(setCurrentFloor({
            value: lastAddedFloor?.enc_id,
            label: lastAddedFloor?.floor_plan,
            id: lastAddedFloor?.enc_id,
            plan: lastAddedFloor?.plan,
            dec_id: lastAddedFloor?.dec_id,
          }))
        } else {
          if (data?.length === 0) {
            dispatch(setCurrentFloor(null)) 
            reinitializeFabricCanvas(canvas);
            handleTraversibleData(null, graph, setSelTraversibleDetails, findShortestPath, renderTraversiblePaths, selTraversibleDetails);
          }
          reinitializeFabricCanvas(canvas);
          dispatch(setCurrentFloor(null))
          removeListItems("noFloors");
        }
      } else {
        if (data?.length === 0) {
          dispatch(setCurrentFloor(null))
        }
        // reinitializeFabricCanvas(canvas);
        // removeListItems();
      }
    } catch (error) {
      ////
    }
  };

  const removeListItems = (type) => {
    setTracings([]);
    setTracingCircle([]);
    setTexts([]);
    setLocations([]);
    setProducts([]);
    setBeacons([]);
    setAmenities([]);
    setSafeties([]);
    setVerticalTransports([]);

    if (type === "noFloors") {
      setLocationList([]);
      setProductList([]);
      setBeaconList([]);
      setAmenityList([]);
      setSafetyList([]);
    }
  };

  const removePins = () => {
    removeFabricObjectsByName(canvas, "product");
    removeFabricObjectsByName(canvas, "location");
    removeFabricObjectsByName(canvas, "boundary");
    removeFabricObjectsByName(canvas, "amenity");
    removeFabricObjectsByName(canvas, "beacon");
    removeFabricObjectsByName(canvas, "safety");
    setLocations([]);
    setProducts([]);
    setBeacons([]);
    setAmenities([]);
    setSafeties([]);
    setVerticalTransports([]);
  }; 

  const getFloorPlanByid = async (id, tab, val, type, pinsId) => {
    let value;
    try {
      setAddNewFloor(false);
      const response = await getRequest(`floor-plan/${id}`);
      const data = response.data ?? [];

      value = {
        ...data,
        floor_plan: data?.floor_plan,
        refImg: data?.cropped_path_base64,
        plan: data?.cropped_image,
        border_color: data?.border_color,
        fill_color: data?.fill_color,
        border_thick: data?.border_thick,
        width: data?.width ? Number(data?.width) : null,
        height: data?.height ? Number(data?.height) : null,
      };
      const decodedTexts = JSON.parse(data?.text);
      var decodedString = JSON.parse(data?.tracings);
      var arrayOfObjects = JSON.parse(decodedString);
      var arrayOfTexts = decodedTexts ? JSON.parse(decodedTexts) : "";

      var decodedCircle = JSON.parse(data?.circle_data);
      var objectCircle = JSON.parse(decodedCircle);

      const modifiedData = data?.vertical_transports?.map((el) => ({
        ...el,
        position: el?.positions ? JSON.parse(el?.positions) : "",
      }));
      // setTexts(arrayOfTexts ?? []);
      // setZoomInOut(data?.img_size ? JSON.parse(data?.img_size) : zoomInOut);
      // setVerticalTransports(modifiedData);
      // setTracings(arrayOfObjects ?? []);
      // setTracingCircle(objectCircle ?? [])
      // setTempPolygon([]);
      // setIsEdit(true);
      // localStorage.removeItem("shortestPath")

      // setAddNew(true)
      if (val === "0") {
        
        setSelFloorPlanDtls(value); 
      }
      // handleTraversibleData(
      //   value,
      //   graph,
      //   setSelTraversibleDetails,
      //   findShortestPath,
      //   renderTraversiblePaths,
      //   selTraversibleDetails
      // );
      // if (tab == "floorDetails" && type !== "default") {
      //   setAddNewFloor(true);
      //   setToolActive("Draw");
      // } else {
      //   setAddNewFloor(false);
      // }
      // if (tab === "floorDetails" && type !== "default") {
      // canvasBackgroundImageHandler(value?.plan);
      // } else {
      //   canvasBackgroundImageHandler(null);
      // }
      // getSvgFileAsRefImage(value?.enc_id)
      // if (value?.show_image == 1 && value?.plan) {
      //   canvasBackgroundImageHandler(value?.plan);
      // } else {
      //   canvasBackgroundImageHandler(null);
      // }
      // stopPathDrawing();
    } catch (error) {
      ////
    } finally {
      // if (val !== "1") {
      //   getLocationList(id);
      //   getProductList(id);
      //   getBeaconList(id);
      //   getAmenityList(id);
      //   getSafetyList(id);
      // }
      // getVerticalTransportList(projectSettings?.enc_id);
      // getAdvertisementList();

      // if (pinsId) {
      //   const delay = 800;
      //   setTimeout(() => {
      //     checkEditPin(pinsId, tab);
      //   }, delay);
        setSelFloorPlanDtls(value);
      // }

      // setTimeout(() => {
      //   setOverlay(false)
      // },500)
    }
  };



// new map items----------------------

  const { loading : pinLoading, error } = useLoadPins(id);

// -----------------------------------




  const getSvgFileAsRefImage = async (enc_id) => {
    try {
      const response = await getRequest(`get-svg/${enc_id}`);
      const svgBlob = response.data;
      
      setSvgFile(svgBlob)
      setSelFloorPlanDtls((prev) => ({
        ...prev,
        get_svg: svgBlob
      }))
    } catch (error) {
    }
  }

  const checkEditPin = (pinsData, tab) => {
    // setFloorID(pinsData?.fp_id);
    if (tab === "locations") {
      onEditLocation(pinsData);
    } else if (tab === "products") {
      onEditProduct(pinsData);
    } else if (tab === "beacons") {
      onEditBeacon(pinsData);
    } else if (tab === "amenitys") {
      onEditAmenity(pinsData);
    } else if (tab === "safety") {
      onEditSafety(pinsData);
    } else if (tab === "advertisements") {
      onEditAd(pinsData);
    }
  };

  const getLocationList = async (floor) => {
    getLocation(floor, id, setLocations, setLocationList);
  };

  const getProductList = async (floorID) => {
    getProduct(floorID, id, setProducts, setProductList);
  };

  const getBeaconList = async (floorID) => {
    getBeacon(floorID, id, setBeacons, setBeaconList);
  };

  const getAmenityList = async (floorID) => {
    getAmenity(floorID, id, setAmenities, setAmenityList);
  };

  const getSafetyList = async (floorID) => {
    getSafety(floorID, id, setSafeties, setSafetyList);
  };

  const getVerticalTransportList = async (floorID) => {
    getVerticalTransport(floorID, setVerticalTransportlist);
  };


  const getAdvertisementList = async () => {
    getAdvertisement(id, setAdList);
  };

  useEffect(() => {
    totalPinCount();
  }, []);

  const totalPinCount = async () => {
    // totalPinCountApi(id, setTotalPinsUsed);
    let pinCount = await PinCountApi(id) 
    dispatch(setPinCount(pinCount));
  };

  const renderTracings = (tracingArray) => {
    // console.log("rendering");
    localStorage.removeItem("shortestPath")
    let toolActive;
    setToolActive((prev) => {
      toolActive = prev;
      return prev;
    });

    let trace = tracingArray ?? tracings;
    if (trace?.length > 0) {
      renderTracing(
        canvas,
        trace,
        projectSettings,
        toolActive,
        addNewFloor,
        activeTab
      );
    }
  };

  const renderTracingCircles = (tracingArray) => {
    let toolActive;
    setToolActive((prev) => {
      toolActive = prev;
      return prev;
    });

    let trace = tracingArray ?? tracingCircle
    if (trace?.length > 0) {
      renderTracingCircle(canvas, trace, projectSettings, toolActive, addNewFloor, activeTab);
    }
  }

  const renderTexts = (textArray) => {
    let toolActive;
    setToolActive((prev) => {
      toolActive = prev;
      return prev;
    });
    let textObjs = textArray ?? texts
    if (texts?.length > 0) {
      renderText(canvas, textObjs, toolActive, addNewFloor, activeTab);
    }
  };

  const renderLocations = () => {
    setLocations((prev) => {
      if (prev && prev?.length > 0) {
        renderLocation(
          canvas,
          prev,
          projectSettings,
          activeTab,
          addNewLocation,
          selLocationDtls,
          checkConditionDrag
        );
      }
      return prev;
    });
    // if (locations?.length > 0) {
    //   renderLocation(
    //     canvas,
    //     locations,
    //     projectSettings,
    //     activeTab,
    //     addNewLocation,
    //     selLocationDtls,
    //     checkConditionDrag
    //   );
    // }

  };

  const [, dropProduct] = useDrop({
    accept: 'productpin',
    drop: (item, monitor) => {
      if (!map) return;
 
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
 
      const mapRect = map.getContainer().getBoundingClientRect();
 
      const x = clientOffset.x - mapRect.left;
      const y = clientOffset.y - mapRect.top;
 
      const lngLat = map.unproject([x, y]);

      const pointer = {
        x: lngLat.lng,
        y: lngLat.lat
      }

      // const clientOffset = monitor.getClientOffset();
      // const pointer = canvas.current?.getPointer({ clientX: clientOffset.x, clientY: clientOffset.y });
      
      // getFloorPlanByid(item?.fp_id, 'products', "0", "default", item?.product);
      // return
      const prod = item?.product;
      // console.log(prod, 'dropProduct')
      let obj
      let fillColor = prod?.product_color ?? projectSettings?.product_color;
      let productIcon = getProductPin(fillColor)
      // let path = fabric.loadSVGFromString(
      //   productIcon,
      //   function (objects, options) {
      //     obj = fabric.util.groupSVGElements(objects, options);
      //     obj.set({
      //       left: pointer?.x - obj.width / 2,
      //       top: pointer?.y - obj.height / 2,
      //       selectable: false,
      //       name: "product",
      //       id: prod.product_name,
      //       enc_id: prod?.enc_id,
      //       lockRotation: true,
      //       lockScalingX: true,
      //       lockScalingY: true,
      //       hoverCursor:
      //         activeTab === "products" && addNewProduct ? "grab" : "default"
      //     });
      //     canvas.current.add(obj).renderAll();
      //   }
      // );
      
      const specArray = prod?.specifications ? JSON.parse(prod?.specifications) : [];
      const filteredSpecificationsArray = specArray;
      const specification = prod?.specifications ? filteredSpecificationsArray : [];

      const webArray = prod?.website ? JSON.parse(prod?.website) : [];
      const filteredWebArray = webArray;
      const weblink = prod?.website ? filteredWebArray : [];

      const TagsArray = JSON.parse(prod?.tags);
      setSelProductDtls((prev) => ({
        ...prev,
        ...prod,
        enc_id: prod?.enc_id,
        product_name: prod?.product_name,
        product_color: fillColor,
        position: { x: pointer?.x, y: pointer?.y },
        isDrop: true,
        tags: TagsArray === null ? [] : TagsArray,
      }));

      setSpecifications(specification);

      setwebsiteLinks(weblink);

      setPanTool(false)
      // setTimeout(() => {
      document.getElementById("productSubmitBtn").click();
      
      // }, 1000);
    },
  });

  const map = useSelector(state => state.map.mapContainer);

  const [, dropLocation] = useDrop({
    accept: 'LocationPin',
    drop: (item, monitor) => {
      if (!map) return;
 
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
 
      const mapRect = map.getContainer().getBoundingClientRect();
 
      const x = clientOffset.x - mapRect.left;
      const y = clientOffset.y - mapRect.top;
 
      const lngLat = map.unproject([x, y]);

      const pointer = {
        x: lngLat.lng,
        y: lngLat.lat
      }
      // return
      // console.log(item, 'LocationPin')
      // const clientOffset = monitor.getClientOffset();
      // const pointer = canvas.current?.getPointer({ clientX: clientOffset.x, clientY: clientOffset.y });
      // console.log(clientOffset, monitor, pointer, item, 'clientOffset')
      // getFloorPlanByid(item?.fp_id, 'products', "0", "default", item?.product);
      // return
      const prod = item?.location;
      let obj
      let fillColor = prod?.location_color ?? projectSettings?.location_color;
      let productIcon = getLocationPin(fillColor)
      // let path = fabric.loadSVGFromString(
      //   productIcon,
      //   function (objects, options) {
      //     obj = fabric.util.groupSVGElements(objects, options);
      //     obj.set({
      //       left: pointer?.x - obj.width / 2,
      //       top: pointer?.y - obj.height / 2,
      //       selectable: false,
      //       name: "location",
      //       id: prod.location_name,
      //       enc_id: prod?.enc_id,
      //       lockRotation: true,
      //       lockScalingX: true,
      //       lockScalingY: true,
      //       hoverCursor:
      //         activeTab === "locations" && addNewLocation ? "grab" : "default"
      //     });
      //     canvas.current.add(obj).renderAll();
      //   }
      // );

      let promotionData = prod.promotions ? JSON.parse(prod.promotions) : [];
      promotionData?.forEach((el) => {
        el.image_path = el.image_path ? image_url + el.image_path : null;
        el.start_date = el.start_date ? moment(el.start_date).toDate() : "";
        el.end_date = el.end_date ? moment(el.end_date).toDate() : "";
      });
      setPromotions(promotionData);
      const converted = {};
      Object.keys(dayMap).forEach((day) => {
        const isOpen = prod[`${day}_open`] == 1;
        if (isOpen) {
          const dayPrefix = dayMap[day];
          0;
          const from = prod[`${day}_start`];
          const to = prod[`${day}_end`];
          converted[dayPrefix] = { from, to };
        }
      });
      setHours(converted ?? {});
      setSelLocationDtls((prev) => {
        console.log(prev,"dsfksnds");
        return {
        ...prev,
        ...prod,
        enc_id: prod?.enc_id,
        location_name: prod?.location_name,
        location_color: fillColor,
        position: { x: pointer?.x, y: pointer?.y },
        isDrop: true,
        tags: prod.tags ? JSON.parse(prod.tags) : [],
      }});
      setIsBoundary(false)
      setPanTool(false)
      // setTimeout(() => {
      document.getElementById("locationSubmitBtn")?.click();
      
      // }, 1000);
    },
  });

  const [, dropBeacon] = useDrop({
    accept: 'BeaconPin',
    drop: (item, monitor) => {
      if (!map) return;
 
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
 
      const mapRect = map.getContainer().getBoundingClientRect();
 
      const x = clientOffset.x - mapRect.left;
      const y = clientOffset.y - mapRect.top;
 
      const lngLat = map.unproject([x, y]);

      const pointer = {
        x: lngLat.lng,
        y: lngLat.lat
      }

      // console.log(item, 'BeaconPin')
      // const clientOffset = monitor.getClientOffset();
      // const pointer = canvas.current?.getPointer({ clientX: clientOffset.x, clientY: clientOffset.y });
      // console.log(clientOffset, monitor, pointer, item, 'clientOffset')
      // getFloorPlanByid(item?.fp_id, 'products', "0", "default", item?.product);
      // return
      const prod = item?.item;
      let obj
      let fillColor = prod?.beacon_color ?? projectSettings?.beacon_color;
      let beaconicon = getBeaconPin(fillColor)
      // let path = fabric.loadSVGFromString(
      //   beaconicon,
      //   function (objects, options) {
      //     obj = fabric.util.groupSVGElements(objects, options);
      //     obj.set({
      //       left: pointer?.x - obj.width / 2,
      //       top: pointer?.y - obj.height / 2,
      //       selectable: false,
      //       name: "beacon",
      //       id: prod.beacon_name,
      //       enc_id: prod?.enc_id,
      //       lockRotation: true,
      //       lockScalingX: true,
      //       lockScalingY: true,
      //       hoverCursor:
      //         activeTab === "beacons" && addNewQrCodeBeacon ? "grab" : "default"
      //     });
      //     canvas.current.add(obj).renderAll();
      //   }
      // );


      setSelBeaconDtls((prev) => ({
        ...prev,
        ...prod,
        enc_id: prod?.enc_id,
        beacon_name: prod?.beacon_name,
        beacon_color: fillColor,
        position: { x: pointer?.x, y: pointer?.y },
        isDrop: true,
      }));
      setPanTool(false)
      // setTimeout(() => {
      document.getElementById("beaconSubmitBtn")?.click();
      
      // }, 1000);
    },
  });

  const [, dropAmenity] = useDrop({
    accept: 'AmenityPin',
    drop: (item, monitor) => {
      if (!map) return;
 
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
 
      const mapRect = map.getContainer().getBoundingClientRect();
 
      const x = clientOffset.x - mapRect.left;
      const y = clientOffset.y - mapRect.top;
 
      const lngLat = map.unproject([x, y]);

      const pointer = {
        x: lngLat.lng,
        y: lngLat.lat
      }

      // const clientOffset = monitor.getClientOffset();
      // const pointer = canvas.current?.getPointer({ clientX: clientOffset.x, clientY: clientOffset.y });
      // console.log(clientOffset, monitor, pointer, item, 'clientOffset')
      // getFloorPlanByid(item?.fp_id, 'products', "0", "default", item?.product);
      // return
      const prod = item?.item;
      // console.log(prod, 'prod')
      let obj
      let fillColor = prod?.amenity_color ?? projectSettings?.amenity_color;
      // let amenityIcon = getAmenityPin(fillColor)
      let amenityIcon = ChangeSvgColorPassingBE(prod?.path, fillColor)
      // let path = fabric.loadSVGFromString(
      //   amenityIcon,
      //   function (objects, options) {
      //     obj = fabric.util.groupSVGElements(objects, options);
      //     obj.set({
      //       left: pointer?.x - obj.width / 2,
      //       top: pointer?.y - obj.height / 2,
      //       selectable: false,
      //       name: "amenity",
      //       id: prod.amenity_name,
      //       enc_id: prod?.enc_id,
      //       lockRotation: true,
      //       lockScalingX: true,
      //       lockScalingY: true,
      //       hoverCursor:
      //         activeTab === "amenitys" && addNewAmenity ? "grab" : "default"
      //     });
      //     canvas.current.add(obj).renderAll();
      //   }
      // );
      setSelAmenityDtls((prev) => ({
        ...prev,
        ...prod,
        enc_id: prod?.enc_id,
        amenity_name: prod?.amenity_name,
        amenity_color: fillColor,
        position: { x: pointer?.x, y: pointer?.y },
        // icon_id: aminityIcons[0]?.enc_id,
        icon_id: prod?.icon_id,
        isDrop: true,
      }));
      setPanTool(false)
      // setTimeout(() => {
      document.getElementById("amenitySubmitBtn")?.click();
      
      // }, 1000);
    },
  });

  const [, dropSafety] = useDrop({
    accept: 'SafetyPin',
    drop: (item, monitor) => {
      if (!map) return;
 
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
 
      const mapRect = map.getContainer().getBoundingClientRect();
 
      const x = clientOffset.x - mapRect.left;
      const y = clientOffset.y - mapRect.top;
 
      const lngLat = map.unproject([x, y]);

      const pointer = {
        x: lngLat.lng,
        y: lngLat.lat
      }

      // const clientOffset = monitor.getClientOffset();
      // const pointer = canvas.current?.getPointer({ clientX: clientOffset.x, clientY: clientOffset.y });

      const prod = item?.item;
      // console.log(prod, 'prod')
      let obj
      let fillColor = prod?.safety_color ?? projectSettings?.safety_color;
      let safetyIcon = ChangeSvgColorPassingBE(prod?.path, fillColor)
      let path = fabric.loadSVGFromString(
        safetyIcon,
        function (objects, options) {
          obj = fabric.util.groupSVGElements(objects, options);
          obj.set({
            left: pointer?.x - obj.width / 2,
            top: pointer?.y - obj.height / 2,
            selectable: false,
            name: "safety",
            id: prod.safety_name,
            enc_id: prod?.enc_id,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hoverCursor:
              activeTab === "safety" && addNewSafety ? "grab" : "default"
          });
          canvas.current.add(obj).renderAll();
        }
      );
      setSelSafetyDtls((prev) => ({
        ...prev,
        ...prod,
        enc_id: prod?.enc_id,
        safety_name: prod?.safety_name,
        safety_color: fillColor,
        position: { x: pointer?.x, y: pointer?.y },
        // icon_id: safetyIcons[0]?.enc_id,
        icon_id: prod?.icon_id,
        isDrop: true,
      }));
      setPanTool(false)
      // setTimeout(() => {
      document.getElementById("safetySubmitBtn")?.click();
      
      // }, 1000);
    },
  });

  const renderProducts = () => {
    setProducts((prev) => {
      if (prev && prev.length > 0) {
        renderProduct(
          canvas,
          prev,
          projectSettings,
          activeTab,
          addNewProduct,
          selProductDtls,
          checkConditionDrag
        );
      }
      return prev;
    });

   
    // if (products.length > 0) {
    //   renderProduct(
    //     canvas,
    //     products,
    //     projectSettings,
    //     activeTab,
    //     addNewProduct,
    //     selProductDtls,
    //     checkConditionDrag
    //   );
    // }
  };

  const renderBeacons = () => {
    setBeacons((prev) => {
      if (prev && prev?.length > 0) {
        renderBeacon(
          canvas,
          prev,
          projectSettings,
          activeTab,
          addNewQrCodeBeacon,
          selBeaconDtls,
          checkConditionDrag
        );
      }
      return prev
    })
    // if (beacons?.length > 0) {
    //   renderBeacon(
    //     canvas,
    //     beacons,
    //     projectSettings,
    //     activeTab,
    //     addNewQrCodeBeacon,
    //     selBeaconDtls,
    //     checkConditionDrag
    //   );
    // }
  };

  const renderAmenitys = () => {
    setAmenities((prev) => {
      if (prev && prev?.length > 0) {
        renderAmenity(
          canvas,
          prev,
          projectSettings,
          activeTab,
          addNewAmenity,
          selAmenityDtls,
          amenityList,
          selFloorPlanDtls,
          checkConditionDrag
        );
      }
      return prev
    })
    
    // if (amenities?.length > 0) {
    //   renderAmenity(
    //     canvas,
    //     amenities,
    //     projectSettings,
    //     activeTab,
    //     addNewAmenity,
    //     selAmenityDtls,
    //     amenityList,
    //     selFloorPlanDtls,
    //     checkConditionDrag
    //   );
    // }
  };

  const renderSafeties = () => {
    setSafeties((prev) => { 
      if (prev && prev.length > 0) {
        renderSafetie(
          canvas,
          prev,
          projectSettings,
          activeTab,
          addNewSafety,
          selSafetyDtls,
          checkConditionDrag
        );
      }
      return prev
    })
    // if (safeties.length > 0) {
    //   renderSafetie(
    //     canvas,
    //     safeties,
    //     projectSettings,
    //     activeTab,
    //     addNewSafety,
    //     selSafetyDtls,
    //     checkConditionDrag
    //   );
    // }
  };

  const renderVerticalTransport = () => {
    setVerticalTransports((prev) => {
      if (prev && prev.length > 0) {
        renderVT(
          canvas,
          prev,
          projectSettings,
          activeTab,
          addNewVertical,
          selVerticalDtls,
          verticalFloorId,
          checkConditionDrag
        );
      }
      return prev
    })
    // if (verticalTransports.length > 0) {
    //   renderVT(
    //     canvas,
    //     verticalTransports,
    //     projectSettings,
    //     activeTab,
    //     addNewVertical,
    //     selVerticalDtls,
    //     verticalFloorId,
    //     checkConditionDrag
    //   );
    // }
  };

  const renderTraversiblePaths = (type, visible = false, mouseDown = false) => {
    removeFabricObjectsByName(canvas, "node");
    removeFabricObjectsByName(canvas, "path");
    
    if (activeTab === "traversable" && !isCommonSidebarVisible) {
      renderTraversiblePath(
        canvas,
        graph,
        projectSettings,
        checkPinConnectOrNot,
        type,
        visible,
        mouseDown
      );
    }
  };

  const checkPinConnectOrNot = () => {
    
    checkPinConnection(canvas, graph, activeTab, isCommonSidebarVisible)
  };

  const deleteSubPath = (obj) => {
    
    if (obj.name === 'node') {
      
      let edges = graph.getEdges();
      const linesDeleted = Object.keys(edges[obj?.id])
      const sortNode = linesDeleted.filter(item => !item.includes('_'))
      const includePin = linesDeleted.some(item => item.includes('_'))

      const isSubpathpoint = linesDeleted.some(item => graph.subNode.includes(item) && !graph.connectedMainPathNodes.includes(item))
      const sortedLinePoint = linesDeleted.filter(item => !(graph.subNode.includes(item) && !graph.connectedMainPathNodes.includes(item)))

      const isMainpathpoint = linesDeleted.some(item => !graph.subNode.includes(item) && !graph.connectedMainPathNodes.includes(item))
      const sortedMainLinePoint = linesDeleted.filter(item => !(!graph.subNode.includes(item) && !graph.connectedMainPathNodes.includes(item)))
      
      if (includePin && sortNode?.length === 2) {
        const node1 = sortNode[0]
        const node2 = sortNode[1]
        addConnectionBtwnEdges(node1, node2, graph, canvas);
      } else if (isSubpathpoint && sortedLinePoint?.length === 2) {
        const node1 = sortedLinePoint[0]
        const node2 = sortedLinePoint[1]
        addConnectionBtwnEdges(node1, node2, graph, canvas);
      } else if (isMainpathpoint && sortedMainLinePoint?.length === 2) {
        const node1 = sortedMainLinePoint[0]
        const node2 = sortedMainLinePoint[1]
        addConnectionBtwnEdges(node1, node2, graph, canvas);
      }
    } else if (obj?.name === 'path' && obj?.id?.includes('_')) {
      const key1 = obj?.id.split("$")[1];
      const key2 = obj?.id.split("$")[2];
      let edges = graph.getEdges();
      
      let checkNodePinOrNot = null;
      if (!(key1?.includes('_'))) {
        checkNodePinOrNot = key1
      } else if (!(key2?.includes('_'))) {
        checkNodePinOrNot = key2
      }
      // console.log(checkNodePinOrNot, 'checkNodePinOrNot')
      if (checkNodePinOrNot) {
        const linesDeleted = Object.keys(edges[checkNodePinOrNot] || {});
        // console.log(key1, key2, graph, linesDeleted, 'checkNodePinOrNot')
        const node1 = linesDeleted[0];
        const node2 = linesDeleted[1];
        if (linesDeleted?.length >= 2) {
          addConnectionBtwnEdges(node1, node2, graph, canvas);
        }
        removeNode(checkNodePinOrNot, true, graph, canvas);
      }
    }
  }

  /* Almost correct */
  const generateAutoConnections = () => {
    
    // setToolTraversible("Draw");
    let currentFloorId = selFloorPlanDtls.enc_id

    renderTraversiblePaths(undefined, true)
    const positions = graph.positions;
    const edges = graph.edges
    const pins = []
    const paths = []

    
    const connectedPins = new Set();
    for (let node in graph.edges) {
      
      Object.keys(graph.edges[node]).forEach(neighbor => {
        if (positions[neighbor]) {
          connectedPins.add(neighbor);
        }
      });
    }
    // const connectedLines = findConnectedLines(connectedPins);
    if (connectedPins.size === 0) {
      toast.warning('Please draw the main path first, then try again to generate auto subpaths.')
      return
    }
    const newPoints = []
    // const visibleArea = updateVisibleArea(canvas.current);

    // canvas.current.forEachObject(obj => {
    let objectArray = Array.from(storedObjects?.values()).flat(); 

    objectArray.forEach((obj) => { 
      
      if (objPinNamesOnly.includes(obj.name)
        // && obj.types !== 'text_field'
        && obj.fp_id === currentFloorId) {
        // if (isInsideViewport({ x: obj.left, y: obj.top }, visibleArea)) {
        const pinName = `${obj.name}_${obj.enc_id}`;
        const isConnected = connectedPins.has(pinName);
        if (!isConnected) {
          const point = obj?.getCenterPoint()
          let shortDistance;
          let shortDistPoint;
          let originalLine;

          if (point?.x == 0 && point?.y == 0) return

          Object.keys(edges)?.forEach(key => {
            Object.keys(edges[key])?.forEach(key2 => {
              const lineCoord1 = positions[key]
              const lineCoord2 = positions[key2]
              const shortestPoint = shortestDistanceBetweenLineAndPoint(lineCoord1?.x, lineCoord1?.y, lineCoord2?.x, lineCoord2?.y, point?.x, point?.y, graph.positions)
              if (!key.includes("_") && !key2.includes("_")) {
                if (shortDistance && shortDistPoint) {
                  if (shortDistance > shortestPoint?.distance) {

                    shortDistPoint = shortestPoint?.closestPoint
                    shortDistance = shortestPoint?.distance
                    originalLine = findObjectById(`path$${key}$${key2}`, canvas) || findObjectById(`path$${key2}$${key}`, canvas) || null;
                  }
                  
                } else {
                  shortDistPoint = shortestPoint.closestPoint
                  shortDistance = shortestPoint.distance,
                    originalLine = findObjectById(`path$${key2}$${key}`, canvas) || null;
                  
                }
              }
            })
          })

          newPoints.push({
            point: shortDistPoint,
            pinName,
            pinPoint: point,
            originalLine: originalLine
          })

        }
        // } else {
        //   
        // }
      }
    })
    processAndDrawConnections(newPoints, canvas);
    //.current = false;
  };

  const isInsideViewport = (object, viewport) => {
    return (
      object?.x >= viewport?.x1 &&
      object?.x <= viewport?.x2 &&
      object?.y >= viewport?.y1 &&
      object?.y <= viewport?.y2
    );
  }



  const processAndDrawConnections = (newPoints, canvas) => {
    
    let varToolTraversible
    setToolTraversible((prev) => {
      varToolTraversible = prev
      return prev;
    })
    
    const lineAndPoints = {}
    let sortedNodesArray = []
    newPoints?.forEach(pointDetails => {
      const pointToCreate = pointDetails?.point || "";
      const pointName = pointDetails?.pinName
      const pinCoords = pointDetails?.pinPoint
      let nodeName = generateNodeName(graph);
      const lineId = pointDetails?.originalLine?.id || ""
      
      let lineitem = lineId.split("$").splice(1) || []
      if (lineitem.some((item) => graph.subNode.includes(item)) && lineitem.every((item) => !graph.connectedMainPathNodes.includes(item))) {
        onCreateNode(pointToCreate, nodeName, "subpath");
        
      } else {
        
        onCreateNode(pointToCreate, nodeName, "mainpath");
      }
      if (lineId) {
        if (lineAndPoints[lineId]) {
          lineAndPoints[lineId]?.push({ coord: pointToCreate, pointName: nodeName, pinName: pointName, pinCoords: pinCoords })
        } else {
          lineAndPoints[lineId] = [{ coord: pointToCreate, pointName: nodeName, pinName: pointName, pinCoords: pinCoords }]
        }
      }

    })
    

    Object.keys(lineAndPoints)?.forEach(lineId => {
      const nodesOnLine = lineAndPoints[lineId]
      const [node1, node2] = lineId?.replace('path$', '')?.split('$');
      const lineStartPoint = graph?.positions[node1]
      const lineEndPoint = graph?.positions[node2]
      const sortedNodes = sortCoordinatesAlongLine(nodesOnLine, lineStartPoint, lineEndPoint)
      sortedNodesArray = [...sortedNodesArray, ...sortedNodes];
      
      sortedNodes?.forEach((node, index) => {
        if (index == 0) {
          addConnectionBtwnEdges(node1, node.pointName, graph, canvas)
        } else {
          addConnectionBtwnEdges(sortedNodes[index - 1].pointName, node.pointName, graph, canvas);
        }
      })
      
      addConnectionBtwnEdges(sortedNodes[sortedNodes?.length - 1]?.pointName, node2, graph, canvas);
     
      removeFabricObjectsBId(canvas, lineId)
      const oppositeId = `path$${node2}$${node1}`
      
      removeLine(lineId, graph, canvas);
      removeLine(oppositeId, graph, canvas);
    })

    connetPinAndNodes(sortedNodesArray)
    setOriginalInetoNode(lineAndPoints)
    renderTraversiblePaths(undefined, true)
    setSelTraversibleDetails((prev) => ({
      ...prev,
      edges_data: graph.getEdges(),
      points_data: graph.getPositions(),
      post: true
    }));
    stopPathDrawing();
  };

  const connetPinAndNodes = (newPoints) => {
    
    newPoints?.forEach(pointDetails => {
      const pointToCreate = pointDetails?.pinCoords;
      const pinName = pointDetails?.pinName
      const nodeCoords = pointDetails?.coord
      const nodeName = pointDetails?.pointName
      graph.addSubnode(pinName)
      graph.addSubnode(nodeName)
      onCreateNode(pointToCreate, pinName);
      addConnectionBtwnEdges(pinName, nodeName, graph, canvas,"connectionPathline");
    })
  }

  const setOriginalInetoNode = (lineAndPoints) => {
    // let nodeMap = {};
    // Object.keys(lineAndPoints).forEach((path) => {
    //   lineAndPoints[path].forEach((ele) => {
    //     const nodeName = ele?.pointName;
    //     nodeMap[nodeName] = path;
    //     // graph.addSubPath(nodeName, path)
    //   });
    // });
    

  }


  function shortestDistanceBetweenLineAndPoint(x1, y1, x2, y2, x0, y0, positions, threshold = 1e-5) {
    // Calculate the components of the line vector
    const A = x0 - x1;
    const B = y0 - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    // Calculate the dot product of the point and the line vector
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = dot / len_sq;

    // Find the point on the line closest to the given point
    let xx, yy;

    if (param < 0 || (x1 === x2 && y1 === y2)) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    // Check if the closest point is overlapping with any existing point
    const isOverlapping = isPointOverlapping(xx, yy, positions, threshold);
    if (isOverlapping) {
      // Slightly adjust the closest point to avoid overlap
      // You can adjust along the line vector or perpendicular to it
      xx += threshold;
      yy += threshold;
    }

    // Calculate the distance from the point to the closest point on the line
    const dx = x0 - xx;
    const dy = y0 - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      distance: distance,
      closestPoint: { x: xx, y: yy }
    };
  }

  function isPointOverlapping(x, y, positions, threshold) {
    for (let key in positions) {
      const pos = positions[key];
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < threshold) {
        return true;
      }
    }
    return false;
  }

  function findConnectedLines(nodes) {
    let edges = graph.getEdges();
    let pathSet = new Set();

    nodes.forEach((node) => {
      let id = node;
      if (edges[id]) {
        
        Object.keys(edges[id]).forEach((key) => {
          let path1 = findObjectById(`path$${key}$${id}`, canvas);
          let path2 = findObjectById(`path$${id}$${key}`, canvas);
          if (path1) {
            pathSet.add(path1);
          }
          if (path2) {
            pathSet.add(path2);
          }
        });
      }
    });
    return Array.from(pathSet);
  }


  const handleMiddleMouseClick = (event) => {
    
    if (event.button === 1 || event.buttons === 4) {
      event.preventDefault(); // Prevent the default scroll behavior
      // ------------------------- navigation optimisation -------------------------
      renderTraversiblePaths()

      // ------------------------- navigation optimisation -------------------------

      // ------------------------- canvas clustering code -------------------------
      if (!addNewFloor && !addNewTraversablePath) {
        setMousetrigger((prev) => {
          if (prev === 0) {
            prev = prev + 1
          } else {
            prev = prev - 1
          }
          return prev
        })
      }

      // ------------------------- canvas clustering code over -------------------------
    }
  };

  const handleCreateRectangleShape = (canvas, e) => {
    let projectData
    setProjectSettings((prev) => {
      projectData = prev;
      return prev;
    });

    let strokeColor = projectData?.border_color ?? selFloorPlanDtls?.border_color;
    let strokeWidth = projectData?.border_thick ?? selFloorPlanDtls?.border_thick;
    let fillColor = projectData?.fill_color ?? selFloorPlanDtls?.fill_color;
    
    const mouse = canvas.current.getPointer(e.e);
    if (!mouseDownShape) {
      polyObj = new fabric.Rect({
        name: 'temp',
        left: mouse.x,
        top: mouse.y,
        width: 0,
        height: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: Number(strokeWidth),
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        strokeLineJoin: 'bevil',
        hoverCursor: `crosshair`,
      });

      canvas?.current?.add(polyObj);
      mouseDownShape = true;
    } else {
      // Update the rectangle size on mousemove
      const width = (mouse.x - polyObj.left);
      const height = (mouse.y - polyObj.top);

      polyObj.set({
        width: Math.abs(width),
        height: Math.abs(height),
      });
      const strokeWidth = polyObj.strokeWidth || 0;
      const rectPoints = [
        { x: polyObj.left + strokeWidth / 2, y: polyObj.top + strokeWidth / 2 },
        { x: polyObj.left + polyObj.width + strokeWidth / 2, y: polyObj.top + strokeWidth / 2 },
        { x: polyObj.left + polyObj.width + strokeWidth / 2, y: polyObj.top + polyObj.height + strokeWidth / 2 },
        { x: polyObj.left + strokeWidth / 2, y: polyObj.top + polyObj.height + strokeWidth / 2 }
      ];
      // console.log(polyObj, 'polyObj')
      removeFabricObjectsByName(canvas, "tracing_obj_length");
      showObjLength(polyObj, rectPoints, canvas)
      // tracingLengthZoomLevel(canvas, canvas.current.getZoom())
      // polyObj.setCoords();
      canvas?.current?.renderAll();
    }
  }

  const handleCompleteRectangleShape = (evt) => {
    // const rectPoints = [
    //   { x: polyObj.left, y: polyObj.top },
    //   { x: polyObj.left + polyObj.width, y: polyObj.top },
    //   { x: polyObj.left + polyObj.width, y: polyObj.top + polyObj.height },
    //   { x: polyObj.left, y: polyObj.top + polyObj.height }
    // ];

    const strokeWidth = polyObj.strokeWidth || 0;
    const rectPoints = [
      { x: polyObj.left + strokeWidth / 2, y: polyObj.top + strokeWidth / 2 },
      { x: polyObj.left + polyObj.width + strokeWidth / 2, y: polyObj.top + strokeWidth / 2 },
      { x: polyObj.left + polyObj.width + strokeWidth / 2, y: polyObj.top + polyObj.height + strokeWidth / 2 },
      { x: polyObj.left + strokeWidth / 2, y: polyObj.top + polyObj.height + strokeWidth / 2 }
    ];

    removeFabricObjectsByName(canvas, "temp");
    let tracing = new fabric.Polygon(rectPoints, {
      objectCaching: false,
      id: new Date().toString(),
      fill: polyObj.fill,
      stroke: polyObj.stroke,
      strokeWidth: polyObj.strokeWidth,
      originX: "center",
      originY: "center",
      selectable: false,
      name: "tracing",
      position: "absolute",
      zIndex: 2000,
      perPixelTargetFind: true,
      hoverCursor: `crosshair`,
      evented: true,
      strokeLineJoin: 'bevil',

    });
    // console.log(tracing, 'tracing')
    canvas?.current?.add(tracing);
    canvas.current.renderAll()
    removeFabricObjectsByName(canvas, "tracing_obj_length");
    // showObjLength(polyObj, rectPoints, canvas)
    setTracings((prev) => [...prev, { vertices: rectPoints }]);
    updateTracing(canvas, setTracings, setTracingIntialValue, postTrasing);
    polyObj = '';
    mouseDownShape = false;

  }

  const handleCreateTriangleShape = (canvas, e) => {
    let projectData;
    setProjectSettings((prev) => {
      projectData = prev;
      return prev;
    });

    let strokeColor = projectData?.border_color ?? selFloorPlanDtls?.border_color;
    let strokeWidth = projectData?.border_thick ?? selFloorPlanDtls?.border_thick;
    let fillColor = projectData?.fill_color ?? selFloorPlanDtls?.fill_color;

    const mouse = canvas.current.getPointer(e.e);
    if (!mouseDownShape) {
      const initialX = mouse.x;
      const initialY = mouse.y;
      polyObj = new fabric.Triangle({
        name: 'temp',
        left: initialX,
        top: initialY,
        width: 0,
        height: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: Number(strokeWidth),
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        strokeLineJoin: 'bevil',
        hoverCursor: 'crosshair',
      });

      canvas?.current?.add(polyObj);
      mouseDownShape = true;
    } else {
      const width = mouse.x - polyObj.left;
      const height = mouse.y - polyObj.top;

      polyObj.set({
        width: Math.abs(width),
        height: Math.abs(height),
      });
      polyObj.setCoords();
      canvas?.current?.renderAll();
    }
  }

  const handleCompleteTriangleShape = () => {
    const trianglePoints = [
      { x: polyObj.left, y: polyObj.top + polyObj.height },
      { x: polyObj.left + polyObj.width / 2, y: polyObj.top },
      { x: polyObj.left + polyObj.width, y: polyObj.top + polyObj.height }
    ];

    removeFabricObjectsByName(canvas, "temp");
    let tracing = new fabric.Polygon(trianglePoints, {
      objectCaching: false,
      id: new Date().toString(),
      fill: polyObj.fill,
      stroke: polyObj.stroke,
      strokeWidth: polyObj.strokeWidth,
      originX: "center",
      originY: "center",
      selectable: false,
      name: "tracing",
      position: "absolute",
      zIndex: 2000,
      perPixelTargetFind: true,
      hoverCursor: 'crosshair',
      evented: true,
      strokeLineJoin: 'bevil',
    });
    canvas?.current?.add(tracing);
    canvas.current.renderAll();
    setTracings((prev) => [...prev, { vertices: trianglePoints }]);
    updateTracing(canvas, setTracings, setTracingIntialValue, postTrasing);
    polyObj = '';
    mouseDownShape = false;
  }

  const handleCreateCircleShape = (canvas, e) => {
    let projectData;
    setProjectSettings((prev) => {
      projectData = prev;
      return prev;
    });

    let strokeColor = projectData?.border_color ?? selFloorPlanDtls?.border_color;
    let strokeWidth = projectData?.border_thick ?? selFloorPlanDtls?.border_thick;
    let fillColor = projectData?.fill_color ?? selFloorPlanDtls?.fill_color;

    const mouse = canvas.current.getPointer(e.e);
    if (!mouseDownShape) {
      const initialX = mouse.x;
      const initialY = mouse.y;
      polyObj = new fabric.Circle({
        name: 'temp',
        left: initialX,
        top: initialY,
        radius: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: Number(strokeWidth),
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        strokeLineJoin: 'bevil',
        hoverCursor: 'crosshair',
      });

      canvas?.current?.add(polyObj);
      mouseDownShape = true;
    } else {
      const radius = Math.sqrt(Math.pow(mouse.x - polyObj.left, 2) + Math.pow(mouse.y - polyObj.top, 2)) / 2;

      polyObj.set({
        radius: radius,
      });
      polyObj.setCoords();
      canvas?.current?.renderAll();
    }
  }

  const handleCompleteCircleShape = () => {
    removeFabricObjectsByName(canvas, "temp");
    const circle = new fabric.Circle({
      objectCaching: false,
      id: new Date().toString(),
      fill: polyObj.fill,
      stroke: polyObj.stroke,
      strokeWidth: polyObj.strokeWidth,
      radius: polyObj.radius,
      selectable: false,
      name: "tracing",
      position: "absolute",
      zIndex: 2000,
      left: polyObj.left,
      top: polyObj.top,
      perPixelTargetFind: true,
      hoverCursor: 'crosshair',
    });
    circle.setCoords();
    canvas?.current?.add(circle);
    canvas.current.renderAll();
    const coords = { x: polyObj.left, y: polyObj.top };
    setTracingCircle((prev) => [...prev, { vertices: coords }]);
    updateTracingCircle(canvas, setTracingCircle, setTracingIntialValue, postTrasingCircle);
    polyObj = '';
    mouseDownShape = false;
  }

  // ------------------------- canvas clustering code -------------------------

  let gridGroup;

  function updateGrid(width, height, cellsize, canvas) {

    const zoomLevel = 1;
    const baseGridSize = cellsize; // Base size for the grid, adjust as needed

    const gridSize = baseGridSize * zoomLevel; // Adjust grid size based on zoom
    const visibleArea = updateVisibleArea(canvas);

    let logicalGrid = divideIntoGridCells(visibleArea, gridSize, zoomLevel);

    // Remove the existing grid if it exists
    if (gridGroup) {
      canvas.remove(gridGroup);
    }

    // Array to store the lines
    const gridElements = [];

    // Create vertical lines
    for (let i = Math.floor(visibleArea.x1 / gridSize) * gridSize; i <= visibleArea.x2; i += gridSize) {
      const verticalLine = new fabric.Line([i, visibleArea.y1, i, visibleArea.y2], {
        stroke: 'red',
        strokeWidth: 1,
        selectable: false,
        evented: false
      });
      gridElements.push(verticalLine);

      // Mark points at intersections with horizontal lines
      // for (let j = Math.floor(visibleArea.y1 / gridSize) * gridSize; j <= visibleArea.y2; j += gridSize) {
      //   const point = new fabric.Circle({
      //     left: i,
      //     top: j,
      //     radius: 3,
      //     fill: 'blue',
      //     selectable: false,
      //     evented: false,
      //     originX: 'center',
      //     originY: 'center'
      //   });
      //   gridElements.push(point); // Add point to the array

      //   //   const coordinatesText = new fabric.Text(`(${i}, ${j})`, {
      //   //     left: i + 5, // Offset the text a bit to the right of the point
      //   //     top: j - 10, // Offset the text slightly above the point
      //   //     fontSize: 12,
      //   //     fill: 'black',
      //   //     selectable: false,
      //   //     evented: false,
      //   //     originX: 'left',
      //   //     originY: 'bottom'
      //   // });
      //   // gridElements.push(coordinatesText); // Add text to the array
      // }
    }

    // Create horizontal lines within the visible area
    for (let j = Math.floor(visibleArea.y1 / gridSize) * gridSize; j <= visibleArea.y2; j += gridSize) {
      const horizontalLine = new fabric.Line([visibleArea.x1, j, visibleArea.x2, j], {
        stroke: 'red',
        strokeWidth: 1,
        selectable: false,
        evented: false
      });
      gridElements.push(horizontalLine);
    }

    // Create a group of grid lines and points, and add it to the canvas
    gridGroup = new fabric.Group(gridElements, {
      selectable: false,
      evented: false
    });

    // canvas.add(gridGroup);    
    // canvas.sendToBack(gridGroup);// Send grid to back

    // Render the canvas
    canvas.renderAll();
    return logicalGrid
  }

  const clusturGroup = (fabricCanvas, floor_id) => {
    
    let activeTab;
    setActiveTab((prev) => {
      activeTab = prev
      return prev
    })

    let addNewFloorVar;
    setAddNewFloor((prev) => {
      addNewFloorVar = prev;
      return prev;
    });
    if (!addNewFloorVar && activeTab !== "traversable") {
      let viewport = updateVisibleArea(canvas.current);
      // const grid = divideIntoGridCells(viewport, cellSize) || [];
      let grid = updateGrid(
        viewport?.x2,
        viewport.y2,
        cellSize,
        canvas.current
      );

      // drawVisibleAreaRectangle(canvas.current,viewport)

      const clusters = groupLocationsInGrid(
        grid,
        cellSize,
        canvas.current,
        viewport,
        floor_id
      );

      clustersMap.current = new Map(
        clusters.map((cluster) => [cluster.object, cluster])
      );
      // console.log(clusters, "clusters")
      updateVisibleClusters(canvas.current, canvas.current.getZoom(), viewport);
    }
  };

  const divideIntoGridCells = (viewport, cellSize, zoomLevel = 1) => {
    const { x1, y1, x2, y2 } = viewport;

    // Adjust the viewport to snap to the nearest multiple of 250 (cell size)
    const snappedX1 = snapToGrid(x1, cellSize);
    const snappedY1 = snapToGrid(y1, cellSize);
    const snappedX2 = snapToGrid(x2, cellSize);
    const snappedY2 = snapToGrid(y2, cellSize);

    // Adjust cell size based on zoom level
    const adjustedCellSize = cellSize * zoomLevel;

    // Calculate the number of rows and columns based on the adjusted viewport size
    const rows = Math.ceil((snappedY2 - snappedY1) / adjustedCellSize);
    const cols = Math.ceil((snappedX2 - snappedX1) / adjustedCellSize);

    // Create a grid that stores corner points for each cell
    const gridCells = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => {
        const xStart = snappedX1 + col * adjustedCellSize;
        const yStart = snappedY1 + row * adjustedCellSize;
        const xEnd = xStart + adjustedCellSize;
        const yEnd = yStart + adjustedCellSize;

        const topLeft = { x: xStart, y: yStart };
        const topRight = { x: xEnd, y: yStart };
        const bottomLeft = { x: xStart, y: yEnd };
        const bottomRight = { x: xEnd, y: yEnd };

        // Return cell with its corner coordinates and an empty array for items
        return { corners: { topLeft, topRight, bottomLeft, bottomRight }, items: [] };
      })
    );
    return gridCells;
  };

  const snapToGrid = (value, gridSize) => {
    return Math.ceil(value / gridSize) * gridSize;
  };

  const updateVisibleArea = (fabricCanvas) => {
    const transform = fabricCanvas.viewportTransform;
    if (transform) {
      const viewportWidth = window.innerWidth + 250;
      const viewportHeight = window.innerHeight + 250;

      const topLeft = fabric.util.transformPoint({ x: 0, y: 0 }, fabric.util.invertTransform(transform));
      const bottomRight = fabric.util.transformPoint({ x: viewportWidth, y: viewportHeight }, fabric.util.invertTransform(transform));

      const visibleArea = {
        x1: topLeft.x - 250,
        y1: topLeft.y - 250,
        x2: bottomRight.x,
        y2: bottomRight.y,
      };

      return visibleArea;
    }
  };

  const drawVisibleAreaRectangle = (fabricCanvas, visibleArea) => {
    const rect = new fabric.Rect({
      left: visibleArea.x1,
      top: visibleArea.y1,
      width: visibleArea.x2 - visibleArea.x1,
      height: visibleArea.y2 - visibleArea.y1,
      fill: 'rgba(0, 0, 0, 0)', // Transparent fill
      stroke: 'rgba(0, 0, 255, 1)', // Red border for visibility
      strokeWidth: 2,
      name: "drawVisibleAreaRectangle"
    });

    // Remove existing visible area rectangles before adding a new one
    const existingRects = fabricCanvas.getObjects('rect').filter(obj => obj.name === 'drawVisibleAreaRectangle');
    existingRects.forEach(rect => fabricCanvas.remove(rect));

    fabricCanvas.add(rect);
    fabricCanvas.sendToBack(rect);
    fabricCanvas.renderAll();
  };

  const groupLocationsInGrid = (
    grid,
    cellSize,
    fabricCanvas,
    viewport,
    floor_id
  ) => {
    let floor;
    if (floor_id) {
      floor = floor_id;
    } else {
      // setFloorID((prev) => {
      //   floor = prev;
      //   return prev;
      // });
    }
    let storedItem = new Map();
    setStoredObjects((prev) => {
      storedItem = prev;
      return prev;
    });
    
    const combinedArray = storedObjects?.values()
      ? Array.from(storedObjects?.values())?.flat()
      : [];

    combinedArray?.forEach((object) => {
      const validTypes = [
        "product",
        "location",
        "boundary",
        "amenity",
        "beacon",
        "safety",
        "vertical",
      ];
      let object_FloorID;
      if (object.name === "boundary") {
        let obj = storedObjects.get(`${object?.id?.split("_")[1]}_${floor}`);
        if (obj) {
          let locationPin = obj.find((item) => item.isBoundary);
          object_FloorID = locationPin?.fp_id;
        }
      } else {
        object_FloorID = object.fp_id;
      }
      if (
        validTypes.includes(object.name) &&
        (object.type === "group" || object.type === "polygon") &&
        object_FloorID === floor
      ) {
        let boundingRect;
        let bounderyPinObject
        if (object.name === "boundary") {
          bounderyPinObject = combinedArray.find((item) => {
            if ((item.enc_id == object?.id?.split("_")[1]) && (item.types != "text_field")) {
              return item
            }
          })
          if (obj) {
            boundingRect = obj.getBoundingRect(true)
          } else {
            boundingRect = object.getBoundingRect(true);
          }
        } else {
          boundingRect = object.getBoundingRect(true);
        }
        const isInViewport = isObjectInViewport(boundingRect, viewport);


        if (isInViewport) {
          // Loop through the grid cells
          for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
              const cell = grid[row][col];
              let checkObjectInCell
              if (object.name === "boundary") {
                checkObjectInCell = isObjectInCell(cell.corners, bounderyPinObject)
              } else {
                checkObjectInCell = isObjectInCell(cell.corners, object)
              }
              if (checkObjectInCell) {
                let isItemPresent;
                if (object.name === "boundary") {
                  isItemPresent = findItemWithIndex(
                    grid,
                    parseInt(object?.id?.split("_")[1])
                  );
                } else {
                  isItemPresent = findItemWithIndex(grid, object.enc_id);
                }

                if (isItemPresent) {
                  let newCell = grid[isItemPresent.row][isItemPresent.col];
                  newCell.items.push(object);
                } else {
                  cell.items.push(object);
                }
                break; // Object found a cell, no need to check further cells
              }
            }
          }
        } else {
          fabricCanvas.remove(object);
        }
      }
    });
    return grid
      .flatMap((row, rowIndex) =>
        row.flatMap((cell, colIndex) => {
          if (cell.items.length > 1) {
            const uniqueEncIds = new Set(
              cell.items.map((obj) => {
                if (obj.name === "boundary") {
                  return parseInt(obj?.id?.split("_")[1]);
                } else {
                  return obj.enc_id;
                }
              })
            );
            

            if (uniqueEncIds.size > 1) {
              let isEdited = cell.items.filter((item) => item.boundaryGroup)
              let changedArray = []

              // Create a cluster only if there are multiple unique enc_ids
              const { topLeft, bottomRight } = cell.corners;

              const centerX = (topLeft.x + bottomRight.x) / 2;
              const centerY = (topLeft.y + bottomRight.y) / 2;

              const calculateAveragePoint = (objectItems) => {
                if (objectItems.length === 0) return null
                objectItems = objectItems.filter((obj) => obj.name != "boundary")
                // {
                //     x: centerX,
                //     y: centerY,
                //   };
            
                let totalLeft = 0;
                let totalTop = 0;
            
                objectItems.forEach(item => {
                  // if (item.name != "boundary") {
                    totalLeft += item.left;
                    totalTop += item.top;
                  // }
                });
            
                const averageLeft = totalLeft / objectItems.length;
                const averageTop = totalTop / objectItems.length;
            
                return { x: averageLeft, y: averageTop };
              };
              
              // const clusterCenter = {
              //   x: centerX,
              //   y: centerY,
              // };

              const clusterCenter = calculateAveragePoint(cell.items)

              
              //     x: centerX,
              //     y: centerY,
              //   },"cell.itemscell.items")
              
              if (isEdited.length > 0) {
                changedArray = cell.items.filter((item) => !item.boundaryGroup)
                const newUniqueEncIds = new Set(
                  changedArray.map((obj) => {
                    if (obj.name === "boundary") {
                      return parseInt(obj?.id?.split("_")[1]);
                    } else {
                      return obj.enc_id;
                    }
                  })
                );
                if (newUniqueEncIds.size > 1) {
                  return [
                    {
                      objType: "cluster",
                      object: new fabric.Circle({
                        left: clusterCenter.x,
                        top: clusterCenter.y,
                        radius: 15,
                        fill: "rgba(250, 246, 25,0.8)",
                        originX: "center",
                        originY: "center",
                        selectable: false,
                      }),
                      points: changedArray,
                    },
                    {
                      objType: "point",
                      object: new fabric.Circle({
                        left: clusterCenter.x,
                        top: clusterCenter.y,
                        radius: 5,
                        fill: "green",
                        originX: "center",
                        originY: "center",
                      }),
                      points: isEdited,
                    }
                  ]
                } else {
                  return [
                    {
                      objType: "point",
                      object: new fabric.Circle({
                        left: clusterCenter.x,
                        top: clusterCenter.y,
                        radius: 5,
                        fill: "green",
                        originX: "center",
                        originY: "center",
                      }),
                      points: changedArray,
                    },
                    {
                      objType: "point",
                      object: new fabric.Circle({
                        left: clusterCenter.x,
                        top: clusterCenter.y,
                        radius: 5,
                        fill: "green",
                        originX: "center",
                        originY: "center",
                      }),
                      points: isEdited,
                    }
                  ]

                }
              } else {
                return {
                  objType: "cluster",
                  object: new fabric.Circle({
                    left: clusterCenter.x,
                    top: clusterCenter.y,
                    radius: 15,
                    fill: "rgba(250, 246, 25,0.8)",
                    originX: "center",
                    originY: "center",
                    selectable: false,
                  }),
                  points: cell.items,
                };
              }
            } else {
              // If all objects have the same enc_id, return them individually
              return cell.items.map((obj) => ({
                objType: "point",
                object: new fabric.Circle({
                  left: obj.left,
                  top: obj.top,
                  radius: 5,
                  fill: "green",
                  originX: "center",
                  originY: "center",
                }),
                points: [obj],
              }));
            }
          } else if (cell.items.length === 1) {
            return {
              objType: "point",
              object: new fabric.Circle({
                left: cell.items[0].left,
                top: cell.items[0].top,
                radius: 5,
                fill: "green",
                originX: "center",
                originY: "center",
              }),
              points: cell.items,
            };
          } else {
            return null;
          }
        })
      )
      .filter(Boolean);
  };

  const findItemWithIndex = (arr, id) => {
    for (let row = 0; row < arr.length; row++) {
      for (let col = 0; col < arr[row].length; col++) {
        const items = arr[row][col].items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].enc_id === id) {
            return {
              // item: items[i],
              row: row,
              col: col,
              // indexInItems: i // Index within the `items` array
            };
          }
        }
      }
    }
    return null;
  };

  const isObjectInCell = (rectangle, point) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = rectangle;

    // Calculate the bounding box of the rectangle
    const rectLeft = topLeft.x;
    const rectRight = topRight.x;
    const rectTop = topLeft.y;
    const rectBottom = bottomLeft.y;

    // Extract the bounding box of the point (group)
    const pointLeft = point.left;
    const pointTop = point.top;
    const pointRight = pointLeft + point.width;
    const pointBottom = pointTop + point.height;

    // // Check if the point's bounding box is within the rectangle
    // const isWithinXBounds = (pointLeft >= rectLeft && pointRight <= rectRight);
    // const isWithinYBounds = (pointTop >= rectTop && pointBottom <= rectBottom);

    // Calculate the point's center
    const pointCenterX = pointLeft + point.width / 2;
    const pointCenterY = pointTop + point.height / 2;

    // Check if the center of the object is within the rectangle
    const isCenterInside =
      pointCenterX >= rectLeft &&
      pointCenterX <= rectRight &&
      pointCenterY >= rectTop &&
      pointCenterY <= rectBottom;
    return isCenterInside;
    // return isWithinXBounds && isWithinYBounds;
  };

  const isObjectInViewport = (object, viewport) => {
    const objLeft = object.left;
    const objTop = object.top;
    const objRight = object.left + object.width;
    const objBottom = object.top + object.height;

    const viewLeft = viewport.x1;
    const viewTop = viewport.y1;
    const viewRight = viewport.x2;
    const viewBottom = viewport.y2;

    // Check if there is any overlap between the object's bounding box and the viewport
    return !(
      objRight < viewLeft ||
      objLeft > viewRight ||
      objBottom < viewTop ||
      objTop > viewBottom
    );
  };

  const updateVisibleClusters = (fabricCanvas, zoom, visibleArea) => {
    const objectsToKeep = new Set();

    clustersMap.current.forEach((cluster) => {
      const clusterCenter = {
        x: cluster.object.left,
        y: cluster.object.top,
      };
      const isClusterInViewport = checkClusterInViewport(
        clusterCenter,
        cluster.object.radius,
        visibleArea
      );

      if (isClusterInViewport && zoom < zoomThreshold) {
        if (cluster.objType === "point") {
          cluster.points.forEach((point) => {
            if (!visibleObjects.current.has(point)) {
              fabricCanvas.add(point);
              if (point.name === "boundary") {
                // point.set('fill', 'red');
                
              }
              visibleObjects.current.add(point);
            }
            objectsToKeep.add(point);
          });
        } else if (cluster.objType === "cluster") {
          if (!visibleObjects.current.has(cluster.object)) {
            fabricCanvas.add(cluster.object);
            visibleObjects.current.add(cluster.object);
            cluster.points.forEach((point) => {
              let objToremove;
              if (point.name === "boundary") {
                objToremove = canvas.current
                  .getObjects()
                  ?.filter((obj) => obj.id === point.id);
              } else {
                objToremove = canvas.current
                  .getObjects()
                  ?.filter((obj) => obj.enc_id === point.enc_id);
              }
              objToremove?.map((item) => {
                fabricCanvas.remove(item);
              });
            });
          }
          objectsToKeep.add(cluster.object);
        }
      } else if (isClusterInViewport && zoom >= zoomThreshold) {
        cluster.points.forEach((point) => {
          if (!visibleObjects.current.has(point)) {
            canvas.current.add(point);
            if (point.name === "boundary") {
              // point.set('fill', 'red');
              
            }
            visibleObjects.current.add(point);
          }
          objectsToKeep.add(point);
        });
      } else {
        
        cluster.points.forEach((point) => {
          fabricCanvas.remove(point);
        });
      }
    });

    // Remove objects that are no longer visible
    visibleObjects.current.forEach((obj) => {
      if (!objectsToKeep.has(obj)) {
        fabricCanvas.remove(obj);
        visibleObjects.current.delete(obj);
      }
    });


    // fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  };

  

  function isCornerInsideViewport(corner, viewport) {
    const { x, y } = corner;
    return (x >= viewport.x1 && x <= viewport.x2) && (y >= viewport.y1 && y <= viewport.y2);
  }

  const checkClusterInViewport = (
    clusterCenter,
    clusterRadius,
    visibleArea
  ) => {

    const result = clusterCenter.x + clusterRadius > visibleArea.x1 &&
      clusterCenter.x - clusterRadius < visibleArea.x2 &&
      clusterCenter.y + clusterRadius > visibleArea.y1 &&
      clusterCenter.y - clusterRadius < visibleArea.y2

    if (!result) {
      const centerPoint = clusterCenter;
      const width = 250;
      const halfWidth = width / 2;

      const corners = {
        topLeft: {
          x: centerPoint.x - halfWidth,
          y: centerPoint.y - halfWidth,
        },
        topRight: {
          x: centerPoint.x + halfWidth,
          y: centerPoint.y - halfWidth,
        },
        bottomLeft: {
          x: centerPoint.x - halfWidth,
          y: centerPoint.y + halfWidth,
        },
        bottomRight: {
          x: centerPoint.x + halfWidth,
          y: centerPoint.y + halfWidth,
        },
      };

      const edges = {
        topLeft: isCornerInsideViewport(corners.topLeft, visibleArea),
        topRight: isCornerInsideViewport(corners.topRight, visibleArea),
        bottomLeft: isCornerInsideViewport(corners.bottomLeft, visibleArea),
        bottomRight: isCornerInsideViewport(corners.bottomRight, visibleArea),
      }

      return Object.values(edges).some(value => value === true)

    }

    return result
  };

  const isObjectInRectangle = (obj, fabricCanvas, viewport) => {
    const viewportTransform = fabricCanvas.viewportTransform;
    const zoom = fabricCanvas.getZoom();

    // Transform the object's coordinates to the canvas's current zoom and translation
    const x = (obj.left - viewportTransform[4]) / zoom;
    const y = (obj.top - viewportTransform[5]) / zoom;

    // Check if the object's coordinates are within the given viewport bounds
    const isInViewport =
      x >= viewport.x1 &&
      x <= viewport.x2 &&
      y >= viewport.y1 &&
      y <= viewport.y2;

    

    return isInViewport;
  };

  // ------------------------- canvas clustering code over -------------------------


  const checkConditionDrag = () => {
    const condition = activeTab === 'traversable'
      // ? toolTraversible === 'Drag_pin'
      ? toolTraversible === 'Select'
      : (
        !addNewFloor &&
        !addNewLocation &&
        !addNewProduct &&
        !addNewQrCodeBeacon &&
        !addNewAmenity &&
        !addNewSafety &&
        !addNewVertical &&
        !panTool
      );

    // console.log({addNewFloor,
    //     addNewLocation,
    //     addNewProduct,
    //     addNewQrCodeBeacon,
    //     addNewAmenity,
    //     addNewSafety,
    //     addNewVertical,
    //     panTool},{toolTraversible,activeTab});
    
    return condition;
  };

  function resetCanvasTransform() {
    viewportTransform = undefined;
    // canvas.current.viewportTransform = [1, 0, 0, 0, 1, 0]
    canvas?.current?.absolutePan({ x: 0, y: 0 });
    canvas?.current?.setZoom(1);
    canvas?.current.renderAll();
  }

  const handleKeyBoardPress = (event) => {
    if (event.key === "Escape") {
      if (activeTab === "traversable") {
        removeEmptyNode(canvas, graph, activeTab, isCommonSidebarVisible);
        stopPathDrawing();
        setSelTraversibleDetails((prev) => ({
          ...prev,
          edges_data: graph.getEdges(),
          points_data: graph.getPositions(),
          post: true,
        }));
      }
    } else if (event.keyCode === 46) {
      deleteTracingsByDeleteKey();
    }
    // else if (event?.e?.shiftKey) {
    //     const activeObjects = canvas.current.getActiveObjects();
    //     if (!activeObjects.includes(event.target)) {
    //       canvas.current.discardActiveObject();
    //       const selection = new fabric.ActiveSelection(activeObjects.concat(event.target), {
    //         canvas: canvas.current
    //       });
    //       canvas.current.setActiveObject(selection);
    //       canvas.current.renderAll();
    //     }
    //   } else {
    //     getSelection(event);
    //   }
    // }
    // if (event.ctrlKey && event.key === 'z') {
    //   undoTraversablePath(graph.getPositions(), graph.getEdges())
    // }
  };

  const keyDownHandler = (event) => {
    if (addNewFloor && activeTab == "floorDetails" && event.key === "Escape") {
      event.preventDefault();
    }
    if (event.ctrlKey && event.key === "z") {
      // Undo operation
      if (activeTab == "traversable") {
        undoTraversable();
      }
    } else if (event.ctrlKey && event.key === "y") {
      // Redo operation
      // console.log("Redoing...");
      // redoOperation(positions, edges, redoStack);
    } else if (event.keyCode === 46) {
      
      if (
        activeTab === "traversable" &&
        toolTraversible == "Select" &&
        addNewTraversablePath
      ) {
        deleteSelectedObjects();
      }
      // deleteTracingsByDeleteKey()
    }
    if (activeTab == "floorDetails") {
      if (event.key == "Enter") {
        isEnterKey = true;
      } else {
        isEnterKey = false;
      }
    }
  };

  const onScrollBarMove = (delta) => {
    canvas.current.relativePan(delta);
  };

  const deleteSelectedObjects = () => {
    deleteObjects(
      canvas,
      graph,
      setSelTraversibleDetails,
      setToolTraversible,
      setSelectedPaths,
      checkPinConnectOrNot, true,
      deleteSubPath
    );
  };

  const showLineLength = (objName, cursor) => {

    let toolActive;
    setToolActive((prev) => {
      toolActive = prev;
      return prev;
    });


    /* showing length of polyline */
    let length = 0;
    let center = {};
    for (let i = 1; i < pts.length; i++) {
      const point1 = pts[i - 1];
      const point2 = pts[i];
      const distance = calculateDistance(point1, point2);
      center = {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2,
      };
      length = ((distance * 0.5) / 100) * 10;
    }

    const angle = Math.atan2(
      pts[pts.length - 1]?.y - pts[0]?.y,
      pts[pts.length - 1]?.x - pts[0]?.x
    );
    const textLeft = center.x - (length / 2) * Math.cos(angle);
    const textTop = center.y - (length / 2) * Math.sin(angle);

    const text = new fabric.Text(`${length.toFixed(2)} m`, {
      left: textLeft,
      top: textTop,
      selectable: false,
      // hoverCursor: "auto",
      hoverCursor: toolActive === "Draw" ? `url(${Pencil}) 1 17, auto` : "auto",
      fontSize: 12,
      fontFamily: "Arial",
      fill: "black",
      name: objName,
      originX: "center",
      originY: "center",
      // backgroundColor: "#fbfbfb",
      fontWeight: 700,
    });
    if (cursor) {
      text.hoverCursor = cursor;
    }
    const textOverlay = new fabric.Text(`${length.toFixed(2)} m`, {
      left: textLeft,
      top: textTop,
      selectable: false,
      // hoverCursor: "auto",
      hoverCursor: toolActive === "Draw" ? `url(${Pencil}) 1 17, auto` : "auto",
      fontSize: 12,
      fontFamily: "Arial",
      fill: "black",
      name: objName,
      originX: "center",
      originY: "center",
      // backgroundColor: "#fbfbfb",
      fontWeight: 700,
      // angle: angle * (180 / Math.PI) + 10,
      stroke: "white",
      strokeWidth: 3,
    });
    if (cursor) {
      textOverlay.hoverCursor = cursor;
    }
    canvas.current?.add(textOverlay);
    canvas.current?.add(text);
    canvas.current.bringToFront(text);
  };

  const undoTraversable = () => {
    // console.log(traversibleHistory, "traversibleHistory");
    // console.log(lastTraversibleUndoIndex, "lastTraversibleUndoIndex");
    if (lastPt > 1) {
      stopPathDrawing();
      return;
    }

    if (traversibleHistory.length) {
      if (lastTraversibleUndoIndex == undefined) {
        lastTraversibleUndoIndex = traversibleHistory.length - 1;
      }
      let indexData = traversibleHistory[lastTraversibleUndoIndex];
      // console.log(indexData, "indexData");
      if (indexData?.action == "create") {
        if (indexData?.type == "nodeAndLine") {
          // console.log("from here 7");
          removeNode(indexData.data.nodeName, true, graph, canvas);
          if (indexData.data.key1 && indexData.data.key2) {
            removeLine(
              `path$${indexData.data.key1}$${indexData.data.key2}`,
              graph,
              canvas
            );
          }
        } else if (indexData?.type == "line") {
          if (indexData.data.key1 && indexData.data.key2) {
            removeLine(
              `path$${indexData.data.key1}$${indexData.data.key2}`,
              graph,
              canvas
            );
          }
        }
        lastTraversibleUndoIndex--;
      } else if (indexData?.action == "delete") {
        if (indexData?.type == "nodeAndLine") {
          onCreateNode(indexData.data.nodePosition, indexData.data.nodeName);
          // if (indexData.data.key1 && indexData.data.key2) {
          //   removeLine(`path$${indexData.data.key1}$${indexData.data.key2}`);
          // }
        }
      }
      setSelTraversibleDetails((prev) => ({
        ...prev,
        edges_data: graph.getEdges(),
        points_data: graph.getPositions(),
        post: true,
      }));
    }
  };


  const stopPathDrawing = () => {
    poly = false;
    polyBtn = "";
    lastPt = 1;
    mouseDown = false;
    pts = [];
    key1 = null;
    key2 = null;
    drawingLine = undefined;
    //------------------- restric subpath drawing -------------------
    nodeNameArray = [];
    nodeTypeArray = []
    //------------------- restric subpath drawing -------------------
    removeFabricObjectsByName(canvas, "line_starter_poly");
    obj = "";
    /* Remove tracing length */
    removeFabricObjectsByName(canvas, "length_text_temp");
    removeFabricObjectsByName(canvas, "length_text");
    removeFabricObjectsByName(canvas, "tracing_obj_length");

    setTracingIntialValue(projectSettings);
    canvas.current?.discardActiveObject();
    canvas.current?.renderAll();
    renderTraversiblePaths()
  };


  const showCornerPoints = (obj) => {
    if (obj) {
      
      obj.transparentCorners = false;
      var lastControl = obj?.points?.length - 1;
      obj.cornerStyle = "circle";
      obj.cornerColor = "rgba(0,0,255,0.5)";
      obj.cornerSize = 8;
      obj.controls = obj.points.reduce(function (acc, point, index) {
        acc["p" + index] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(
            index > 0 ? index - 1 : lastControl,
            actionHandler
          ),
          actionName: "modifyPolygon",
          pointIndex: index,
        });
        return acc;
      }, {});
    } else {
      cornersVisible.current = false
      // console.log("obj is not present")
    }
  };



  const RemoveObjectFromStoredObjects = (obj, name) => {
    

    let nameWithfloodId;
    if (obj?.name === "location") {
      nameWithfloodId = `${obj?.enc_id}_${obj?.fp_id}`
    } else if (name) {
      nameWithfloodId = `${obj?.enc_id}_${floorID}`
      
    } else {
      nameWithfloodId = `${obj?.enc_id}_${obj?.enc_floor_plan_id}`
    }
    

    setStoredObjects((prevStoredObjects) => {
      const updatedStoredObjects = new Map(prevStoredObjects);
      updatedStoredObjects.delete(nameWithfloodId);
      return updatedStoredObjects
    });
  }


  const textStyleHandler = (type, value) => {
    const obj = canvas.current.getActiveObject();
    if (obj) {
      // console.log(obj, "selected Text");
      if (type == "fontFamily") {
        if (standardFonts.includes(value)) {
          obj.set(type, value);
        } else {
          var myfont = new FontFaceObserver(value);
          myfont
            .load()
            .then(() => {
              obj.set(type, value);
            })
            .catch(function (e) {
              // console.log(e, "font failed");
            });
        }
      } else if (type == "fill") {
        obj.set(type, value);
      }
      else if (type == "fontSize") {
        obj.set(type, value);
        // console.log(obj, value, "selected Text");

      }
      else if (type == "fontWeight") {
        obj.set(type, value);
        // console.log(obj, value, "selected Text");

      }
      else if (type == "textAlign") {
        obj.set(type, value);
        // console.log(obj, value, "selected Text");

      }
      canvas.current.renderAll();
      updateText(canvas, setTexts, postTexts);
    }
  };

  /* Product pin edit */  
  const onEditProduct = async (row, type) => {    
    editProduct(
      row,
      setAddNewProduct,
      setImages,
      setSpecifications,
      setwebsiteLinks,
      setSelProductDtls,
      type
    );
  };

  /* Beacon pin edit */
  const onEditBeacon = async (row) => {
    editBeacon(row, setSelBeaconDtls, setAddNewQrCodeBeacon);
  };

  /* transport pin edit */
  const onEditVerticaltransport = async (row, type) => {
    editVerticaltransport(
      row,
      setVerticalIcons,
      setAddNewVertical,
      setselVerticalDtls,
      handleEnableDisable,
      type
    );
  };

  /* Amenity pin edit */
  const onEditAmenity = async (row) => {
    editAmenity(row, setAddNewAmenity, setSelAmenityDtls);
  };

  /* Safety pin edit */
  const onEditSafety = async (row) => {
    setTimeout(() => {
      editSafety(row, setSafetyIcons, setAddNewSafety, setSelSafetyDtls);
    }, 700);
  };

  const onEditAd = async (row) => {
    editAd(row, setAddNewAd, setSelAd);
  };

  /* Location pin edit */
  const onEditLocation = async (location, type) => {
    editLocation(
      location,
      setAddNewLocation,
      setPromotions,
      setIsBoundary,
      setSelLocationDtls,
      setwebsiteLinks,
      setHours,
      type,
    );
  };



  function polygonPositionHandler(dim, finalMatrix, fabricObject) {
    var x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
      y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;

    return fabric.util.transformPoint(
      { x: x, y: y },
      fabric.util.multiplyTransformMatrices(
        fabricObject.canvas?.viewportTransform ?? [1, 0, 0, 1, 0, 0],
        fabricObject.calcTransformMatrix()
      )
    );
  }

  function actionHandler(eventData, transform, x, y) {
    var polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(
        new fabric.Point(x, y),
        "center",
        "center"
      ),
      polygonBaseSize = getObjectSizeWithStroke(polygon),
      size = polygon._getTransformedDimensions(0, 0),
      finalPointPosition = {
        x:
          (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
          polygon.pathOffset.x,
        y:
          (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
          polygon.pathOffset.y,
      };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    if (activeTab == "floorDetails") {
      removeFabricObjectsByName(canvas, "tracing_obj_length");
      const points = getPolygonVertices(polygon);
      // showObjLength("_", polygon.points,canvas);
      showObjLength("_", points, canvas);
      tracingLengthZoomLevel(canvas, canvas.current.getZoom());
      canvas.current.setZoom(canvas.current.getZoom())
    }
    return true;
  }

  /* original */
  const canvasBackgroundImageHandler = (
    imgSrc,
    zoom,
    bgColor,
    scaleX,
    scaleY
  ) => {
    canvasBGimage(
      canvas,
      projectSettings,
      addNewFloor,
      selFloorPlanDtls,
      canvasContainerRef,
      activeTab,
      imgSrc,
      zoom,
      bgColor,
      scaleX,
      scaleY,
      zoomInOut,
      svgFile
    );
  };

  const onSelectReferanceImage = (e,replace=false) => {
    const pic = e.target.files[0]
    setFileKey(Date.now());
    if (pic) {
      
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(pic.type)) {
        toast.error('Please check the supported formats of the reference image and try again.')
      } else {
        if (pic) {
          // if (pic.type === 'image/svg+xml') {
          //   const reader = new FileReader();

          //   reader.onload = function (event) {
          //     const svgData = event.target.result;

          //     // Create a DOM parser to extract SVG dimensions
          //     const parser = new DOMParser();
          //     const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
          //     const svgElement = svgDoc.documentElement;

          //     // Get the width and height from the SVG attributes (or viewBox if width/height is not set)
          //     const width = svgElement.getAttribute('width') || svgElement.viewBox.baseVal.width;
          //     const height = svgElement.getAttribute('height') || svgElement.viewBox.baseVal.height;

          //     if (!width || !height) {
          //       toast.error('SVG does not have valid width/height or viewBox attributes.');
          //       return;
          //     }

          //     // Define a high scale factor for maximum quality
          //     const scaleFactor = 1.5;
          //     const highResWidth = width * scaleFactor;
          //     const highResHeight = height * scaleFactor;

          //     // Create a high-resolution canvas
          //     const canvas = document.createElement('canvas');
          //     canvas.width = highResWidth;
          //     canvas.height = highResHeight;

          //     const ctx = canvas.getContext('2d');

          //     // Clear the canvas (not really necessary since we aren't drawing a background)
          //     ctx.clearRect(0, 0, canvas.width, canvas.height);

          //     const img = new Image();
          //     img.onload = function () {
          //       // Draw the SVG image scaled to the higher resolution
          //       ctx.drawImage(img, 0, 0, highResWidth, highResHeight);

          //       // Convert the canvas content to PNG (preserving transparency)
          //       const dataURL = canvas.toDataURL('image/png'); // Use PNG to preserve quality

          //       // Create a file from the data URL
          //       fetch(dataURL)
          //         .then(res => res.blob())
          //         .then(blob => {
          //           const convertedImage = new File([blob], 'converted-image.png', { type: 'image/png' });

          //           // Replace the `pic` object with the converted image
          //           setFloorPlanModal(true);
          //           setSelFloorPlanDtls((prev) => ({
          //             ...prev,
          //             imageScale: URL.createObjectURL(convertedImage),
          //             image: convertedImage,
          //             imageType: 'referance-image',
          //             show_image: 1
          //           }));
          //         });
          //     };

          //     // Set the source of the image to the SVG data
          //     img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
          //   };

          //   // Read the SVG file as text to preserve exact content
          //   reader.readAsText(pic);
          // } else {
          // Handle non-SVG files normally
          
          if (replace) {            
            
            setSelFloorPlanDtls((prev) => ({
              ...prev,
              imageScale: URL.createObjectURL(pic),
              image: pic,
              imageType: 'referance-image',
              show_image: 1,
              // refeimageType:type
            }));
          } else {
            setFloorPlanModal(true);
            setSelFloorPlanDtls((prev) => ({
              ...prev,
              imageScale: URL.createObjectURL(pic),
              image: pic,
              imageType: 'referance-image',
              show_image: 1,
              // refeimageType:type
            }));
          }
          
          // setSvgFile(pic)
        }
        // }
      }
    }
  }
 
  const importSvg = (e) => { 
    const pic = e.target.files[0]
    setFileKey(Date.now());
    if (pic) {
      const allowedTypes = ['image/svg+xml'];
      if (!allowedTypes.includes(pic.type)) {
        toast.error('Please check the supported formats of the reference image and try again.')
      } else {
        if (pic) {
          setFloorPlanModal(true)
          setSelFloorPlanDtls((prev) => ({
            ...prev,
            imageScale: URL.createObjectURL(pic),
            svg_image: pic,
            imageType: 'import-svg'
          }))
        }
      }
    }
  }

  const handleScaleSubmit = (type, values) => {
    
    // if (!values?.points_distance) {
    //   toast.error('Select two points on your floor plan.')
    //   return
    // }
    
    if (!values?.IsImageInsideScreen) {
      toast.error('please possition the image inside the mobile screen.')
      return
    }

    if (type === 'referance-image') {
      setLoadingSacle(true)
      const zoomLevel = (parseFloat(values?.real_world_distance) / parseFloat(values?.points_distance)) * 100;
      // const normalizedDistance = (zoomLevel / 100)
      const normalizedDistance = values?.currentImageData?.scaleX
      setSelFloorPlanDtls((prev) => ({ ...prev, plan: prev?.imageScale, zoom: normalizedDistance,isHighResTiling:true }))
      handlezoomPost(normalizedDistance);
      setZoomInOut(normalizedDistance)
      // setTimeout(() => {
      if (selFloorPlanDtls?.image?.type === 'image/svg+xml') {
        handlePostSvgFileForRefImage(selFloorPlanDtls)
        setSelFloorPlanDtls((prev) => ({ ...prev, plan: null, zoom: normalizedDistance }))

      }
      document.getElementById('FloorPlanAddBtn')?.click()

      // setTimeout(() => {
      //   setFloorPlanModal(false)
      // }, 1000);
      // setSelImageOrSvgValues()
      // }, 1000);

    } else {
      setLoadingSacle(true)
      const zoomLevel = (parseFloat(values?.real_world_distance) / parseFloat(values?.points_distance)) * 100;
      // const resizeSacle = (zoomLevel / 100)
      const resizeSacle = values?.currentImageData?.scaleX
      
      // return
      getTracingFromSvg(selFloorPlanDtls?.svg_image, resizeSacle)
      // setSelFloorPlanDtls((prev) => ({ ...prev, plan: null, refImg: '', image: null, show_image: 0 }))
      setTimeout(() => {
        document.getElementById('FloorPlanAddBtn')?.click()
        // setFloorPlanModal(false)
        // setSelImageOrSvgValues()
      }, 1000);

    }

  }


  const handleDeleteRefImage = () => {
    // handlezoomPost('1');
    setSelFloorPlanDtls((prev) => ({
      ...prev,
      plan: null,
      refImg: '',
      show_image: 0,
      get_svg: null
    }))
    setTimeout(() => {
      document.getElementById('FloorPlanAddBtn')?.click()
    }, 1000);
  }

  const handlePostSvgFileForRefImage = async (values) => {
    const formdata = new FormData();
    formdata.append(`svg_file`, values?.image);
    formdata.append(`id`, values?.enc_id);

    try {
      const reqUrl = 'save-svg'
      const response = await postRequest(reqUrl, formdata, true);
      const data = response.data ?? [];
      // console.log(response, 'zoom')
      if (response?.type === 1) {
        getSvgFileAsRefImage(values?.enc_id)
      }
    } catch (error) {
      // console.log(error);
    }
  }


  const getCirclePosition = (circle, resizeScale) => {
    let matrix = circle.calcTransformMatrix();
    let point = { x: circle.left, y: circle.top };

    let transformedPoint = {
      x: matrix[0] * point.x + matrix[2] * point.y + matrix[4],
      y: matrix[1] * point.x + matrix[3] * point.y + matrix[5]
    };

    return {
      x: transformedPoint.x * resizeScale,
      y: transformedPoint.y * resizeScale,
      radius: circle.radius * resizeScale
    };
  };


  const getTextPosition = (text) => {
    let matrix = text.calcTransformMatrix();
    let point = { x: text.left, y: text.top };

    let transformedPoint = {
      x: matrix[0] * point.x + matrix[2] * point.y + matrix[4],
      y: matrix[1] * point.x + matrix[3] * point.y + matrix[5]
    };

    return transformedPoint;
  };

  const getTracingFromSvg = async (file, resizeScale) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const svg = event.target.result;
      
      fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        let tmpTracings = [];
        let tmpTracingCircle = [];
        let tempTexts = [];
        let tmpRectangle = [];
        
        objects.forEach((object) => {
          
          if (object.type === 'polygon') {
            // Scale polygon vertices
            const translatedPoints = getPolygonVertices(object);
            // console.log(object, object.type, translatedPoints, 'getTracingFromSvg ')
            const removeDuplicatedPoints = removeDuplicatePoints(translatedPoints)
            tmpTracings.push({
              vertices: scaleVertices(removeDuplicatedPoints, resizeScale),
              fill_color: object.fill ? object.fill : "#7ed32100",
              border_color: object.stroke,
              border_thick: object.strokeWidth,
            });
          } else if (object.type === 'rect') {
            const translatedPoints = getRectangleVertices(object, obj, resizeScale);
            // console.log(object, translatedPoints, object.type, 'getTracingFromSvg rectangle')
            tmpTracings.push({
              vertices: scaleVertices(translatedPoints, resizeScale),
              fill_color: object.fill ? object.fill : "#7ed32100",
              border_color: object.stroke,
              border_thick: object.strokeWidth ?? 0,
            });
          } else if (object.type === 'circle') {
            const translatedPoints = getCirclePosition(object, resizeScale);
            const radius = (object.radius * (object.scaleX ?? 1)) * resizeScale;
            tmpTracingCircle.push({
              // vertices: translatedPoints,
              vertices: {
                x: (object.left + (obj.width / 2)) * resizeScale,
                y: (object.top + (obj.height / 2)) * resizeScale
              },
              fill_color: object.fill ? object.fill : "#7ed32100",
              border_color: object.stroke,
              border_thick: object.strokeWidth,
              radius: radius,
              scaleX: object.scaleX ?? 1,
              scaleY: object.scaleY ?? 1,
            });
          } else if (object.type === 'text') {
            const transformedPoint = getTextPosition(object);
            let singleLineText = object.text.replace(/\s/g, "\u00A0");
            tempTexts.push({
              // left: transformedPoint.x * resizeScale,
              // top: transformedPoint.y * resizeScale,
              left: (object.left + (obj.width / 2)) * resizeScale,
              top: (object.top + (obj.height / 2)) * resizeScale,
              text: singleLineText,
              scaleX: object.scaleX * resizeScale,
              scaleY: object.scaleY * resizeScale,
              angle: object.angle,
              fontFamily: object.fontFamily,
              fill_color: object.fill ? object.fill : "#7ed32100",
              fontSize: object.fontSize * resizeScale,
              fontWeight: object.fontWeight ?? 'normal',
              textAlign: object.textAlign ?? 'left',
              height: object.height,
              width: object.width
            });
          }
          else if (object.type === 'line') {
            const translatedPoints = [
              { x: object.x1, y: object.y1 },
              { x: object.x2, y: object.y2 }
            ]
            tmpTracings.push({
              vertices: scaleVertices(translatedPoints, resizeScale),
              fill_color: object.fill ? object.fill : "#7ed32100",
              border_color: object.stroke,
              border_thick: object.strokeWidth,
            });
          }
        });
        // console.log(tmpTracings, "tmpTracings")
        const traces = [...tracings, ...tmpTracings]
        const traceCircles = [...tracingCircle, ...tmpTracingCircle]
        const text = [...texts, ...tempTexts]
        setTracings(traces);
        postTrasing(traces);
        setTracingCircle(traceCircles);
        postTrasingCircle(traceCircles);
        setTexts(text);
        postTexts(text);
        renderTracings();
        renderTracingCircles();
        renderTexts();
      });
    };
    reader.readAsText(file);
  };

  const handlezoomPost = async (zoom) => {
    let datas = {
      id: floorID,
      img_size: zoom
    }
    try {
      const reqUrl = 'update-size'
      const response = await postRequest(reqUrl, datas);
      const data = response.data ?? [];
      // console.log(response, 'zoom')
      // getFloorPlanByid(floorID);
    } catch (error) {
      // console.log(error);
    }
  }


  const onChangeTracingMetadata = (value, type) => {
    let ppty = "";
    switch (type) {
      case "fill_color":
        ppty = "fill";
        break;
      case "border_color":
        ppty = "stroke";
        break;
      case "border_thick":
        ppty = "strokeWidth";
        break;

      default:
        break;
    }
    // console.log(obj, 'style-change')
    if (obj && obj?.name === "tracing") {
      if (ppty) {
        obj.set(ppty, value);
        setSelFloorPlanDtls((prev) => ({ ...prev, [type]: value }));
      }
    } else if (
      obj?.name !== "tracing" &&
      obj?.name !== "text" &&
      obj.name === "tracing_group"
    ) {
      // console.log(obj, "obj");
      const bulkSelected = canvas.current.getActiveObjects();
      bulkSelected?.forEach((a) => {
        if (a.name === "tracing") {
          a.set(ppty, value);
        }
      });
      // canvas.current.discardActiveObject();
      canvas.current.renderAll();
    }

    canvas.current.requestRenderAll();
    updateTracing(canvas, setTracings, setTracingIntialValue, postTrasing);
    updateTracingCircle(canvas, setTracingCircle, setTracingIntialValue, postTrasingCircle);
  };

  const onSaveTracingStyle = () => {
    updateTracing(canvas, setTracings, setTracingIntialValue, postTrasing);
  };

  // delete tracing
  const onDeleteTracing = (enc_id) => {
    //  previous code *****************
    // if (obj.name == "tracing" || obj.name == "text") {
    //   canvas.current.remove(obj);
    // } else {
    //   const bulkSelected = canvas.current.getActiveObjects();
    //   if (bulkSelected.type === "activeSelection") {
    //     bulkSelected.forEachObject((obj) => {
    //       canvas.current.remove(obj);
    //     });
    //     canvas.discardActiveObject();
    //   } else {
    //     bulkSelected?.forEach((a) => {
    //       if (a.name === "tracing" || a.name == "text") {
    //         canvas.current.remove(a);
    //       }
    //     });
    //   }
    //   canvas.current.remove(obj);
    //   canvas.current.discardActiveObject();
    //   canvas.current.renderAll();
    // }
    // canvas.current.requestRenderAll();
    // updateTracing(
    //   canvas,
    //   setTracings,
    //   setTracingIntialValue,
    //   postTrasing,
    //   enc_id
    // );
    // setSelTracingId();
    // obj = "";
    // updateText(canvas, setTexts, postTexts, enc_id);

    // changed by savad on 23/07/2024
    const bulkSelected = canvas.current.getActiveObjects();
    if (bulkSelected.type === "activeSelection") {
      bulkSelected.forEachObject((obj) => {
        canvas.current.remove(obj);
      });
      canvas.discardActiveObject();
    } else {
      bulkSelected?.forEach((a) => {
        canvas.current.remove(a);
      });
    }
    canvas.current.remove(obj);
    canvas.current.discardActiveObject();
    canvas.current.renderAll();
    // }
    canvas.current.requestRenderAll();
    updateTracing(
      canvas,
      setTracings,
      setTracingIntialValue,
      postTrasing,
      enc_id
    );
    setSelTracingId();
    setSelObject();
    obj = "";
    updateText(canvas, setTexts, postTexts, enc_id);
    updateTracingCircle(canvas, setTracingCircle, setTracingIntialValue, postTrasingCircle, enc_id);
  };

  // // duplicate tracing
  // const duplicateObject = () => {
  //   const activeObject = canvas?.current?.getActiveObject();
  //   if (activeObject) {
  //     const objectData = activeObject.toObject();
  //     activeObject.clone(function (cloned) {
  //       cloned.set(objectData);
  //       cloned.set({
  //         left: cloned.left + 10,
  //         top: cloned.top + 10,
  //         evented: true,
  //         selectable: true,
  //       });

  //       cloned.set({
  //         name: activeObject?.get("name"),
  //         id: new Date()?.toString(),
  //       });
  //       // console.log(cloned, 'cloned')
  //       canvas?.current?.add(cloned).renderAll();
  //       updateTracing(canvas, setTracings, setTracingIntialValue, postTrasing);
  //       showCornerPoints(cloned)
  //       removeFabricObjectsByName(canvas, "tracing_obj_length");
  //       const points = getPolygonVertices(cloned);
  //       showObjLength(cloned, points, canvas);
  //       tracingLengthZoomLevel(canvas, canvas.current.getZoom());
  //       // canvas?.current?.setActiveObject(cloned);
  //     });
  //   }
  // };

  // duplicate tracing
  const duplicateObject = () => {
    const activeObject = canvas?.current?.getActiveObject();

    if (!activeObject) return;

    // console.log(activeObject, activeObject.type, "activeObject.type")

    if (activeObject.type === 'polygon') {
      // Handle single polygon duplication
      let polyObj = new fabric.Polygon([...activeObject.points], {
        objectCaching: false,
        name: "tracing",
        id: new Date().toString(),
        fill: activeObject.get("fill"),
        stroke: activeObject.get("stroke"),
        strokeWidth: activeObject.get("strokeWidth"),
        originX: activeObject.get("originX"),
        originY: activeObject.get("originY"),
        perPixelTargetFind: activeObject.get("perPixelTargetFind"),
        position: activeObject.get("position"),
        zIndex: activeObject.get("zIndex"),
        selectable: activeObject.get("selectable"),
        hoverCursor: activeObject.get("hoverCursor"),
        evented: activeObject.get("evented"),
        opacity: activeObject.get("opacity"),
        left: activeObject.get("left") + 10,
        top: activeObject.get("top") + 10,
      });

      polyObj.setCoords();
      canvas?.current?.add(polyObj);
      showCornerPoints(polyObj);
      const points = getPolygonVertices(polyObj);
      removeFabricObjectsByName(canvas, "tracing_obj_length");
      showObjLength(polyObj, points, canvas);
      canvas?.current?.setActiveObject(polyObj);

    } else if (activeObject.type === 'activeSelection') {
      const objects = activeObject.getObjects();
      objects.forEach(obj => {
        let newObj;
        let objLeft = obj.left + activeObject.left;
        let objTop = obj.top + activeObject.top;

        if (obj.type === 'polygon') {
          newObj = new fabric.Polygon([...obj.points], {
            objectCaching: false,
            name: "tracing",
            id: new Date().toString(),
            fill: obj.get("fill"),
            stroke: obj.get("stroke"),
            strokeWidth: obj.get("strokeWidth"),
            originX: obj.get("originX"),
            originY: obj.get("originY"),
            perPixelTargetFind: obj.get("perPixelTargetFind"),
            position: obj.get("position"),
            zIndex: obj.get("zIndex"),
            selectable: obj.get("selectable"),
            hoverCursor: obj.get("hoverCursor"),
            evented: obj.get("evented"),
            opacity: obj.get("opacity"),
            left: objLeft + 10,
            top: objTop + 10,
          });
        } else if (obj.type === 'circle') {
          newObj = new fabric.Circle({
            ...obj.toObject(),
            left: objLeft + 10,
            top: objTop + 10,
            evented: true,
          });
        } else {
          newObj = fabric.util.object.clone(obj);
          newObj.set({
            left: objLeft + 10,
            top: objTop + 10,
            evented: true,
          });
        }

        newObj.set({
          name: obj.get("name"),
          id: new Date().toString(),
        });

        canvas?.current?.add(newObj);
        // showCornerPoints(newObj);
        // const points = getPolygonVertices(newObj);
        // removeFabricObjectsByName(canvas, "tracing_obj_length");
        // showObjLength(newObj, points, canvas);
        canvas?.current?.setActiveObject(newObj);
      });
    } else if (activeObject.type === 'circle') {
      const objectData = activeObject.toObject();
      activeObject.clone(function (cloned) {
        cloned.set(objectData);
        cloned.set({
          left: cloned.left + 10,
          top: cloned.top + 10,
          evented: true,
        });

        cloned.set({
          name: activeObject?.get("name"),
          id: new Date()?.toString(),
        });
        canvas?.current?.add(cloned);
        canvas?.current?.setActiveObject(cloned);
        // showCornerPoints(cloned);
        // const points = getPolygonVertices(cloned);
        // removeFabricObjectsByName(canvas, "tracing_obj_length");
        // showObjLength(cloned, points, canvas);
        canvas?.current?.setActiveObject(cloned);
      });


    } else {
      // Handle other object types duplication
      const objectData = activeObject.toObject();
      activeObject.clone(function (cloned) {
        cloned.set(objectData);
        cloned.set({
          left: cloned.left + 10,
          top: cloned.top + 10,
          evented: true,
        });

        cloned.set({
          name: activeObject?.get("name"),
          id: new Date()?.toString(),
        });

        canvas?.current?.add(cloned).renderAll();
        updateTracing(canvas, setTracings, setTracingIntialValue, postTrasing);
        updateText(canvas, setTexts, postTexts);
        updateTracingCircle(canvas, setTracingCircle, setTracingIntialValue, postTrasingCircle);

        if (cloned.type === 'polygon') {
          showCornerPoints(cloned)
          removeFabricObjectsByName(canvas, "tracing_obj_length");
          const points = getPolygonVertices(cloned);
          showObjLength(cloned, points, canvas);
          // tracingLengthZoomLevel(canvas, canvas.current.getZoom());
        }

        // removeFabricObjectsByName(canvas, "tracing")
        // let tmpTracings = [...tracings, cloned];
        // renderTracings(tmpTracings)
        changeSelectionAllObjs(canvas, true, "tracing");
        changeSelectionAllObjs(canvas, true, "text");
        
        canvas?.current?.setActiveObject(cloned);
      });
    }
  };





  const deleteTracingsByDeleteKey = () => {
    let activeTabVar;
    setActiveTab((prev) => {
      activeTabVar = prev;
      return prev;
    });
    let toolActiveVar;
    setToolActive((prev) => {
      toolActiveVar = prev;
      return prev;
    });

    let addNewFloorVar;
    setAddNewFloor((prev) => {
      addNewFloorVar = prev;
      return prev;
    });

    let selFloorPlanDtlsVar;
    setSelFloorPlanDtls((prev) => {
      selFloorPlanDtlsVar = prev;
      return prev;
    });

    if (
      activeTabVar === "floorDetails" &&
      toolActiveVar == "Select" &&
      addNewFloorVar
    ) {
      // console.log("delete-tracing");
      onDeleteTracing(selFloorPlanDtlsVar?.enc_id);
    }
  };

  const updatePinPosition = async (obj, position) => {
    setSavingTimer(true)
    // 
    let value = {
      project_id: id,
      id: obj?.enc_id,
      type: getTypeByName(obj),
      positions: position,
      is_published: "0",
      discard: "1",
      publish: "1",
    };
    if (value?.type == 1) {
      // console.log(obj, 'getPolygonVertices')
      // boundaryAttributes = getPolygonVertices(obj);
      value.boundary_attributes = boundaryAttributes
    }
    try {
      const reqUrl = `update-position`;
      const response = await postRequest(reqUrl, value);
      let floor;
      setSelFloorPlanDtls((prev) => {
        floor = prev;
        return prev;
      });
      handleEnableDisable();
      boundaryAttributes = undefined;
      const floorPlanId = floor?.enc_id ?? obj?.fp_id ?? floorID ?? selFloorPlanDtls?.enc_id
      
      // if (activeTab === "traversable") {
      if (obj?.name === 'location') {
        getLocationList(floorPlanId)
      } else if (obj?.name === 'product') {
        getProductList(floorPlanId)
      } else if (obj?.name === 'beacon') {
        getBeaconList(floorPlanId)
      } else if (obj?.name === 'amenity') {
        getAmenityList(floorPlanId)
      } else if (obj?.name === 'safety') {
        getSafetyList(floorPlanId)
      } else if (obj?.name === 'vertical') {
        getVerticalTransportCurrentFloor((floorPlanId), setVerticalTransports)
      }
      if (activeTab === "traversable") {
        setTimeout(() => {
          checkPinConnectOrNot()
        }, 1000);
      }

    } catch (error) {
      
    } finally {
      setSavingTimer(false)

    }
  }


  const postTrasing = async (tracings, enc_id) => {
    let value = {
      id: enc_id ?? selFloorPlanDtls?.enc_id ?? floorID,
      tracings: JSON.stringify(tracings),
      is_published: "0",
      discard: "1",
      publish: "1",
    };
    try {
      const reqUrl = `update-tracing`;
      const response = await postRequest(reqUrl, value);
      const data = response.response?.data ?? [];
      handleEnableDisable();
    } catch (error) {
      ////
    }
  };

  const postTrasingCircle = async (circleDatas, enc_id) => {
    let value = {
      id: enc_id ?? selFloorPlanDtls?.enc_id ?? floorID,
      circle_data: JSON.stringify(circleDatas),
      is_published: "0",
      discard: "1",
      publish: "1"
    };
    try {
      const reqUrl = `update-circle`;
      const response = await postRequest(reqUrl, value);
      const data = response.response?.data ?? [];
      handleEnableDisable();
    } catch (error) {
      ////
    }
  };

  const postTexts = async (text, enc_id) => {
    let value = {
      id: enc_id ?? selFloorPlanDtls?.enc_id ?? floorID,
      text: JSON.stringify(text),
      is_published: "0",
      discard: "1",
      publish: "1",
    };
    try {
      const reqUrl = `update-text`;
      const response = await postRequest(reqUrl, value);
      const data = response.response?.data ?? [];
      handleEnableDisable();
    } catch (error) {
      ////
    }
  };

  const onCreateNode = (position, nodeName, isautoconnection = false) => {
    let varToolTraversible
    setToolTraversible((prev) => {
      varToolTraversible = prev
      return prev;
    })
    
    const relPosX = position?.x;
    const relPosY = position?.y;

    if (key1) {
      key2 = key1;
    }
    key1 = nodeName;
    
    if (isautoconnection) {
      graph.addSubnode(nodeName);
      if (isautoconnection === "mainpath") {
        graph.addConnectedMainPathNodes(nodeName)
      }
      graph.addAutoConnectNode(nodeName)
    } else if (varToolTraversible === 'sub_path') {
      if (!graph.nodes.has(nodeName)) {
        graph.addSubnode(nodeName);
      } else if(!graph.subNode.includes(nodeName)){
        graph.addConnectedMainPathNodes(nodeName)
      }
    }
    graph.addNode(nodeName);

    graph.addPosition(nodeName, relPosX, relPosY);
    setPosits((prev) => ({ ...prev, [nodeName]: { x: relPosX, y: relPosY } }));
  }

  function sortCoordinatesAlongLine(coordinates, lineStart, lineEnd) {
    function distanceAlongLine(point, lineStart, lineEnd) {
      const dx = lineEnd?.x - lineStart?.x;
      const dy = lineEnd?.y - lineStart?.y;
      const lineLengthSquared = dx * dx + dy * dy;

      const t = ((point?.x - lineStart?.x) * dx + (point?.y - lineStart?.y) * dy) / lineLengthSquared;
      return t;
    }

    return coordinates.sort((a, b) => {
      const distanceA = distanceAlongLine(a?.coord, lineStart, lineEnd);
      const distanceB = distanceAlongLine(b?.coord, lineStart, lineEnd);
      return distanceA - distanceB;
    });
  }

  useEffect(() => {
    if (activeTab === "traversable") {
      getProjectById();
      getFloorsList();
    }
  }, [activeTab]);

  const showPath = (sourcePoint, destinationPoint) => {
    removeFabricObjectsBId(canvas, "short_path");
    localStorage.removeItem("shortestPath")
    // removeFabricObjectsByName(canvas, "highlight_node");
    // removeFabricObjectsByName(canvas, "short_path_node");
    canvas?.current?.forEachObject(function (obj) {
      if (obj.name == "highlight_node" || obj.name == "short_path_node") {
          canvas.current.remove(obj);
      }
    });
    // removeFabricObjectsByName(canvas, "node");

    canvas.current.discardActiveObject();
    setSelectedPaths(false);
    let shortestPath = null;
    shortestPath = dijkstra(graph, sourcePoint, destinationPoint);
    localStorage.setItem("shortestPath",shortestPath)
    
    let nodes = graph.getPositions();  
    if (shortestPath) {
      pathLine(canvas, nodes, projectSettings, shortestPath);
      highligthNodes(canvas, projectSettings, shortestPath,true,graph);
      canvas.current.renderAll();
    }
    setOverlay(false)
  };

  const findShortestPath = (fromValue, toValue, graphValue, position) => {
    removeFabricObjectsBId(canvas, "short_path");
    localStorage.removeItem("shortestPath")
    removeFabricObjectsByName(canvas, "highlight_node");
    
    if (!selTraversibleDetails.from || !selTraversibleDetails.to)
      if (selTraversibleDetails.from == selTraversibleDetails.to) return;
    
    let shortestPath = null;
    shortestPath = dijkstra(
      graphValue ?? graph,
      fromValue ?? selTraversibleDetails.from,
      toValue ?? selTraversibleDetails.to
    );
    
    let nodes = position ?? graph.getPositions();
    let edges = graph.getEdges();
    if (shortestPath) {
      shortestPath.forEach((p, id) => {
        if (id < shortestPath.length - 1) {
          let points = [
            nodes[p].x,
            nodes[p].y,
            nodes[shortestPath[id + 1]].x,
            nodes[shortestPath[id + 1]].y,
          ];
          let line = new fabric.Line(points, {
            strokeWidth: projectSettings?.navigation_thick ?? 3,
            stroke: projectSettings?.navigation_color ?? "red",
            selectable: false,
            name: graphValue ? "level_short_path" : "short_path",
            id: "short_path",
            originX: "center",
            originY: "center",
            hoverCursor: "auto",
            // strokeDashArray: [5, 5],
          });
          canvas.current.add(line).renderAll();
        }
      });

      highligthNodes(canvas, projectSettings, shortestPath,true,graph);
      canvas.current.renderAll();
    }
  };

  
  function convertVerticalPinData(array) {
    
    const data = array?.map((item) => ({
      enc_id: item?.vtd_id,
      vtd_id: item?.vtd_id,
      vt_id: item?.vt_id,
      name: `vertical_${item?.vtd_id}`,
      movement_direction:item?.movement_direction,
      icon_id:item?.icon_id,
      type: 6,
      to_floor_id: item?.floor_plan_id,
      vertical_transport_id: item?.vt_id,
      vt_name: item?.vt_name,
      floor_plan: item?.floor_plan,
      movement_direction: item?.movement_direction,
    }));
    return data ?? [];
  }

  const handlePontsAndEdges = (floor_id) => {
    const floorPlanDtls = allPointsAndEdges?.find(
      (item) => item?.fp_id == floor_id
    );
    
    if (floorPlanDtls?.edges_data) {
      const edges = JSON.parse(floorPlanDtls.edges_data);
      // 
      if (edges?.length === 0) {
        graph.restoreEdges();
      } else {
        graph.restoreEdges(edges);
        const nodeFromAPI = Object.keys(edges);
        nodeFromAPI?.forEach((n) => {
          graph.addNode(n);
        });
      }
    } else {
      graph.restoreEdges();
    }
    if (floorPlanDtls?.points_data) {
      const points = JSON.parse(floorPlanDtls.points_data);
      if (points?.length === 0) {
        graph.restorePositions();
      } else {
        graph.restorePositions(points);
      }
    } else {
      graph.restorePositions();
    }
  };

  const handlePontsAndEdgesForNewGraph = (floor_id,graph) => {
    const floorPlanDtls = allPointsAndEdges?.find(
      (item) => item?.fp_id == floor_id
    );
    
    if (floorPlanDtls?.edges_data) {
      const edges = JSON.parse(floorPlanDtls.edges_data);
      // 
      if (edges?.length === 0) {
        graph.restoreEdges();
      } else {
        graph.restoreEdges(edges);
        const nodeFromAPI = Object.keys(edges);
        nodeFromAPI?.forEach((n) => {
          graph.addNode(n);
        });
      }
    } else {
      graph.restoreEdges();
    }
    if (floorPlanDtls?.points_data) {
      const points = JSON.parse(floorPlanDtls.points_data);
      if (points?.length === 0) {
        graph.restorePositions();
      } else {
        graph.restorePositions(points);
      }
    } else {
      graph.restorePositions();
    }
  };
  
  // check for vertical transport connects
  const onSelectVerticalTransport = (data) => {
    let floorgraphArray = []
    floorPlans.forEach((item) => {
      const floorGraph = new Graph();
      handlePontsAndEdgesForNewGraph(item?.enc_id, floorGraph);

      floorgraphArray.push({
        id: item?.enc_id,
        graphData: floorGraph 
      })

    });

    const mergedGraph = combineFloors(floorgraphArray, convertVerticalPinData(allVerticalTransports), 10, data?.icon_id,selTraversibleDetails.from_floor_id)
    // console.log(mergedGraph,floorPlans,"mergedGraph,floorPlans");
    
    let fromlocation = `f${selTraversibleDetails.from_floor_id}_${selTraversibleDetails.from}`
    let tolocation = `f${selTraversibleDetails.to_floor_id}_${selTraversibleDetails.to}`

    let result1 = dijkstraWithLength(mergedGraph, fromlocation, tolocation);
    let result2;

    if (!result1) {
      
      let combined = combineFloors(floorgraphArray, convertVerticalPinData(allVerticalTransports),10);
      result2 = dijkstraWithLength(
        combined,
        fromlocation, tolocation
      );
    }

    let result;

    removeFabricObjectsBId(canvas, "short_path");
    localStorage.removeItem("shortestPath")
    removeFabricObjectsByName(canvas, "highlight_node");
    renderTraversiblePaths();

    if (result1) {
      result = result1;
      processPathConnection(result)
    } else if(result2){
      result = result2;
      setVerticalPathConnectionResult(result2)
      TransportModaltoggle()
    } 

    if (!result) {
      toast.error(
        "Sorry! We couldn't establish a connection to your destination."
      );
      setOverlay(false)
      setIsWheechairChecked(false)
    }

    toggleVerticalClose();
    
  };

  // function combineFloors(floors, verticalTransports, transitionWeight = 10, selectedIconId = null) {
  //   const combined = { nodes: [], edges: {}, positions: {} };

  //   // Add floor nodes/edges with prefixes (same as before)
  //   floors.forEach(floor => {
  //     const floorId = floor.id;
  //     const prefix = `f${floorId}_`;

  //     // Process nodes and edges
  //     const nodes = new Set();
  //     for (const node in floor.graphData.edges) {
  //         nodes.add(node);
  //         for (const neighbor in floor.graphData.edges[node]) {
  //             nodes.add(neighbor);
  //         }
  //     }

  //     // Add nodes to combined graph
  //     nodes.forEach(node => {
  //         const prefixedNode = prefix + node;
  //         combined.nodes.push(prefixedNode);
  //         combined.positions[prefixedNode] = { ...floor.graphData.positions[node] };
  //     });

  //     // Add edges to combined graph
  //     for (const node in floor.graphData.edges) {
  //         const prefixedNode = prefix + node;
  //         if (!combined.edges[prefixedNode]) {
  //             combined.edges[prefixedNode] = {};
  //         }
  //         for (const neighbor in floor.graphData.edges[node]) {
  //             const prefixedNeighbor = prefix + neighbor;
  //             combined.edges[prefixedNode][prefixedNeighbor] = floor.graphData.edges[node][neighbor];
  //         }
  //     }
  //   });

  //   // Filter and group vertical transports
  //   const vtGroups = {};
  //   const relevantVTs = verticalTransports.filter(vt => 
  //     selectedIconId === null || vt.icon_id === selectedIconId
  //   );

  //   relevantVTs.forEach(vt => {
  //       if (!vtGroups[vt.vt_id]) vtGroups[vt.vt_id] = [];
  //       vtGroups[vt.vt_id].push(vt);
  //   });

  //   // Create floor order map based on array position
  //   const floorOrder = new Map();
  //   floors.forEach((floor, index) => floorOrder.set(floor.id, index));

  //   // Connect vertical transports with directional edges
  //   Object.values(vtGroups).forEach(vtGroup => {
  //       const vtDetails = vtGroup
  //           .map(vt => {
  //               const floor = floors.find(f => f.graphData.edges.hasOwnProperty(vt.name));
  //               return floor ? {
  //                   node: `f${floor.id}_${vt.name}`,
  //                   floorId: floor.id,
  //                   direction: vt.movement_direction
  //               } : null;
  //           })
  //           .filter(Boolean);

  //       // Create all possible pairs
  //       for (let i = 0; i < vtDetails.length; i++) {
  //           for (let j = i+1; j < vtDetails.length; j++) {
  //               const a = vtDetails[i];
  //               const b = vtDetails[j];
                
  //               // Get floor positions
  //               const aPos = floorOrder.get(a.floorId);
  //               const bPos = floorOrder.get(b.floorId);
                
  //               // A to B connection
  //               if (aPos < bPos) { // A is higher floor
  //                   if (a.direction === 'down' || a.direction === 'bidirectional') {
  //                       if (!combined.edges[a.node]) combined.edges[a.node] = {};
  //                       combined.edges[a.node][b.node] = transitionWeight;
  //                   }
  //               } else { // A is lower floor
  //                   if (a.direction === 'up' || a.direction === 'bidirectional') {
  //                       if (!combined.edges[a.node]) combined.edges[a.node] = {};
  //                       combined.edges[a.node][b.node] = transitionWeight;
  //                   }
  //               }

  //               // B to A connection
  //               if (bPos < aPos) { // B is higher floor
  //                   if (b.direction === 'down' || b.direction === 'bidirectional') {
  //                       if (!combined.edges[b.node]) combined.edges[b.node] = {};
  //                       combined.edges[b.node][a.node] = transitionWeight;
  //                   }
  //               } else { // B is lower floor
  //                   if (b.direction === 'up' || b.direction === 'bidirectional') {
  //                       if (!combined.edges[b.node]) combined.edges[b.node] = {};
  //                       combined.edges[b.node][a.node] = transitionWeight;
  //                   }
  //               }
  //           }
  //       }
  //   });

  //   return combined;
  // }
  
  function combineFloors(floors, verticalTransports, transitionWeight = 10, selectedIconId = null, startingFloor = null) { 
    const combined = { nodes: [], edges: {}, positions: {} };

    floors.forEach(floor => {
        const floorId = floor.id;
        const prefix = `f${floorId}_`;

        // Process nodes and edges
        const nodes = new Set();
        for (const node in floor.graphData.edges) {
            nodes.add(node);
            for (const neighbor in floor.graphData.edges[node]) {
                nodes.add(neighbor);
            }
        }

        // Add nodes to combined graph
        nodes.forEach(node => {
            const prefixedNode = prefix + node;
            combined.nodes.push(prefixedNode);
            combined.positions[prefixedNode] = { ...floor.graphData.positions[node] };
        });

        // Add edges to combined graph
        for (const node in floor.graphData.edges) {
            const prefixedNode = prefix + node;
            if (!combined.edges[prefixedNode]) {
                combined.edges[prefixedNode] = {};
            }
            for (const neighbor in floor.graphData.edges[node]) {
                const prefixedNeighbor = prefix + neighbor;
                combined.edges[prefixedNode][prefixedNeighbor] = floor.graphData.edges[node][neighbor];
            }
        }
    });

    const vtGroups = {};
    verticalTransports.forEach(vt => {
      const vtFloorId = floors.find(f => f.graphData.edges.hasOwnProperty(vt.name))?.id;
    
      let shouldInclude = false;
    
      if (selectedIconId && startingFloor !== null) {
        
        if (vtFloorId === startingFloor) {
          shouldInclude = vt.icon_id === selectedIconId;
        } else {
          shouldInclude = true; 
        }
      } else if (selectedIconId) {
        
        shouldInclude = vt.icon_id === selectedIconId;
      } else {
       
        shouldInclude = true;
      }
    
      if (shouldInclude) {
        if (!vtGroups[vt.vt_id]) vtGroups[vt.vt_id] = [];
        vtGroups[vt.vt_id].push(vt);
      }
    });

    
    const floorOrder = new Map();
    floors.forEach((floor, index) => floorOrder.set(floor.id, index));

    
    Object.values(vtGroups).forEach(vtGroup => {
        const vtDetails = vtGroup
            .map(vt => {
                const floor = floors.find(f => f.graphData.edges.hasOwnProperty(vt.name));
                return floor ? {
                    node: `f${floor.id}_${vt.name}`,
                    floorId: floor.id,
                    direction: vt.movement_direction
                } : null;
            })
            .filter(Boolean);

        
        for (let i = 0; i < vtDetails.length; i++) {
            for (let j = i + 1; j < vtDetails.length; j++) {
                const a = vtDetails[i];
                const b = vtDetails[j];
                
                const aPos = floorOrder.get(a.floorId);
                const bPos = floorOrder.get(b.floorId);

                if (aPos < bPos && (a.direction === 'down' || a.direction === 'bidirectional')) {
                    if (!combined.edges[a.node]) combined.edges[a.node] = {};
                    combined.edges[a.node][b.node] = transitionWeight;
                } else if (aPos > bPos && (a.direction === 'up' || a.direction === 'bidirectional')) {
                    if (!combined.edges[a.node]) combined.edges[a.node] = {};
                    combined.edges[a.node][b.node] = transitionWeight;
                }

                if (bPos < aPos && (b.direction === 'down' || b.direction === 'bidirectional')) {
                    if (!combined.edges[b.node]) combined.edges[b.node] = {};
                    combined.edges[b.node][a.node] = transitionWeight;
                } else if (bPos > aPos && (b.direction === 'up' || b.direction === 'bidirectional')) {
                    if (!combined.edges[b.node]) combined.edges[b.node] = {};
                    combined.edges[b.node][a.node] = transitionWeight;
                }
            }
        }
    });
    return combined;
  }

  const FindSecondaryPathCalculation = () => {
    processPathConnection(verticalPathConnectionResult)
    setIsWheechairChecked(false)
  }

  const processPathConnection = (result) => { 
    let pathArray=[]
      if (result?.floorwiseList) {
        // console.log(result?.floorwiseList,"result?.floorwiseList");
        result.floorwiseList.forEach((item) => {
          const key = Object.keys(item)[0]; 
          const value = item[key]; 

          let firstitem = value[0]
          let lastitem = value[value.length - 1]
          let floorTransport;
          if (value[0].split("_")[0] == "vertical") {
            floorTransport = allVerticalTransports.find((item) => item.vtd_id == value[0].split("_")[1])
          }
          if (value[value.length - 1].split("_")[0] == "vertical") {
            floorTransport = allVerticalTransports.find((item) => item.vtd_id == value[value.length - 1].split("_")[1])
          }

          let pathitem = {
            floor_plan_id: key,
            from: firstitem,
            to: lastitem,
            to_vt_id: floorTransport.vtd_id,
            floor_plan: key,
            vt_name: floorTransport.vt_name
          }
          pathArray.push(pathitem)
          
        });
      }

      // console.log(pathArray);
      setSelTraversibleDetails((prev) => ({
        ...prev,
        pathArray,
        is_miltiple: true,
      }));
      
      if (pathArray?.length > 0) {
        handlePontsAndEdges(selTraversibleDetails?.from_floor_id);
        if (
          pathArray[pathArray?.length - 1]?.floor_plan_id ==
          selTraversibleDetails?.to_floor_id
        ) {
          showPath(pathArray[0]?.from, pathArray[0]?.to);
          localStorage.setItem("pathLength", pathArray.length)
          localStorage.setItem("currentLength", 1)
        } else {
          toast.warning(
            "Sorry! The chosen vertical transport has no connection to your destination."
          );
        }
      } 
  }




  const handleEndDirectionclick = () => { 
    setSelTraversibleDetails();
    // setFloorID(selFloorPlanDtls?.enc_id);
    removeFabricObjectsBId(canvas, "short_path");
    removeFabricObjectsByName(canvas, "highlight_node");
    removeFabricObjectsByName(canvas, "short_path_node");
    localStorage.removeItem("shortestPath")
    renderTraversiblePaths();
  };

  const handleWheelchairCheck = (e) => {
    const isWheelchair = e.target.checked;
    setIsWheechairChecked(isWheelchair)
    
    // if (isWheelchair) {
    //   const verticalTransport = verticalTransports?.map((item) => ({
    //     ...item,
    //     noAccess: item?.is_wheelchair === 1 ? false : true,
    //   }));
    //   setVerticalTransports(verticalTransport);
    //   const sortWithWheelChair = allVerticalTransports?.filter(
    //     (item) => item?.is_wheelchair === 1
    //   );
    //   setAllVerticalTransports(sortWithWheelChair);
    // } else {
    //   const verticalTransport = verticalTransports?.map((item) => ({
    //     ...item,
    //     noAccess: false,
    //   }));
    //   getProjectById();
    //   setTimeout(() => {
    //     setVerticalTransports(verticalTransport);
    //   }, 1000);
    // }
    
  };


  const handleShowtransportsInModal = (isWheechairChecked) => {
   if (isWheechairChecked) {
      const verticalTransport = verticalTransports?.map((item) => ({
        ...item,
        noAccess: item?.is_wheelchair === 1 ? false : true,
      }));
      setVerticalTransports(verticalTransport);
      const sortWithWheelChair = allVerticalTransports?.filter(
        (item) => item?.is_wheelchair === 1
      );
      setAllVerticalTransports(sortWithWheelChair);
    } else {
      const verticalTransport = verticalTransports?.map((item) => ({
        ...item,
        noAccess: false,
      }));
      getProjectById();
      // setTimeout(() => {
        setVerticalTransports(verticalTransport);
      // }, 1000);
    }
  }

  const switchFloor = async (id, type) => {
    // setOverlay(true)
    // setToolTraversible("Draw");
    const nextFloor = floorList?.find((item) => id == item?.enc_id);
    // setDropDownFloor({
    //   value: nextFloor?.enc_id,
    //   label: nextFloor?.floor_plan,
    //   id: nextFloor?.enc_id,
    //   plan: nextFloor?.plan,
    //   dec_id: nextFloor?.dec_id,
    // });
    dispatch(setCurrentFloor({
      value: nextFloor?.enc_id,
      label: nextFloor?.floor_plan,
      id: nextFloor?.enc_id,
      plan: nextFloor?.plan,
      dec_id: nextFloor?.dec_id,
    }))
    let returnValue;
    // returnValue = await switchFloorPlan(nextFloor?.enc_id, type);
    // handlePontsAndEdges(nextFloor?.enc_id)
    return returnValue;
  };

  const switchFloorPlan = async (floor_id, type) => {
    let modifiedData;
    let value;
    try {
      const response = await getRequest(`floor-plan/${floor_id}`);
      const data = response.data ?? [];

      value = {
        ...data,
        floor_plan: data?.floor_plan,
        refImg: data?.cropped_path_base64,
        plan: data?.cropped_image,
        border_color: data?.border_color,
        fill_color: data?.fill_color,
        border_thick: data?.border_thick,
      };
      const decodedTexts = JSON.parse(data?.text);
      var decodedString = JSON.parse(data?.tracings);
      var arrayOfObjects = JSON.parse(decodedString);
      var arrayOfTexts = decodedTexts ? JSON.parse(decodedTexts) : "";
      var decodedCircle = JSON.parse(data?.circle_data);
      var objectCircle = JSON.parse(decodedCircle);

      modifiedData = data?.vertical_transports?.map((el) => ({
        ...el,
        position: el?.positions ? JSON.parse(el?.positions) : "",
      }));
      
      setTexts(arrayOfTexts ?? []);
      setVerticalTransports(modifiedData);
      setTracings(arrayOfObjects ?? []);
      setTracingCircle(objectCircle ?? [])
      setSelFloorPlanDtls(value);
      if (type == "switch") {
        const select_Vt = modifiedData?.find(
          (item) =>
            selTraversibleDetails?.to_item?.vertical_transport_id ==
            item?.vertical_transport_id
        );
        // console.log(select_Vt, "select_Vt");
        const vt_Value = `vertical_${select_Vt?.enc_id}`;
        handleTraversibleData(
          value,
          graph,
          setSelTraversibleDetails,
          findShortestPath,
          renderTraversiblePaths,
          selTraversibleDetails,
          "switchFloor",
          vt_Value
        );
        let toData = {
          name: selTraversibleDetails?.to,
        };
      } else {
        handleTraversibleData(
          value,
          graph,
          setSelTraversibleDetails,
          findShortestPath,
          renderTraversiblePaths,
          selTraversibleDetails,
          "switchFloor"
        );
      }
      getSvgFileAsRefImage(value?.enc_id)
      if (value?.show_image == 1 && value?.plan) {
        canvasBackgroundImageHandler(value?.plan);
      } else {
        canvasBackgroundImageHandler(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      removeFabricObjectsByName(canvas, "product");
      removeFabricObjectsByName(canvas, "location");
      removeFabricObjectsByName(canvas, "boundary");
      removeFabricObjectsByName(canvas, "amenity");
      removeFabricObjectsByName(canvas, "beacon");
      removeFabricObjectsByName(canvas, "safety");
      setLocations([]);
      setProducts([]);
      setBeacons([]);
      setAmenities([]);
      setSafeties([]);
      getLocationList(floor_id);
      getProductList(floor_id);
      getBeaconList(floor_id);
      getAmenityList(floor_id);
      getSafetyList(floor_id);
      // getAdvertisementList()
      return value;
    }
  };

  // function removeDuplicates(array) {
  //   const seen = new Set();
  //   return array.filter((obj) => {
  //     const duplicate = seen.has(obj.icon_id);
  //     seen.add(obj.icon_id);
  //     return !duplicate;
  //   });
  // }

  function removeDuplicates(arr) {
    const uniqueObjects = {};
 
    arr?.forEach((obj) => {
      if (!(obj.icon_id in uniqueObjects)) {
        uniqueObjects[obj.icon_id] = obj;
      } else if (obj.is_wheelchair === 1) {
        uniqueObjects[obj.icon_id] = obj;
      }
    });

    return Object.values(uniqueObjects);
  }


  const onExitClick = () => {
    if (isDirty) {
      swal({
        title: "Are you sure you want to exit?",
        text: "You currently have pending changes. If you exit they'll be saved as a draft.",
        icon: "warning",
        buttons: [
          {
            text: "No",
            value: "No",
            visible: true,
            className: "btn-danger",
            closeModal: true,
          },
          {
            text: "Yes",
            value: "Yes",
            visible: true,
            className: "btn-success",
            closeModal: true,
          },
        ],
      }).then((value) => {
        switch (value) {
          case "Yes":
            resetCanvasTransform();
            if (activeTab === "products" && addNewProduct) {
              document.getElementById("productSubmitBtn")?.click();
            } else if (activeTab === "locations" && addNewLocation) {
              document.getElementById("locationSubmitBtn")?.click();
            } else if (activeTab === "settings") {
              document.getElementById("prpjectSettingsBtn")?.click();
            } else if (activeTab === "floorDetails" && addNewFloor) {
              document.getElementById("FloorPlanAddBtn")?.click();
            } else if (activeTab === "beacons" && addNewQrCodeBeacon) {
              document.getElementById("beaconSubmitBtn")?.click();
            } else if (activeTab === "safety" && addNewSafety) {
              document.getElementById("safetySubmitBtn")?.click();
            } else if (activeTab === "amenitys" && addNewAmenity) {
              document.getElementById("amenitySubmitBtn")?.click();
            } else if (activeTab === "verticalTransport" && addNewVertical) {
              document.getElementById("transportSubmitBtn")?.click();
            } else if (activeTab === "advertisements" && addNewAd) {
              document.getElementById("advertisementSubmitBtn")?.click();
            }
            resetCanvasTransform();
            setTimeout(() => {
              navigate(`/project-list`);
            }, 800);
            break;
          default:
            break;
        }
      });
    } else {
      resetCanvasTransform();
      navigate(`/project-list`);
    }
  };

  const getProjectById = async () => {
    // setLoading(true);
    try {
      const response = await getRequest(`project/${id}`);
      const data = response.data ?? [];
      let newValue = data?.is_pass_protected ? {
        password: 111111,
        confirm_password: 111111,
      } : {}
      let value = {
        ...data,
        ...newValue,
        width: data?.width ? Number(data?.width) : null,
        height: data?.height ? Number(data?.height) : null,
        location: [75.78044926997217, 11.258814157509704],
      };
 
      dispatch(setProjectData(value))
      setProjectSettingData(value);
      setProjectSettings(value);
      setTracingIntialValue(value);
      const sort = value?.vt_details?.sort(
        (a, b) => b.floor_plan_id - a.floor_plan_id
      );
      setAllVerticalTransports(sort);
      setAllPointsAndEdges(value?.fp_details);
      setCroppedImage(value.logo ? image_url + value.logo : null);
      handleEnableDisable();
      canvasBackGroundColor(value?.background_color, canvas);
    } catch (error) {
      
    } finally {
      // setLoading(false);
      setSavingTimer(false);
    }
  };

  const getFloorsList = async (type) => {
    getFloors(id, setFloorPlans, setFloorPlansPathSort);
  };

  const PlanExpiryDetails = async () => {
    try {
      const reqUrl = `check-package/${id}`;
      const response = await getRequest(reqUrl);
      // console.log(response, "delete");

      const data = response?.data ?? [];
      setPlanDetails(data);
      // console.log(data, "check-package");

      if (
        data?.plan?.basic_expired == 1 ||
        data?.plan?.additional_expired == 1 ||
        data?.plan?.additional_count == 1
      ) {
        setStripeModal(true);
      } else {
        publishYesClick();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePublish = async (proId, values, isAccepted, ip) => {
    let data = {
      id: Number(id),
      // type: Number(typeId)
    };
    try {
      const reqUrl = `publish`;
      const response = await postRequest(reqUrl, data);
      handleEnableDisable();
      setLoadingPublish(false);
      getProjectById();
      if (typeId > 1) {
        onSideBarIconClick(activeTab);
      }
      if (typeId == 2) {
        getFloorsList();
      }
      if (typeId == 3) {
        getLocationList(floorID);
      }
      if (typeId == 4) {
        getProductList(floorID);
      }
      if (typeId == 5) {
        getBeaconList(floorID);
      }
      if (typeId == 6) {
        getAmenityList(floorID);
      }
      if (typeId == 7) {
        getSafetyList(floorID);
      }
      if (typeId == 8) {
        getVerticalTransportList(floorID);
      }
      if (typeId == 9) {
        getAdvertisementList();
      }
      const result = response?.response?.data ?? [];
      if (response?.type === 1) {
        toast.success(result?.message);
        // navigate(`/view-floor/${id}`);
      } else {
        toast.error(response?.errormessage);
      }
    } catch (error) {
      
    }
    return;
  };

  const publishYesClick = (proId, values, isAccepted, ip) => {
    if (activeTab === "products" && addNewProduct) {
      document.getElementById("productSubmitBtn")?.click();
    } else if (activeTab === "locations" && addNewLocation) {
      document.getElementById("locationSubmitBtn")?.click();
    } else if (activeTab === "settings") {
      document.getElementById("prpjectSettingsBtn")?.click();
    } else if (activeTab === "floorDetails" && addNewFloor) {
      document.getElementById("FloorPlanAddBtn")?.click();
    } else if (activeTab === "beacons" && addNewQrCodeBeacon) {
      document.getElementById("beaconSubmitBtn")?.click();
    } else if (activeTab === "safety" && addNewSafety) {
      document.getElementById("safetySubmitBtn")?.click();
    } else if (activeTab === "amenitys" && addNewAmenity) {
      document.getElementById("amenitySubmitBtn")?.click();
    } else if (activeTab === "verticalTransport" && addNewVertical) {
      document.getElementById("transportSubmitBtn")?.click();
    } else if (activeTab === "advertisements" && addNewAd) {
      document.getElementById("advertisementSubmitBtn")?.click();
    }

    setTimeout(() => {
      handlePublish(proId, values, isAccepted, ip);
    }, 800);
  };

  useEffect(() => {
    // handleEnableDisable();
  }, [typeId, floorID]);

  const handleDiscard = async () => {
    let data = {
      id: Number(id),
    };
    try {
      const reqUrl = `discard`;
      const response = await postRequest(reqUrl, data);
      // console.log(response, typeId);
      handleEnableDisable();
      if (typeId == 1) {
        getProjectById();
        // setFloorID(null);
        getFloorDropdown("discard");
      }
      if (typeId > 1) {
        onSideBarIconClick(activeTab);
        // setFloorID(null);

        getFloorDropdown("discard");
        let floor;
        setSelFloorPlanDtls((prev) => {
          floor = prev;
          return prev;
        });
        // setAddNewFloor(false);
        // console.log(floor);
        // obj=''
      }
      if (typeId == 2) {
        getFloorsList();
      }
      if (typeId == 3) {
        getLocationList(floorID);
        // setAddNewLocation(false);
        // onSideBarIconClick(activeTab)
      }
      if (typeId == 4) {
        getProductList(floorID);
        // setAddNewProduct(false);
      }
      if (typeId == 5) {
        getBeaconList(floorID);
        // setAddNewQrCodeBeacon(false);
      }
      if (typeId == 6) {
        getAmenityList(floorID);
        // setAddNewAmenity(false);
      }
      if (typeId == 7) {
        getSafetyList(floorID);
        // setAddNewSafety(false);
      }
      if (typeId == 8) {
        getVerticalTransportList(floorID);
        // setAddNewVertical(false);
      }
      if (typeId == 9) {
        getAdvertisementList();
        // setAddNewVertical(false);
      }
      revertPackage(id);
      const result = response?.response?.data ?? [];
      toast.success(result?.message);
    } catch (error) {
      
    }
  };

  const handleEnableDisable = async () => {
    EnableDisable(id, setIsPublish, setIsDiscard);
  };

  const handleSubmitProject = async (values, setFieldError) => {
    setLoading(true)
    const formdata = new FormData();
    if (croppedImage?.startsWith("data:image")) {
      const base64Logo = croppedImage;
      formdata.append(`logo`, base64Logo);
    } else {
      const trimmedImageUrl = values?.logo
        ? values?.logo?.replace(image_url, "")
        : "";
      formdata.append(`logo`, trimmedImageUrl);
    }
    formdata.append(
      `customer_id`,
      values?.enc_customer_id ?? getCurrentUser()?.user?.common_id
    );
    formdata.append(`project_name`, values?.project_name);
    // formdata.append(`location_tags`, values?.location_tags == null || values?.location_tags == '' ? [] : values?.location_tags);
    // formdata.append(`product_tags`, values?.product_tags == null || values?.product_tags == '' ? [] : values?.product_tags);
    formdata.append(`background_color`, values?.background_color);
    formdata.append(`fill_color`, values?.fill_color);
    formdata.append(`border_thick`, values?.border_thick);
    formdata.append(`border_color`, values?.border_color);
    formdata.append(`inactive_color`, values?.inactive_color);
    formdata.append(`location_color`, values?.location_color);
    formdata.append(`product_color`, values?.product_color);
    formdata.append(`start_color`, values?.start_color);
    formdata.append(`beacon_color`, values?.beacon_color);
    formdata.append(`amenity_color`, values?.amenity_color);
    formdata.append(`safety_color`, values?.safety_color);
    formdata.append(`level_change_color`, values?.level_change_color);
    formdata.append(`navigation_color`, values?.navigation_color);

    formdata.append(`is_pass_protected`, values?.is_pass_protected ? 1 : 0);
    formdata.append(`pass_update`, values?.pass_update ? 1 : 0);
    if (values?.is_pass_protected && values?.pass_update) {
      formdata.append(`password`, (values?.password && values?.pass_update) ? values?.password : 0);
      formdata.append(`confirm_password`, (values?.confirm_password && values?.pass_update)  ? values?.confirm_password : 0);
    }

    formdata.append(
      `error_reporting_email`,
      values?.error_reporting_email ?? ""
    );
    formdata.append(`navigation_thick`, values?.navigation_thick ?? "3");

    if (values?.enc_id) {
      formdata.append(`_method`, "PUT");
      formdata.append(`id`, values?.enc_id);
      formdata.append(`is_published`, "0");
      formdata.append(`discard`, "1");
      formdata.append(`publish`, "1");
    }
    try {
      const reqUrl = values?.enc_id ? `project/${values?.enc_id}` : `project`;
      const response = await postRequest(reqUrl, formdata, true);
      const data = response.response?.data ?? [];
      if (response.type === 1) {
        getProjectById();
        toggle();
        toast.success(data?.message);
      } else {
        SetBackEndErrorsAPi(response, setFieldError);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false)
  };

  const onpanClick = () => {
    setPanTool((prev) => {
      canvas.current.forEachObject((obj) => {
        if (["location", "product", "beacon", "safety", "amenity", "vertical"].includes(obj?.name)) {
          if (!prev) {   
            obj.set({
              hoverCursor: "default",
              selectable: false,
            })
          } else {
            obj.set({
              hoverCursor: "grab",
              selectable: true,
            })
          }
        }
      })
      return !prev
    }
    );
    if (activeTab == "floorDetails") {
      setToolActive("");
      setSelTracingId();
    }
    if (activeTab == "traversable") {
      setToolTraversible();
      stopPathDrawing();
    }
  };


  const [pathModal, setPathModal] = useState(false)
  const TransportModaltoggle = () => setPathModal(!pathModal);

  const closeTransportModal =() => {
    setPathModal(false)
    setModalVertical(true)
  }
  const submitTransportModal= () => {
    setPathModal(false)
    toggleVerticalClose()
    FindSecondaryPathCalculation()
  }
  const dropRefs = {
    products: dropProduct,
    locations: dropLocation,
    beacons: dropBeacon,
    amenitys: dropAmenity,
    safety: dropSafety
  };


  const [refmodal, setRefModal] = useState(false)
    const [refmodalData, setrefModalData] = useState(false)
    const [refLoading, setRefLoading] = useState(false)
    const reftoggle = () => {
      setRefModal(!modal)
      setrefModalData(false)
    }
    const closeReftoggle = () => {
      setRefModal(false)
      setrefModalData(false)
    }
  
  const replaceRefImage = async (e) => {
    setSelFloorPlanDtls((prev) => ({
        ...prev,
        plan: "",
        image:refmodalData
      }))
      setRefLoading(true)
      e.preventDefault()
      const formdata = new FormData();
      formdata.append(`id`, selFloorPlanDtls?.enc_id);
      formdata.append(`project_id`, selFloorPlanDtls?.enc_project_id);
      formdata.append(`floor_img`, refmodalData);
  
      try {
        const reqUrl = 'floor-plan/replace-ref-img'
        const response = await postRequest(reqUrl, formdata, true);
        const data = response.data ?? [];
        
        if (response?.type === 1) {
          // reftoggle()
          document.getElementById('FloorPlanAddBtn')?.click()
        }
      } catch (error) {
        console.log(error);
      }
    }

  return (
    <>
      <ProjectHeaderDiv
        projectSettings={projectSettings}
        savingTimer={savingTimer}
        isDiscard={isDiscard}
        isPublish={isPublish}
        projectSettingData={projectSettingData}
        isDirty={isDirty}
        discardClick={discardClick}
        publishClick={publishClick}
        toggle={toggle}
        onExitClick={onExitClick}
        handleDiscard={handleDiscard}
        publishYesClick={publishYesClick}
      />

      <div className="bp-container  ">

        {isCommonSidebarVisible && (
          <BPCommonSideBar
            activeTab={activeTab}
            onIconClick={onSideBarIconClick}
            floorPlans={floorPlans}
            selLocationDtls={selLocationDtls}
            selProductDtls={selProductDtls}
            selFloorPlanDtls={selFloorPlanDtls}
            selBeaconDtls={selBeaconDtls}
            selAmenityDtls={selAmenityDtls}
            selSafetyDtls={selSafetyDtls}
            selVerticalDtls={selVerticalDtls}
            setTypeId={setTypeId}
            projectSettings={projectSettings}
          />
        )}

        {!isCommonSidebarVisible && (
          <>

            {activeTab === "floorDetails" && (
              <FloorPlanDtlsBar
                floorPlans={floorPlans}
                setFloorPlans={setFloorPlans}
                setFloorPlansPathSort={setFloorPlansPathSort}
                selFloorPlanDtls={selFloorPlanDtls}
                setSelFloorPlanDtls={setSelFloorPlanDtls}
                tracings={tracings}
                setTracings={setTracings}
                setTracingCircle={setTracingCircle}
                isEdit={isEdit}
                setIsEdit={setIsEdit}
                setTempPolygon={setTempPolygon}
                id={id}
                getFloorDropdown={getFloorDropdown}
                setProjectSettings={setProjectSettings}
                projectSettings={projectSettings}
                setLocations={setLocations}
                locations={locations}
                getLocationList={getLocationList}
                getProductList={getProductList}
                getBeaconList={getBeaconList}
                getAmenityList={getAmenityList}
                getSafetyList={getSafetyList}
                getVerticalTransportList={getVerticalTransportList}
                setProducts={setProducts}
                products={products}
                setFloorID={()=>{}}
                addNewFloor={addNewFloor}
                setAddNewFloor={setAddNewFloor}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                setDropDownFloor={setDropDownFloor}
                handleTraversibleData={handleTraversibleData}
                graph={graph}
                setVerticalTransports={setVerticalTransports}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                getFloorsList={getFloorsList}
                handleEnableDisable={handleEnableDisable}
                canvasBackgroundImageHandler={canvasBackgroundImageHandler}
                zoomInOut={zoomInOut}
                setZoomInOut={setZoomInOut}
                texts={texts}
                setTexts={setTexts}
                setToolActive={setToolActive}
                floorID={floorID}
                canvasContainerRef={canvasContainerRef}
                clearPinsList={clearPinsList}
                removePins={removePins}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                onMapDivClick={onMapDivClick}
                getProjectById={getProjectById}
                setTracingIntialValue={setTracingIntialValue}
                setPanTool={setPanTool}
                totalPinCount={totalPinCount}
                resetCanvasTransform={resetCanvasTransform}
                setTextStyleValue={setTextStyleValue}
                renderTracings={renderTracings}
                handlezoomPost={handlezoomPost}
                setLoadingSacle={setLoadingSacle}
                setRefLoading={setRefLoading}
                closeReftoggle={closeReftoggle}
                setFloorPlanModal={setFloorPlanModal}
                setSelImageOrSvgValues={setSelImageOrSvgValues}
                removeFabricObjectsByName={() => removeFabricObjectsByName(canvas, "tracing")}
                renderTracingCircles={renderTracingCircles}
                renderTexts={renderTexts}
                getSvgFileAsRefImage={getSvgFileAsRefImage}
              /> 
            )}

            {activeTab === "settings" && (
              <PSSideBar
                projectSettings={projectSettings}
                setProjectSettings={setProjectSettings}
                id={id}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                getFloorPlanByid={getFloorPlanByid}
                setFloorID={()=>{}}
                setDropDownFloor={setDropDownFloor}
                getFloorDropdown={getFloorDropdown}
                floorPlanSelect={floorList}
                getProjectById={getProjectById}
                setCroppedImage={setCroppedImage}
                croppedImage={croppedImage}
                setLoading={setLoading}
                loading={loading}
                projectSettingData={projectSettingData}
                setProjectSettingData={setProjectSettingData}
                floorID={floorID}
                setCommonSidebarVisible={setCommonSidebarVisible}
                canvasBackGroundColor={canvasBackGroundColor}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
                canvas={canvas}
              />
            )}

            {activeTab === "locations" && (
              <LocationsSideBar
                locations={locations}
                setLocations={setLocations}
                selLocationDtls={selLocationDtls}
                setSelLocationDtls={setSelLocationDtls}
                selFloorPlanDtls={selFloorPlanDtls}
                id={id}
                floorID={floorID}
                floorIDs={floorIDs}
                projectSettings={projectSettings}
                addNew={addNewLocation}
                setAddNew={setAddNewLocation}
                hours={hours}
                setHours={setHours}
                promotions={promotions}
                setPromotions={setPromotions}
                isBoundary={isBoundary}
                setIsBoundary={setIsBoundary}
                getLocationList={getLocationList}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                boundaryAttributes={boundaryAttributes}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                totalPinsUsed={totalPinsUsed}
                totalPinCount={totalPinCount}
                setFloorID={()=>{}}
                locationList={locationList}
                getFloorPlanByid={getFloorPlanByid}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                floorPlanSelect={floorList}
                setIsDirty={setIsDirty}
                isDirty={isDirty}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
                stopPathDrawing={stopPathDrawing}
                resetCanvasTransform={resetCanvasTransform}
                canvas={canvas}
                onEditLocation={onEditLocation}
                setStoredObjects={setStoredObjects}
                websiteLinks={websiteLinks} 
                setwebsiteLinks={setwebsiteLinks}
              />
            )}

            {activeTab === "products" && (
              <ProductSideBar
                products={products}
                setProducts={setProducts}
                selProductDtls={selProductDtls}
                setSelProductDtls={setSelProductDtls}
                selFloorPlanDtls={selFloorPlanDtls}
                id={id}
                floorID={floorID}
                floorIDs={floorIDs}
                setAddNew={setAddNewProduct}
                addNew={addNewProduct}
                projectSettings={projectSettings}
                getProductList={getProductList}
                images={images}
                setImages={setImages}
                specifications={specifications} 
                setSpecifications={setSpecifications}
                websiteLinks={websiteLinks} 
                setwebsiteLinks={setwebsiteLinks}
                onEditProduct={onEditProduct}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                totalPinsUsed={totalPinsUsed}
                totalPinCount={totalPinCount}
                setFloorID={()=>{}}
                productList={productList}
                getFloorPlanByid={getFloorPlanByid}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                dropDownFloor={dropDownFloor}
                setIsDirty={setIsDirty}
                isDirty={isDirty}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
                stopPathDrawing={stopPathDrawing}
                resetCanvasTransform={resetCanvasTransform}
                canvas={canvas}
                setStoredObjects={setStoredObjects}
              />
            )}

            {activeTab === "beacons" && (
              <QrcodeBeaconSideBar
                id={id}
                floorID={floorID}
                setAddNew={setAddNewQrCodeBeacon}
                addNew={addNewQrCodeBeacon}
                selBeaconDtls={selBeaconDtls}
                setSelBeaconDtls={setSelBeaconDtls}
                projectSettings={projectSettings}
                beacons={beacons}
                setBeacons={setBeacons}
                selFloorPlanDtls={selFloorPlanDtls}
                getBeaconList={getBeaconList}
                onEditBeacon={onEditBeacon}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                totalPinsUsed={totalPinsUsed}
                totalPinCount={totalPinCount}
                setFloorID={()=>{}}
                beaconList={beaconList}
                getFloorPlanByid={getFloorPlanByid}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                setIsDirty={setIsDirty}
                isDirty={isDirty}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
                stopPathDrawing={stopPathDrawing}
                resetCanvasTransform={resetCanvasTransform}
                prefilledMessage={prefilledMessage}
                setPrefilledMessage={setPrefilledMessage}
                setStoredObjects={setStoredObjects}
                canvas={canvas}
              />
            )}

            {activeTab === "amenitys" && (
              <AmenitySideBar
                id={id}
                floorID={floorID}
                setAddNew={setAddNewAmenity}
                addNew={addNewAmenity}
                selAmenityDtls={selAmenityDtls}
                setSelAmenityDtls={setSelAmenityDtls}
                projectSettings={projectSettings}
                amenities={amenities}
                setAmenities={setAmenities}
                selFloorPlanDtls={selFloorPlanDtls}
                getAmenityList={getAmenityList}
                onEditAmenity={onEditAmenity}
                setAminityIcons={setAminityIcons}
                aminityIcons={aminityIcons}
                // getAmenityIconDropDown={getAmenityIconDropDown}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                setFloorID={()=>{}}
                amenityList={amenityList}
                getFloorPlanByid={getFloorPlanByid}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                setIsDirty={setIsDirty}
                isDirty={isDirty}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
                resetCanvasTransform={resetCanvasTransform}
                setStoredObjects={setStoredObjects}
              />
            )}

            {activeTab === "safety" && (
              <SafetySideBar
                id={id}
                floorID={floorID}
                setAddNew={setAddNewSafety}
                addNew={addNewSafety}
                selSafetyDtls={selSafetyDtls}
                setSelSafetyDtls={setSelSafetyDtls}
                projectSettings={projectSettings}
                safeties={safeties}
                setSafeties={setSafeties}
                selFloorPlanDtls={selFloorPlanDtls}
                getSafetyList={getSafetyList}
                onEditSafety={onEditSafety}
                setSafetyIcons={setSafetyIcons}
                safetyIcons={safetyIcons}
                getSafetyIconDropDown={getSafetyIconDropDown}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                setFloorID={()=>{}}
                safetyList={safetyList}
                getFloorPlanByid={getFloorPlanByid}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                setIsDirty={setIsDirty}
                isDirty={isDirty}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
                resetCanvasTransform={resetCanvasTransform}
                setStoredObjects={setStoredObjects}
              />
            )}

            {activeTab === "traversable" && (
              <TraversableSideBar
                id={id}
                floorID={floorID}
                setAddNew={setAddNewTraversablePath}
                addNew={addNewTraversablePath}
                projectSettings={projectSettings}
                selFloorPlanDtls={selFloorPlanDtls}
                options={dropValues}
                setSelTraversibleDetails={setSelTraversibleDetails}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                selTraversibleDetails={selTraversibleDetails}
                toggleVertical={toggleVertical}
                switchFloor={switchFloor}
                switchFloorPlan={switchFloorPlan}
                graph={graph}
                verticalTransports={verticalTransports}
                setCommonSidebarVisible={setCommonSidebarVisible}
                setActiveTab={setActiveTab}
                showPath={showPath}
                allVerticalTransports={allVerticalTransports}
                setFloorID={()=>{}}
                handleEndDirectionclick={handleEndDirectionclick}
                setPanTool={setPanTool}
                canvas={canvas}
                setSelectedPaths={setSelectedPaths}
                generateAutoConnections={generateAutoConnections}
                setIsWheechairChecked={setIsWheechairChecked}
              />
            )}

            <VerticalTransportModal
              modal={modalVertical}
              setModal={setModalVertical}
              toggle={toggleVertical}
              close={()=>toggleVerticalClose(true)}
              verticalTransport={removeDuplicates(verticalTransports)}
              // verticalTransport={removeDuplicates(allVerticalTransports)}
              ChangeSvgColorPassingBE={ChangeSvgColorPassingBE}
              onSelectVerticalTransport={onSelectVerticalTransport}
              allVerticalTransports={allVerticalTransports}
              destinationData={floorList?.find(
                (item) => item?.enc_id == selTraversibleDetails?.to_floor_id
              )}
              currentFloorVTS={verticalTransports}
              handleWheelchairCheck={handleWheelchairCheck}
              isWheechairChecked={isWheechairChecked}
              handleShowtransportsInModal={handleShowtransportsInModal}
            />

            {activeTab === "verticalTransport" && (
              <VerticalTransportSideBar
                id={id}
                floorID={floorID}
                setAddNew={setAddNewVertical}
                addNew={addNewVertical}
                selVerticalDtls={selVerticalDtls}
                setselVerticalDtls={setselVerticalDtls}
                projectSettings={projectSettings}
                setVerticalTransportlist={setVerticalTransportlist}
                verticalTransportlist={verticalTransportlist}
                selFloorPlanDtls={selFloorPlanDtls}
                setSelFloorPlanDtls={setSelFloorPlanDtls}
                getVerticalTransportList={getVerticalTransportList}
                onEditVerticaltransport={onEditVerticaltransport}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                setVerticalFloorId={setVerticalFloorId}
                verticalFloorId={verticalFloorId}
                setVerticalIcons={setVerticalIcons}
                verticalIcons={verticalIcons}
                getVerticalTransportIconDropDown={
                  getVerticalTransportIconDropDown
                }

                getFloorPlanByid={getFloorPlanByid}
                setVerticalTransports={setVerticalTransports}
                setTracings={setTracings}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                setIsDirty={setIsDirty}
                isDirty={isDirty}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
                setFloorID={()=>{}}
                resetCanvasTransform={resetCanvasTransform}
                setStoredObjects={setStoredObjects}
              />
            )}

            {activeTab === "advertisements" && (
              <AdvertisementSideBar
                id={id}
                floorID={floorID}
                setAddNew={setAddNewAd}
                addNew={addNewAd}
                selAd={selAd}
                setSelAd={setSelAd}
                projectSettings={projectSettings}
                safeties={safeties}
                setSafeties={setSafeties}
                selFloorPlanDtls={selFloorPlanDtls}
                setAdList={setAdList}
                onEditAd={onEditAd}
                setSafetyIcons={setSafetyIcons}
                safetyIcons={safetyIcons}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                setSavingTimer={setSavingTimer}
                savingTimer={savingTimer}
                handleEnableDisable={handleEnableDisable}
                setFloorID={()=>{}}
                adList={adList}
                getFloorPlanByid={getFloorPlanByid}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                setCommonSidebarVisible={setCommonSidebarVisible}
                getAdvertisementList={getAdvertisementList}
                setIsDirty={setIsDirty}
                isDirty={isDirty}
                setPanTool={setPanTool}
                setIsValid={setIsValid}
              />
            )}
          </>
        )}

        <div className="bp-sub-2" style={{position:"relative"}} ref={canvasContainerRef}> 
          {overlay && <Overlay projectSettings={projectSettings}/>}
          {activeTab === "floorDetails" && addNewFloor && (
            <FloorPlanDtls
              selTracingId={selTracingId}
              projectSettings={projectSettings}
              selFloorPlanDtls={selFloorPlanDtls}
              setSelFloorPlanDtls={setSelFloorPlanDtls}
              setIsEdit={setIsEdit}
              isEdit={isEdit}
              floorID={floorID}
              onChangeTracingMetadata={onChangeTracingMetadata}
              onDeleteTracing={onDeleteTracing}
              tracingIntialValue={tracingIntialValue}
              setTracingIntialValue={setTracingIntialValue}
              onSaveTracingStyle={onSaveTracingStyle}
              toolActive={toolActive}
              setToolActive={setToolActive}
              textStyleHandler={textStyleHandler}
              selObject={selObject}
              setSelObject={setSelObject}
              stopPathDrawing={stopPathDrawing}
              activeText={activeText}
              setProjectSettings={setProjectSettings}
              setPanTool={setPanTool}
              // resizeAndScaleCanvas={resizeAndScaleCanvas}
              setTextStyleValue={setTextStyleValue}
              onSelectReferanceImage={onSelectReferanceImage}
              importSvg={importSvg}
              handleDeleteRefImage={handleDeleteRefImage}
              fileKey={fileKey}
              duplicateObject={duplicateObject}
              getSvgFileAsRefImage={getSvgFileAsRefImage}
              reftoggle={reftoggle}
            />
          )}

          <ReferenceImageModal
            modal={floorPlanModal}
            values={selFloorPlanDtls}
            toggle={toggleReferanceImg}
            handleScaleSubmit={handleScaleSubmit}
            selImageOrSvgValues={selImageOrSvgValues}
            setSelImageOrSvgValues={setSelImageOrSvgValues}
            loading={loadingScale}
            setSelFloorPlanDtls={setSelFloorPlanDtls}
          />

          {activeTab === "traversable" && addNewTraversablePath && (
            <TraversablePathTools
              selTracingId={selTracingId}
              projectSettings={projectSettings}
              selFloorPlanDtls={selFloorPlanDtls}
              setSelFloorPlanDtls={setSelFloorPlanDtls}
              setIsEdit={setIsEdit}
              isEdit={isEdit}
              floorID={floorID}
              tracingIntialValue={tracingIntialValue}
              onSaveTracingStyle={onSaveTracingStyle}
              toolActive={toolTraversible}
              setToolActive={setToolTraversible}
              deleteSelectedObjects={deleteSelectedObjects}
              selectedPaths={selectedPaths}
              setPanTool={setPanTool}
              panTool={panTool}
              setTraversibleHistory={setTraversibleHistory}
              generateAutoConnections={generateAutoConnections}
            />
          )}

          <ShortestpathModal pathModal={pathModal} TransportModaltoggle={TransportModaltoggle} closeTransportModal={closeTransportModal} submitTransportModal={submitTransportModal}/>



          <div
            className={`tracing-wrpr `}
            style={{
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
            ref={drop} 
            id="map-div"
            onClick={onMapDivClick}
          >
            
            <div className="pin-drag-drop-div"
              // ref={activeTab === 'products' ? dropProduct : dropLocation}
              ref={dropRefs[activeTab]}
            >
              {/* <CanvasDiv
                mapDivSize={mapDivSize}
                canvas={canvas}
                onScrollBarMove={onScrollBarMove}
                canvasCenter={canvasCenter}
                currentZoom={currentZoom}
              /> */}
              <NewComponent/>

            </div>

            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                height: `${mapDivSize.height - 166}`,
                opacity: 0.3,
                pointerEvents: "none",
              }}
            />

            {!addNewFloor && (
              <div className={`bp-select-wrpr`}>
                <CustomSelect
                  options={floorList.map((floor) => ({
                    value: floor.enc_id,
                    label: floor?.floor_plan,
                    id: floor?.enc_id,
                    plan: floor?.plan,
                    dec_id: floor?.dec_id,
                  }))}
                  setSelectedOption={
                    activeTab === "verticalTransport" && addNewVertical
                      ? onLevelDDChangeVT
                      : onLevelDDChange
                  }
                  selectedOption={currentFloor}
                  value={floorID}
                  from="floorplan"
                />
              </div>
            )}

            {!addNewFloor && (
              <TotalPinsDiv
                activeTab={activeTab}
                totalPinsUsed={totalPinsUsed}
                projectSettings={projectSettings}
                addNewFloor={addNewFloor}
              />
            )}

            {/* {activeTab != "traversable" && ( */}
              <div className="pan-bar" id="panBar">
                <div
                  className="tool-icons-pan"
                  style={{
                    // backgroundColor: panTool ? "#f0f8fc" : "#f5f6f7",
                    backgroundColor: "transparent",
                    color: panTool ? "#26a3db" : "#6a6d73",
                  }}
                  onClick={() => {
                    onpanClick();
                  }}
                >
                  <MdPanTool />
                </div>
              </div>
            {/* )} */}

            <UncontrolledTooltip placement="top" target={`panBar`}>
              Pan
            </UncontrolledTooltip>

          </div>
        </div>
      </div>

      <EditProjectModal
        modal={modal}
        toggle={toggle}
        showpassfield={showpassfield}
        initialValues={projectSettingData}
        validationSchema={validationSchema}
        handleSubmitProject={handleSubmitProject}
        loading = {loading}
      />

      <PaymentForm
        toggleStripe={toggleStripe}
        stripeModal={stripeModal}
        planDetails={planDetails}
        project_id={id}
        fromStatus={false}
        from="project"
        // handlePublish={handlePublish}
        handlePublish={publishYesClick}
        loadingPublish={loadingPublish}
        setLoadingPublish={setLoadingPublish}
        fromUpgrade={false}
      />


      <Modal
        isOpen={refmodal}
        toggle={closeReftoggle}
        // size="lg"
        style={{ maxWidth: '550px', borderRadius:"17px",zIndex: "999999 !important" }}
        centered
        className="reference-image-delete-modal"
      >
        <div className="delete-close" onClick={() => {
          closeReftoggle()
        }}>
          <IoMdClose style={{ fontSize: '10px' }} />
        </div>
        <ModalBody>
          {!refmodalData ?
            <div style={{ justifyContent: "center", position: "relative" }}>
              <div className="reference-image-options">
                <h3>what would you like to do?</h3>
                <div>
                  <div className="reference-image-options-item">
                    <label>
                      <input
                        key={fileKey}
                        type='file'
                        hidden
                        onChange={(e) => {
                          onSelectReferanceImage(e)
                          reftoggle()    
                          // handleDeleteRefImage()
                        }}
                        name='refImg'
                        id='fileInput'
                        // ref={referenceImageRef}
                        accept=' .png, .jpg, .jpeg, .svg'
                      />
                      <div>
                        <IoImageOutline fontSize={50}/>
                      </div>
                      <h4>Change Background</h4>
                      <p>Clears everything and sets a new background image.</p>
                      <h5>(Best if you're starting fresh.)</h5>
                    </label>
                  </div>
                  <div className="reference-image-options-item">
                    <label>
                      <input
                        key={fileKey}
                        type='file'
                        hidden
                        onChange={(e) => {
                          // onSelectReferanceImage(e,true)
                          setrefModalData(e.target.files[0])
                        }}
                        name='refImg'
                        id='fileInput'
                        // ref={referenceImageRef}
                        accept=' .png, .jpg, .jpeg, .svg'
                      />
                      <div>
                        <RiRestartLine fontSize={50}/>
                      </div>
                      <h4>Replace Image</h4>
                      <p>Keeps the same size and position. Just swap the image.</p>
                      <h5>(Useful for updating an existing image.)</h5>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          :
            <form onSubmit={replaceRefImage} style={{justifyContent:"center",position:"relative"}}>
              <div style={{border:"1px solid rgba(167, 167, 167, 0.5)"}}>
                <img src={URL.createObjectURL(refmodalData)} style={{margin:"auto"}}/>
              </div>
                {/* <div style={{display:"flex",justifyContent:"right",marginTop:"10px",gap:"10px"}}>
                  <button className="btn-primary bar-btn  btn btn-secondary btn-medium" type="button" onClick={()=>setrefModalData(false)}>cancel</button>
                  <button className="btn-primary bar-btn  btn btn-secondary btn-medium">submit</button>
                </div> */}
              
              <div
                className="form-group text-right "
                style={{ marginTop: "30px" }}
              >
                <Button
                  color="secondary"
                  className="btn btnCancel mr-3"
                  onClick={() => {
                    setrefModalData(false)
                  }}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit"  className="btn btn-primary float-right" disabled={refLoading} >
                  {refLoading ? (
                    <>
                      <p style={{ opacity: '0', position: 'relative' }}>Save</p>
                      <Spinner
                        className="ml-2 spinner-style"
                        color="light"
                      />
                    </>
                  ) : 'Save'}
                </Button>
              </div>
            </form>
          }  
        </ModalBody>
      </Modal>
    </>
  );
};
export default ViewFloor;
