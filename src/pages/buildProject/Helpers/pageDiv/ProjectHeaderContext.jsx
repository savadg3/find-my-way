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
import { setCurrentFloor, setFloorList, setPinCount, setProjectData } from "../../../../store/slices/projectItemSlice";
import { useDispatch } from "react-redux";
import { environmentaldatas } from "../../../../constant/defaultValues";
import { useLoadPins } from "../../../../components/map/components/hooks/useLoadPins";
import { PinCountApi } from "../../../../components/map/components/helpers/projectApi";

const ProjectHeaderContext = createContext(null);

export const ProjectHeaderProvider = ({ children }) => {
    const { id }        = useParams(); 
    const decodedId     = decode(id); 
    const navigate      = useNavigate();
    const dispatch      = useDispatch();
    const { image_url } = environmentaldatas;
    
    const { loading : pinLoading, error } = useLoadPins(decodedId);
    
    
    /* ── project data ── */
    const [projectSettings, setProjectSettings] = useState({});
    const [projectSettingData, setProjectSettingData] = useState({});
    
    /* ── header UI state ── */
    const [savingTimer, setSavingTimer] = useState(false);
    const [isPublish, setIsPublish] = useState("");
    const [isDiscard, setIsDiscard] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    
    /* ── edit-project-name modal ── */
    const [modal, setModal] = useState(false);
    const [showpassfield, setshowpassfield] = useState(false);
    
    const toggle = (type) => {
        if (type === "passprotect") {
            setshowpassfield(true);
        } else {
            setshowpassfield(false);
        }
        setModal((prev) => !prev);
    };
    
    /* ── fetch project ── */
    const getProjectById = useCallback(async () => {
        try {
            const response = await getRequest(`project/${decodedId}`);
            const data = response.data ?? [];
            const newValue = data?.is_pass_protected
            ? { password: 111111, confirm_password: 111111 }
            : {};
            
            const value = {
                ...data,
                ...newValue,
                width: data?.width ? Number(data.width) : null,
                height: data?.height ? Number(data.height) : null,
                location: [75.78044926997217, 11.258814157509704],
                logo:data?.logo ? image_url + data?.logo : ""
            };
            
            dispatch(setProjectData(value));
            
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
    
    /* ── enable / disable (publish + discard button state) ── */
    const handleEnableDisable = useCallback(() => {
        EnableDisable(decodedId, setIsPublish, setIsDiscard);
    }, [decodedId]);
    
    const handleTotalPinCount = useCallback( async () => {  
        let pinCount = await PinCountApi(decodedId) 
        dispatch(setPinCount(pinCount)); 
    }, [decodedId]);
    
    /* ── discard ── */
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
    
    /* ── publish ── */
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
    
    /* ── exit ── */
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
    
    /* ── bootstrap on mount ── */
    useEffect(() => {
        getProjectById();
        getFloorList()
        handleEnableDisable();
        handleTotalPinCount()
    }, [decodedId]);
    
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
