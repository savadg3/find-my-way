import { MdSync } from "react-icons/md";
import { LocationSvg } from "../../CustomSvg";
import { BsCloudCheck } from "react-icons/bs";
import { Button } from "reactstrap";
import lock from '../../../../assets/img/lock.png';
import unlock from '../../../../assets/img/padlock-unlock.png';
import { useProjectHeader } from "./ProjectHeaderContext";
import { useParams } from "react-router-dom";
import { decode } from "../../../../helpers/utils";
import { setProjectData } from "../../../../store/slices/projectItemSlice";
import { useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";
import { getRequest } from "../../../../hooks/axiosClient";
import { environmentaldatas } from "../../../../constant/defaultValues";
import { useSelector } from "react-redux";

const SAVE_STATUS_CONFIG = {
  saving: { label: 'Saving…',      color: '#6b7280' },
  saved:  { label: '✓ Saved',      color: '#16a34a' },
  failed: { label: '✗ Save failed', color: '#dc2626' },
};

const ProjectHeaderDiv = () => {
    const {
        projectSettings,
        projectSettingData,
        savingTimer,
        isPublish,
        isDiscard,
        isDirty,
        toggle,
        onDiscardClick,
        onPublishClick,
        onExitClick,
    } = useProjectHeader();

    const saveStatus  = useSelector((s) => s.navigation.saveStatus);
    
    // const { id }      = useParams();
    // const { image_url } = environmentaldatas;
    // const decodedId   = decode(id);
    // const dispatch    = useDispatch();
    
    // const getProjectById = useCallback(async (projectId) => {
    //     try {
    //         const response = await getRequest(`project/${projectId}`);
    //         const data = response.data ?? {};
            
    //         const newValue = data?.is_pass_protected
    //         ? {
    //             password: 111111,
    //             confirm_password: 111111,
    //         }
    //         : {};
            
    //         const value = {
    //             ...data,
    //             ...newValue,
    //             width: data?.width ? Number(data.width) : null,
    //             height: data?.height ? Number(data.height) : null,
    //             location: [75.78044926997217, 11.258814157509704],
    //             logo:data?.logo ? image_url + data?.logo : ""
    //         };
            
    //         dispatch(setProjectData(value));
            
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }, [dispatch]);
    
    // useEffect(() => {
    //     if (decodedId) {
    //         getProjectById(decodedId);
    //     }
    // }, [decodedId, getProjectById]);
    
    
    return (
        <div className="view-project-header">
            <div className="row">
                <div className="col-sm-5 center-content">
                    <div className="header-lock-content">
                        <div
                            style={{
                                cursor: "pointer",
                                marginLeft: "10px",
                                color: "#1D1D1B",
                                fontSize: "1.125rem",
                            }}
                            onClick={() => toggle()}
                        >
                            <p>{projectSettings?.project_name}</p>
                        </div>

                        {projectSettings?.project_name && (
                            <img
                                src={projectSettings?.is_pass_protected ? lock : unlock}
                                onClick={() => toggle("passprotect")}
                            />
                        )}
                    </div>
                </div>
        
                <div className="col-sm-2 magical-words">
                    <LocationSvg color="#26A3DB" />
                </div>
        
                <div className="col-sm-5">
                    <div className="button-position-end">
                        {/* <div className="saved mr-4">
                            {savingTimer ? (
                                <>
                                    <p>Saving</p>
                                    <MdSync className="ml-2" />
                                </>
                            ) : (
                                <>
                                    <p>Saved</p>
                                    <BsCloudCheck className="ml-2" fontSize={17} />
                                </>
                            )}
                        </div> */}
                        {saveStatus !== 'idle' && (
                            <div className="mr-4" style={{
                                fontSize:     "0.875rem",
                                padding:      '3px 8px',
                                color:        SAVE_STATUS_CONFIG[saveStatus]?.color,
                                display:      'flex',
                                alignItems:   'center',
                                gap:          4,
                            }}>
                                {saveStatus === 'saving' && (
                                <span className="spinner-border spinner-border-sm" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                                )}
                                {SAVE_STATUS_CONFIG[saveStatus]?.label}
                            </div>
                        )}
        
                        <Button
                            className={`btn-secondary btn-scndry mr-2 ${isDiscard !== 0 ? "btn-disabled-discard" : ""}`}
                            htmlType="submit"
                            type="primary"
                            size="small"
                            onClick={onDiscardClick}
                            disabled={isDiscard !== 0}
                        >
                            Discard Changes
                        </Button>
        
                        <Button
                            className={`btn-primary bar-btn ${(isPublish != 1 || projectSettingData?.status == 0) ? "btn-disabled-publish" : ""}`}
                            htmlType="submit"
                            type="primary"
                            size="medium"
                            onClick={onPublishClick}
                            disabled={(() => {
                                if (projectSettingData?.status === 0) return true;
                                if (isPublish === 1 || isDirty) return false;
                                return isPublish !== 1;
                            })()}
                        >
                            Publish
                        </Button>
        
                        <span className="vertical-line-pindiv mr-2" />
        
                        <Button
                            className="btn-secondary btn-scndry btn-xs exit-button"
                            htmlType="submit"
                            type="primary"
                            size="small"
                            style={{ fontWeight: 400, marginRight: "17px" }}
                            onClick={onExitClick}
                        >
                            Save Draft & Exit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectHeaderDiv;
