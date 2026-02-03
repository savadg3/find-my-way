import { MdSync } from "react-icons/md"
import { LocationSvg } from "../../CustomSvg"
import { BsCloudCheck } from "react-icons/bs"
import { Button } from "reactstrap"
import { useEffect } from "react"
import lock from '../../../../assets/img/lock.png'
import unlock from '../../../../assets/img/padlock-unlock.png'

const ProjectHeaderDiv = ({
    projectSettings,
    savingTimer,
    isDiscard,
    isPublish,
    projectSettingData,
    isDirty,
    discardClick,
    publishClick,
    toggle,
    onExitClick,
    handleDiscard,
    publishYesClick
}) => {

    // useEffect(() => {
    //     console.log(isPublish,"ispublish");
    // },[isPublish])

    return (
        <div className="view-project-header">
            <div className="row">
                <div className="col-sm-5 center-content">
                    <div className="header-lock-content">
                        <div
                            className=""
                            style={{
                                cursor: "pointer",
                                marginLeft: "10px",
                                color: "#1D1D1B",
                                fontSize: "1.125rem"
                            }}
                            onClick={() => toggle()}
                        >
                            <p>{projectSettings?.project_name}</p>
                        </div>
                        {projectSettings?.project_name && <img src={projectSettings?.is_pass_protected ? lock : unlock}  onClick={() => toggle('passprotect')}/>}
                    </div>
                </div>
                <div className="col-sm-2 magical-words">
                    <LocationSvg color="#26A3DB" />
                </div>
                <div className="col-sm-5">
                    <div className="button-position-end">
                        <div className="saved mr-4">
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
                        </div>
                        <Button
                            className={`btn-secondary btn-scndry mr-2 ${isDiscard !== 0 ? 'btn-disabled-discard' : ''}`}
                            htmlType="submit"
                            type="primary"
                            size="small"
                            onClick={() => discardClick(handleDiscard)}
                            disabled={isDiscard === 0 ? false : true}
                        >
                            Discard Changes
                        </Button>
                        <Button
                            className={`btn-primary bar-btn ${(isPublish != 1 || projectSettingData?.status == 0) ? 'btn-disabled-publish' : ''}`}
                            htmlType="submit"
                            type="primary"
                            size="medium"
                            onClick={() => publishClick(publishYesClick, projectSettings)}
                            disabled={(() => {
                                if (projectSettingData?.status === 0) {
                                    return true;
                                } else if (isPublish === 1  || isDirty) {
                                    return false;
                                } else {
                                    return isPublish !== 1;
                                }
                            })()}

                            // disabled={((isPublish != 1) || (projectSettingData?.status == 0)) || (!isDirty)}
                        >
                            Publish
                        </Button>
                        <span className="vertical-line-pindiv mr-2" />

                        <Button
                            className="btn-secondary btn-scndry  btn-xs exit-button"
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
    )
}

export default ProjectHeaderDiv;