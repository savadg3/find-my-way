import swal from "sweetalert";
import { deleteRequest, getRequest, postRequest } from "../../../../hooks/axiosClient";
import { toast } from "react-toastify";
import { fetchPinData } from "../../../../components/map/components/hooks/useLoadPins";

const totalPinCountApi = async (id, setTotalPinsUsed) => {
    try {
        const response = await getRequest(`pins-used/${id}`);
        const data = response.data ?? [];
        setTotalPinsUsed(data);
    } catch (error) {
        //// console.log(error);
    }
};

const EnableDisable = async (id, setIsPublish, setIsDiscard) => {
    let data = {
        id: Number(id)
    };
    try {
        const reqUrl = `enable-disable`;
        const response = await postRequest(reqUrl, data);
        // console.log(response,"fnsdfnsdnf");
        
        const result = response?.response?.data?.status;
        if (result == "enable" || result == "publish") {
            setIsPublish(1);
        } else {
            setIsPublish(0);
        }
        if (result == "enable" || result == "draft") {
            setIsDiscard(0);
        } else {
            setIsDiscard(1);
        }
        if (result == "disable") {
            setIsPublish(0);
            setIsDiscard(1);
        }
        if (result == "discard") {
            // setIsPublish(0);
            setIsDiscard(0);
        }

    } catch (error) {
        console.log(error,"enable disable");
    }
};

const revertPackage = async (id) => {
    try {
        const reqUrl = `revert-package/${id}`;
        const response = await getRequest(reqUrl);
        // console.log('package-reverted-succesfully')
    } catch (error) {
        ////console.log(error);
    }
}

const discardClick = (handleDiscard) => {
    swal({
        title: "Are you sure you want to discard?",
        text: " Once discarded, the latest published details will be restored.",
        icon: "warning",
        buttons: [
            {
                text: "No",
                value: "No",
                visible: true,
                className: "btn-danger",
                closeModal: true
            },
            {
                text: "Yes",
                value: "Yes",
                visible: true,
                className: "btn-success",
                closeModal: true
            }
        ]
    }).then((value) => {
        switch (value) {
            case "Yes":
                handleDiscard();
                break;
            default:
                break;
        }
    });
};

const publishClick = (publishYesClick, projectSettings) => { 
    if (projectSettings?.logo == null) {
        toast.error("Please upload the project logo for publishing.");
    } else if (!projectSettings?.error_reporting_email) {
        toast.error("Please enter the error report recipient's email address to publish the project.");
    } else {
        swal({
            title: "Are you sure you want to publish?",
            text: "Publishing will overwrite old data, making it irreversible.",
            icon: "warning",
            buttons: [
                {
                    text: "No",
                    value: "No",
                    visible: true,
                    className: "btn-danger",
                    closeModal: true
                },
                {
                    text: "Yes",
                    value: "Yes",
                    visible: true,
                    className: "btn-success",
                    closeModal: true
                }
            ]
        }).then((value) => {
            switch (value) {
                case "Yes":
                    publishYesClick()
                    break;
                default:
                    break;
            }
        });
    }
};

const uploadTraversibleData = async (selFloorPlanDtls, graph, handleEnableDisable, getProjectById) => {
    const value = {
        id: selFloorPlanDtls?.enc_id,
        points_data: graph.getPositions(),
        edges_data: graph.getEdges(),
        highlight_data: graph.getHighlightNode(),
        sub_node: graph.getSubNode(),
        connected_nodes: graph.getConnectedMainPathNodes(),
        auto_connected_nodes : graph.getAutoConnectNode(),
        // addMainPathline: graph.getMainPathline(),
        // subpathLines: graph.getSubPathline(),
        // connectionPathline: graph.getConnectionPathline(),
        is_published: "0",
        discard: "1",
        publish: "1"
    };
    // console.log("path updated");
    const reqUrl = `update-pointedges`;
    const response = await postRequest(reqUrl, value);
    handleEnableDisable();
    getProjectById()
};

const PlanExpiryDetails = async (id, setModalPlan) => {
    try {
        const reqUrl = `plan-expiry/${id}`;
        const response = await getRequest(reqUrl);
        // console.log(response, 'delete')

        const data = response.data ?? [];
        // setPlanDetails(data)
        // console.log(data, 'plan-expiry');
        setModalPlan(true);

        return data
    } catch (error) {
        console.log(error);
    }
}

// const deletePinApi = async (api, setFloorID, floorID, getProductList, handleEnableDisable, projectSettings, id,categories=[]) => {
//     try {
//         const response = await deleteRequest(api);
//         const data = response.data ?? [];
//         // console.log(data, 'data')
//         toast.success(data?.message);
//         let floor_id
//         setFloorID((prev) => {
//             floor_id = prev;
//             return prev;
//         });
//         getProductList(floor_id ?? floorID);
//         handleEnableDisable();
//         if (projectSettings) {
//             revertPackage(projectSettings?.enc_id)
//         }

//         if(categories.length > 0){
//             return fetchPinData(id, categories);
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }
const deletePinApi = async (api, projectSettings, id,categories=[]) => {
    try {
        const response = await deleteRequest(api);
        const data = response.data ?? [];
        // console.log(data, 'data')
        toast.success(data?.message);
        // let floor_id
        // setFloorID((prev) => {
        //     floor_id = prev;
        //     return prev;
        // });
        // getProductList(floor_id ?? floorID);
        // handleEnableDisable();
        if (projectSettings) {
            revertPackage(projectSettings?.enc_id)
        }

        if(categories.length > 0){
            return fetchPinData(id, categories);
        }
    } catch (error) {
        console.log(error);
    }
}

const deleteSubPinApi = async (id,setFloorID,floorID, getProductList, handleEnableDisable, projectSettings) => {
  try {
    const response = await deleteRequest(`group-product/${id}`);

    if (response?.data) {
        toast.success(response.data.message);
        let floor_id
        setFloorID((prev) => {
            floor_id = prev;
            return prev;
        });
        getProductList(floor_id ?? floorID);
        handleEnableDisable();
        if (projectSettings) {
            revertPackage(projectSettings?.enc_id)
        }
    } 
    else if (response?.type === 2) {
      toast.error(response.errormessage || "Failed to delete");
    } else {
      toast.error("Unknown error");
    }

    console.log(response, "Response from delete");
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Unexpected error occurred");
  }
};


// const removePinApi = async (api, para, setFloorID, floorID, getProductList, handleEnableDisable, projectSettings, id, categories=[]) => {

//     try {
//         const response = await postRequest(api, para);
//         console.log(response);
//         const data = response.response?.data ?? [];
//         toast.success(data?.message);
//         let floor_id
//         setFloorID((prev) => {
//             floor_id = prev;
//             return prev;
//         });
//         // getProductList(floor_id ?? floorID); 
//         handleEnableDisable();
//         if (projectSettings) {
//             revertPackage(projectSettings?.enc_id)
//         }
//         if(categories.length > 0){
//             return fetchPinData(id, categories);
//         }
//         return data
//     } catch (e) {
//         console.log(e,"error");
//     }

// }
const removePinApi = async (api, para, projectSettings, id, categories=[]) => {

    try {
        const response = await postRequest(api, para);
        console.log(response);
        const data = response.response?.data ?? [];
        toast.success(data?.message);
        // let floor_id
        // setFloorID((prev) => {
        //     floor_id = prev;
        //     return prev;
        // });
        // getProductList(floor_id ?? floorID); 
        // handleEnableDisable();
        if (projectSettings) {
            revertPackage(projectSettings?.enc_id)
        }
        if(categories.length > 0){
            return fetchPinData(id, categories);
        }
        return data
    } catch (e) {
        console.log(e,"error");
    }

}


export {
    totalPinCountApi,
    EnableDisable,
    revertPackage,
    discardClick,
    publishClick,
    uploadTraversibleData,
    PlanExpiryDetails,
    deletePinApi,
    removePinApi,
    deleteSubPinApi
}