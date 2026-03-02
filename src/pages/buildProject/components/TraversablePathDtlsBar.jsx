import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { Button, Label, Row, Col } from "reactstrap";
import { BsArrowLeftShort } from "react-icons/bs";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomDropdown2, { CustomDropdown3 } from "../../../components/common/CustomDropDown2";
import { FaInfo } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { handleNextPreviousClick } from "../Helpers/pathCalculations/checkPathCalculation";
import axios from "axios";
import { dijkstra } from "../Helpers/algorithm/dijkstra";

const ValidationSchema = Yup.object().shape({
  from: Yup.string().required("This field is required."),
  to: Yup.string().required("This field is required.")

});

const TraversableSideBar = ({
  id,
  floorID,
  setAddNew,
  addNew,
  selFloorPlanDtls,
  options,
  setSelTraversibleDetails,
  selTraversibleDetails,
  toggleVertical,
  switchFloor,
  graph,
  verticalTransports,
  setCommonSidebarVisible,
  showPath,
  allVerticalTransports,
  handleEndDirectionclick,
  canvas,
  setSelectedPaths,
  generateAutoConnections,
  setIsWheechairChecked,
  setActiveTab,
}) => {


  const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 70);

  const addBeaconClick = () => {
    if (floorID) {
      setAddNew(true);
    } else {
      toast.warning("Please select a floor plan to add traversable");
    }
  };

  const goBack = () => {
    setAddNew(false)
    setCommonSidebarVisible(true)
    setActiveTab("settings")
    // localStorage.removeItem("shortestPath")

  };

  const handleResize = () => {
    const { clientHeight } = window.document.getElementById("pageDiv");
    setMapDivSize(window.innerHeight - 70);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);

  const findPath = async () => {
    canvas.current.discardActiveObject();
    localStorage.removeItem("shortestPath")

    setIsWheechairChecked(false)
    setSelectedPaths(false);
    localStorage.removeItem("pathLength")
    localStorage.removeItem("currentLength")
    if (selTraversibleDetails?.from && selTraversibleDetails?.to) {

      if (selTraversibleDetails?.from == selTraversibleDetails?.to) {
        toast.warning('Please choose a different source or destination to find the way.');

      } else {
        if (selTraversibleDetails?.from_floor_id == selTraversibleDetails?.to_floor_id && selTraversibleDetails?.from_floor_id == selFloorPlanDtls?.enc_id) {
          showPath(selTraversibleDetails?.from, selTraversibleDetails?.to)
          let shortestPath = dijkstra(graph, selTraversibleDetails?.from, selTraversibleDetails?.to);
          // console.log(shortestPath);
          // localStorage.setItem("shortestPath",shortestPath)
          if (!shortestPath) {
            if (verticalTransports?.length > 0) {
              toggleVertical()
            } else {
              toast.warning('Please add a vertical transport option to help you find your way to your destination.');
            }
          }
          // console.log(showPath(selTraversibleDetails?.from, selTraversibleDetails?.to),"showPath(selTraversibleDetails?.from, selTraversibleDetails?.to)")
        } else if (selTraversibleDetails?.from_floor_id == selFloorPlanDtls?.enc_id) {
          if (verticalTransports?.length > 0) {
            toggleVertical()
          } else {
            toast.warning('Please add a vertical transport option to help you find your way to your destination.');
          }
        } else if (selTraversibleDetails?.from_floor_id != selFloorPlanDtls?.enc_id && selTraversibleDetails?.from_floor_id == selTraversibleDetails?.to_floor_id) {
          const returnValue = await switchFloor(selTraversibleDetails?.from_floor_id)
          setTimeout(() => { 
            showPath(selTraversibleDetails?.from, selTraversibleDetails?.to)
          }, 1000);
        }
        else {
          // console.log('here')
          const returnValue = await switchFloor(selTraversibleDetails?.from_floor_id)
          if (returnValue) {
            setTimeout(() => {
              toggleVertical()
            }, 500);
          }
        }
      }
    }
  }

  const getIp= async () => {
    const res = await axios.get('https://api.ipify.org?format=json')
    // localStorage.removeItem("shortestPath")

  }

  return (
    <div
      className="bar"
      id="inner-customizer2"
      style={{
        position: "relative",
        height: mapDivSize,
        paddingBottom: "20px"
      }}
    >

      <Row className="backRow">

        <Col md={8}>
          <h1>Navigation Path </h1>
        </Col>

        <Col md={4}>
          <div className="backArrow float-right">
            <BsArrowLeftShort onClick={goBack} />
          </div>
        </Col>

      </Row>

      <Formik
        initialValues={{
          from: "",
          to: "",
          ...selTraversibleDetails
        }}
        validationSchema={ValidationSchema}
        onSubmit={(values, setFieldError) => {
          // console.log(values, "values");
        }}
        enableReinitialize
      >
        {({
          errors,
          values,
          touched,
          handleSubmit,
          handleChange,
          setFieldValue,
          setFieldError
        }) => (
          <form
            className="av-tooltip tooltip-label-bottom formGroups"
            onSubmit={(e) => handleSubmit(e, setFieldError)}
          >
            <div
              className="custom-scrollbar customScroll"
              style={{ height: mapDivSize }}
            >
              {addNew ? (
                <div className="bar-sub">
                  <div>
                    <div className="bar-sub-header" style={{ marginTop: 0 }}>
                      <p style={{ marginTop: 0 }}>Navigation Path Test</p>
                    </div>
                    <div className="pl-4 pr-4">
                      <div className="marginBottom">
                        <Label className="form-labels">From</Label> 
                        <CustomDropdown2
                          name="from"
                          id="from"
                          // options={options}
                          options={options.map((item) => ({
                            pin_id:item?.pin_id,
                            id: item?.pin_id ?? item?.id,
                            label: item?.label,
                          }))}
                          setFieldValue={setFieldValue}
                          values={selTraversibleDetails}
                          setCustomerValues={{}}
                          selectValue={{}}
                          onChange={(e) => {
                            let findItem;
                            if (e?.pin_id) {
                              findItem = options.find((item) => item?.pin_id == e?.pin_id)
                            } else {
                              findItem = options.find((item) => item?.id == e?.id)
                            }
                            setSelTraversibleDetails((prev) => ({
                              ...(prev && prev),
                              from: `${findItem?.name}_${findItem?.enc_id}`,
                              from_floor_id: findItem?.floorplan_id,
                              is_miltiple: false,
                              isNext: 0
                            }))
                          }}
                        />
                        {errors.from && touched.from ? (
                          <div className="text-danger mt-1">
                            {errors.from}
                          </div>
                        ) : null}
                      </div>

                      <div className="marginBottom">
                        <Label className="form-labels">To</Label>
                        <CustomDropdown2
                          name="to"
                          id="to"
                          options={options.map((item) => ({
                            pin_id:item?.pin_id,
                            id: item?.pin_id ?? item?.id,
                            label: item?.label,
                          }))}
                          setFieldValue={setFieldValue}
                          values={selTraversibleDetails}
                          setCustomerValues={{}}
                          selectValue={{}}
                          onChange={(e) => {
                            let findItem;
                            if (e?.pin_id) {
                              findItem = options.find((item) => item?.pin_id == e?.pin_id)
                            } else {
                              findItem = options.find((item) => item?.id == e?.id)
                            }
                            // console.log(findItem,e);
                            setSelTraversibleDetails((prev) => ({
                              ...(prev && prev),
                              to: `${findItem?.name}_${findItem?.enc_id}`,
                              to_floor_id: findItem?.floorplan_id,
                              is_miltiple: false,
                              isNext: 0
                            }))
                          }}
                        />
                        {errors.to && touched.to ? (
                          <div className="text-danger mt-1">
                            {errors.to}
                          </div>
                        ) : null}
                      </div>
                      {!selTraversibleDetails?.is_miltiple ? (
                        <Button
                          className="btn-primary bar-btn float-right mt-1 mb-3"
                          type="primary"
                          size="medium"
                          id="beaconSubmitBtn"
                          onClick={findPath}
                        >
                          Find
                        </Button>
                      ) : (
                        <div className="d-flex float-right">
                          {/* {selTraversibleDetails?.from_floor_id != selFloorPlanDtls?.enc_id && */}
                          {localStorage.getItem("currentLength") > 1 &&
                            <Button
                              className="btn-primary bar-btn  mt-1 mb-3 mr-3"
                              type="primary"
                              size="medium"
                                onClick={() => {
                                  canvas.current.clear()
                                  let count = parseInt(localStorage.getItem("currentLength"))
                                  if (count !== 1) localStorage.setItem("currentLength", count - 1)
                                handleNextPreviousClick(selTraversibleDetails?.isNext, 'previous', selTraversibleDetails, switchFloor, showPath, setSelTraversibleDetails)
                              }}
                              // disabled={selTraversibleDetails?.from_floor_id == selFloorPlanDtls?.enc_id}
                            >
                              Previous
                            </Button>
                          }
                          {/* {(selTraversibleDetails?.to_floor_id != selFloorPlanDtls?.enc_id) ? ( */}
                          {(localStorage.getItem("currentLength") !== localStorage.getItem("pathLength")) ? (
                            <Button
                              className="btn-primary bar-btn  mt-1 mb-3"
                              type="primary"
                              size="medium"
                                onClick={async () => {
                                  canvas.current.clear()
                                  let count = parseInt(localStorage.getItem("currentLength"))
                                  if (count !== localStorage.getItem("pathLength")) localStorage.setItem("currentLength", count + 1)
                                handleNextPreviousClick((selTraversibleDetails?.isNext ?? 0), 'next', selTraversibleDetails, switchFloor, showPath, setSelTraversibleDetails)

                              }}
                            >
                              Next
                            </Button>
                          ) : (
                            <Button
                              className="btn-danger btn-danger-btn bar-btn  mt-1 mb-3"
                              type="primary"
                              size="medium"
                              onClick={() => {
                                localStorage.removeItem("pathLength")
                                localStorage.removeItem("currentLength")
                                localStorage.removeItem("shortestPath")
                                handleEndDirectionclick()
                              }}
                            >
                              End direction
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: "4rem" }}>
                      <div className="warning-pin-div">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <div className="info-cont">
                            <FaInfo />
                          </div>
                        </div>
                        <div className=" text-center  ">
                          <p className="label color-labels">
                            Draw a path that connects along all walkable routes;
                            Connect all the pins to the path to enable
                            navigation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="btn-wrpr">
                      <Button
                        className="btnCancel "
                        type="button"
                        size="medium"
                        hidden
                        onClick={() => {
                          getIp()
                          // setAddNew(false);
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        className="btn-primary bar-btn"
                        htmlType="submit"
                        type="primary"
                        size="medium"
                        id="beaconSubmitBtn"
                        hidden
                      >
                        Submit
                      </Button>
                      {/* <Button
                        className="btn-primary bar-btn float-right"
                        // type="primary"
                        // size="medium"
                        hidden
                        onClick={generateAutoConnections}
                      >
                        Generate
                      </Button> */}

                    </div>
                  </div>

                </div>
              ) : (
                <>
                  <div className="bar-sub-header" style={{ marginTop: 0 }}>
                    <p style={{ marginTop: 0 }}>Add New Navigation path</p>
                    <div className='plus-icon' onClick={() => addBeaconClick()}>
                      <GoPlus />
                    </div>
                  </div>
                </>
              )}
              {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default TraversableSideBar;
