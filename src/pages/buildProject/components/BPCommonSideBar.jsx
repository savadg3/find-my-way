/* eslint-disable no-script-url */
import React from 'react'
import { IoMdSettings } from "react-icons/io";
import { BsQuestionCircleFill } from "react-icons/bs";
import { LocationSvg, ProductSvg, AmminitySvg, SafetySvg, BeaconSvg, VerticalTransportSvg, TraversableSvg, LayersSvg } from "../CustomSvg";
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { encode } from '../../../helpers/utils';

const BPCommonSideBar = ({
    activeTab,
    onIconClick,
    floorPlans,
    selLocationDtls,
    selProductDtls,
    selFloorPlanDtls,
    selBeaconDtls,
    selAmenityDtls,
    selSafetyDtls,
    selVerticalDtls,
    setTypeId,
    projectSettings
}) => {
    const navigate = useNavigate()

    const IconBtn = ({ icon, type, type_id, tooltip, name }) => {

        const onIconClicks = (type) => {
            if (type_id == 10) {
                // console.log(projectSettings,"projectSettings");
                navigate(`/canvas-editor/${encode(projectSettings?.enc_id)}`)
                return
            }
            setTypeId(type_id);
         
            if (activeTab == 'products' && activeTab == 'locations') {
                if (floorPlans.length > 0) {
                    onIconClick(type)
                }
            } else {
                if ((selLocationDtls?.location_name && !selLocationDtls?.enc_id) ||
                    (selProductDtls?.product_name && !selProductDtls?.enc_id) ||
                    (selFloorPlanDtls?.floor_plan && !selFloorPlanDtls?.enc_id) ||
                    (selBeaconDtls?.beacon_name && !selBeaconDtls?.enc_id) ||
                    (selAmenityDtls?.amenity_name && !selAmenityDtls?.enc_id) ||
                    (selSafetyDtls?.safety_name && !selSafetyDtls?.enc_id) ||
                    (selVerticalDtls?.safety_name && !selVerticalDtls?.enc_id)
                ) {
                    StatusClick()
                } else {
                    onIconClick(type)
                }
            }
        }

        const StatusClick = () => {

            swal({
                title: "Are you sure?",
                text: "Do you want to navigate?",
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
            })
                .then((value) => {
                    switch (value) {
                        case "Yes":
                            onIconClick(type)
                            break;
                        default:
                            break;
                    }
                });
        }

        return (
            <a
                href={"javascript:void(0)"}
                className={`nav-link  active `}
                style={{ width: '100%' }}
                id={`tooltip_${type}`}
                onClick={() => onIconClicks(type)}
            >
                <div class="settings">
                    {tooltip}

                </div>
            </a >
        )
    }
    const IconBtnQstn = ({ icon, type, link }) => {
        return (<a
            href={link} target={'_blank'}
            className={`nav-link  `}
        >
            <div class="settings">
                Help
            </div>
        </a>)
    }

    return (
        <div className="customizer-links" style={{ position: 'relative' }} id="inner-customizer">
            <div style={{ marginTop: '20px', padding: '10px', height: '100%' }}>
                <div
                    className="nav flex-column nac-pills"
                    id="c-pills-tab"
                    role="tablist"
                    aria-orientation="vertical" 
                >
                    <IconBtn icon={<IoMdSettings fontSize={20} />} type='settings' type_id='1' tooltip='Project Settings' name='Project Settings' />
                    <IconBtn icon={<LayersSvg fontSize={18} color={activeTab === "floorDetails" ? "#26a3db" : "#6A6D73"} />} type='floorDetails' type_id='2' tooltip='Floor Plans' name='Floor Plans' />
                    <IconBtn icon={<LocationSvg color={activeTab === "locations" ? "#26a3db" : "#6A6D73"} />} type='locations' type_id='3' tooltip='Location Pins' name='Location Pins' />
                    <IconBtn icon={<ProductSvg color={activeTab === "products" ? "#26a3db" : "#6A6D73"} />} type='products' type_id='4' tooltip='Product Pins' name='Product Pins' />
                    <IconBtn icon={<BeaconSvg color={activeTab === "beacons" ? "#26a3db" : "#6A6D73"} />} type='beacons' type_id='5' tooltip='QR Code Beacons' name='QR Code Beacons' />
                    <IconBtn icon={<AmminitySvg color={activeTab === "amenitys" ? "#26a3db" : "#6A6D73"} />} type='amenitys' type_id='6' tooltip='Amenity Pins' name='Amenity Pins' />
                    <IconBtn icon={<SafetySvg color={activeTab === "safety" ? "#26a3db" : "#6A6D73"} />} type='safety' type_id='7' tooltip='Safety Pins' name='Safety Pins' />
                    <IconBtn icon={<VerticalTransportSvg color={activeTab === "verticalTransport" ? "#26a3db" : "#6A6D73"} />} type='verticalTransport' type_id='8' tooltip='Vertical Transports' name='Vertical Transports' />
                    <IconBtn icon={<TraversableSvg />} type='traversable' type_id='2' tooltip='Navigation Path' name='Navigation Path' />
                    {/* {projectSettings?.is_basic == 1 && */}
                        <IconBtn icon={<TraversableSvg />} type='advertisements' type_id='9' tooltip='Advertising Banners' name='Advertising Banners' />
                    {/* } */}
                        {/* <IconBtn icon={<TraversableSvg />} type='pdf' type_id='10' tooltip='PDF Editor' name='PDF Editor' /> */}
                </div>
                <div style={{ bottom: 30, width: '225px', position: 'fixed' }}>
                    <IconBtnQstn icon={<BsQuestionCircleFill color="#6A6D73" />} link="https://fmw.app/tutorials/" />
                </div>
            </div>
        </div>
    )
}

export default BPCommonSideBar