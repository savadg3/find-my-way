import { FaInfo } from "react-icons/fa";

const UndraggedDiv = ({pinName}) => {
    return (
        <div className="hover-div mr-2">
            <div className='info-icon magical-words'>
                <FaInfo fontSize={15} />
            </div>
            <div className="hover-content ">
                <div className="">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <div className="info-cont">
                            <FaInfo />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="label color-labels" style={{fontSize:'12px'}}>
                            {/* Click on the map to place your {pinName} pin. Once you have placed the pin, you will be able to edit the pin details. */}
                            Please drag the {pinName} pin to place it on your map. Once the pin is placed, you can edit its details.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default UndraggedDiv;