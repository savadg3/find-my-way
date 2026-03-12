import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import swal from "sweetalert";
import { getRequest, postRequest } from "../../../../hooks/axiosClient";
import {
    discardClick,
    EnableDisable,
    publishClick,
} from "../apis/otherApis";
import { decode } from "../../../../helpers/utils";
import { setCurrentFloor, setFloorList, setPinCount, setPinsByCategory, setProjectData } from "../../../../store/slices/projectItemSlice";
import { setMapCenter } from "../../../../store/slices/mapSlice";
import { useDispatch } from "react-redux";
import { environmentaldatas } from "../../../../constant/defaultValues";
import { useLoadPins } from "../../../../components/map/components/hooks/useLoadPins";
import { PinCountApi, GetFloorData } from "../../../../components/map/components/helpers/projectApi";
import { useSelector } from "react-redux";

const ProjectHeaderContext = createContext(null);

export const ProjectHeaderProvider = ({ children }) => {
    const { id }        = useParams(); 
    const decodedId     = decode(id); 
    const navigate      = useNavigate();
    const dispatch      = useDispatch();
    const { image_url } = environmentaldatas;

    const currentFloor = useSelector((state) => state.api.currentFloor);
    
    const { loading : pinLoading, error } = useLoadPins(decodedId);
    
    const [projectSettings, setProjectSettings] = useState({});
    const [projectSettingData, setProjectSettingData] = useState({});
    
    const [savingTimer, setSavingTimer] = useState(false);
    const [isPublish, setIsPublish] = useState("");
    const [isDiscard, setIsDiscard] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    
    const [modal, setModal] = useState(false);
    const [showpassfield, setshowpassfield] = useState(false);

    useEffect(()=>{
        
    },[currentFloor])
    
    const toggle = (type) => {
        if (type === "passprotect") {
            setshowpassfield(true);
        } else {
            setshowpassfield(false);
        }
        setModal((prev) => !prev);
    };
    
    const getProjectById = useCallback(async () => {
        try {
            const response = await getRequest(`project/${decodedId}`);
            const data = response.data ?? [];
            const newValue = data?.is_pass_protected
            ? { password: 111111, confirm_password: 111111 }
            : {};
            
            let center = JSON.parse(data?.center)
            const value = {
                ...data,
                ...newValue,
                width:  data?.width  ? Number(data.width)  : null,
                height: data?.height ? Number(data.height) : null,
                logo:   data?.logo   ? image_url + data?.logo : "",

                positions : center ? {
                    x: center?.lng,
                    y: center?.lat
                } : null,
                location_radius:  data?.radius_km ?? null,
                location_address: data?.address ?? null,
            };
 
            dispatch(setProjectData(value));
 
            if (data?.positions?.x != null && data?.positions?.y != null) {
                dispatch(setMapCenter([data.positions.x, data.positions.y]));
            }
            
            setProjectSettingData(value);
            setProjectSettings(value);
        } catch (error) {
            console.log(error);
        }
    }, [decodedId]);
    
    const getFloorList = useCallback(async () => {
        try {
            const response = await getRequest(`list-floor-plan/${decodedId}`);
            const data = response.data ?? [];  
            dispatch(setFloorList(data));
            dispatch(setCurrentFloor(data[0]));
        } catch (error) {
            console.log(error);
        }
    }, [decodedId]);
    
    const handleEnableDisable = useCallback(() => {
        EnableDisable(decodedId, setIsPublish, setIsDiscard);
    }, [decodedId]);
    
    const handleTotalPinCount = useCallback( async () => {  
        let pinCount = await PinCountApi(decodedId) 
        dispatch(setPinCount(pinCount)); 
    }, [decodedId]);

    const fetchFloorData = useCallback( async () => {  

        if(!currentFloor) return

        let getFloorData = await GetFloorData(currentFloor.enc_id)  
        let verticalItem = (getFloorData?.vertical_transports || []).map((item) => ({
            ...item,
            category:"vertical_transport",
            title:item?.vt_name ?? ''
        }))
        
        dispatch(
            setPinsByCategory({
                vertical_transport : verticalItem
            }
        ));
    }, [currentFloor]);
    
    const handleDiscard = async () => {
        try {
            const reqUrl = `discard-project`;
            const data = { id: Number(decodedId) };
            const response = await postRequest(reqUrl, data);
            const result = response?.response?.data ?? [];
            handleEnableDisable();
            getProjectById();
            toast.success(result?.message);
        } catch (error) {
            console.log(error);
        }
    };
    
    const onDiscardClick = () => {
        discardClick(handleDiscard);
    };
    
    const publishYesClick = async () => {
        try {
            const reqUrl = `publish-project`;
            const data = { id: Number(decodedId) };
            const response = await postRequest(reqUrl, data);
            const result = response?.response?.data ?? [];
            handleEnableDisable();
            getProjectById();
            toast.success(result?.message);
        } catch (error) {
            console.log(error);
        }
    };
    
    const onPublishClick = () => {
        publishClick(publishYesClick, projectSettings);
    };
    
    const onExitClick = () => {
        if (isDirty) {
            swal({
                title: "Are you sure you want to exit?",
                text: "You currently have pending changes. If you exit they'll be saved as a draft.",
                icon: "warning",
                buttons: [
                    { text: "No",  value: "No",  visible: true, className: "btn-danger",  closeModal: true },
                    { text: "Yes", value: "Yes", visible: true, className: "btn-success", closeModal: true },
                ],
            }).then((value) => {
                if (value === "Yes") {
                    navigate(`/project-list`);
                }
            });
        } else {
            navigate(`/project-list`);
        }
    };
    
    useEffect(() => {
        getProjectById();
        getFloorList()
        handleEnableDisable();
        handleTotalPinCount()
    }, [decodedId]);

    useEffect(() => {
        fetchFloorData(); 
    }, [currentFloor]);
    
    const value = { 
        projectSettings,
        setProjectSettings,
        projectSettingData,
        setProjectSettingData, 
        savingTimer,
        setSavingTimer,
        isPublish,
        isDiscard,
        isDirty,
        setIsDirty, 
        modal,
        toggle,
        showpassfield, 
        getProjectById,
        handleEnableDisable,
        onDiscardClick,
        onPublishClick,
        onExitClick,
        publishYesClick,
    };
    
    return (
        <ProjectHeaderContext.Provider value={value}>
        {children}
        </ProjectHeaderContext.Provider>
    );
};

export const useProjectHeader = () => {
    const ctx = useContext(ProjectHeaderContext);
    if (!ctx) {
        throw new Error("useProjectHeader must be used inside <ProjectHeaderProvider>");
    }
    return ctx;
};
