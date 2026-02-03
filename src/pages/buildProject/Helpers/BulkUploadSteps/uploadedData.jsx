import { useEffect, useRef, useState } from "react";
import { Col, Row, Button, Table, Spinner } from "reactstrap";
import CommonDropdown from "../../../../components/common/CommonDropdown";
import { toast } from "react-toastify";
import { Tooltip as ReactTooltip } from "react-tooltip";




const UploadedData = ({
    excelData,
    prepareDataForBackend,
    columnMapping,
    setColumnMapping,
    handleCancel,
    handleNext,
    handleBack,
    type,
    options,
    loading, setLoading,
    modal
}) => {

    const handleColumName = (selectedOption, index, columnMapping) => {
        // console.log(columnMapping, index, selectedOption)
        const selectedValue = selectedOption?.value;

        // Check if the selected value is already set for the same index
        if (columnMapping[index] === selectedValue) {
            // Clear the current index value without showing the warning
            setColumnMapping(prevMapping => {
                const newMapping = { ...prevMapping };
                delete newMapping[index];
                return newMapping;
            });
        } else if (Object.values(columnMapping).includes(selectedValue) && selectedValue) {
            // Show the warning if the selected value is already used in another index
            toast.warning(`The option "${selectedOption.label}" has already been selected. Please choose a different option.`);
            setColumnMapping(prevMapping => {
                const newMapping = { ...prevMapping };
                delete newMapping[index];
                return newMapping;
            });
        } else {
            // Set the selected value for the current index
            setColumnMapping(prevMapping => ({
                ...prevMapping,
                [index]: selectedValue
            }));
        }

        // if (Object.values(columnMapping).includes(selectedValue)) {
        //     toast.warning(`The option "${selectedOption.label}" has already been selected. Please choose a different option.`);
        //     setColumnMapping(prevMapping => {
        //         const newMapping = { ...prevMapping };
        //         delete newMapping[index];
        //         return newMapping;
        //     });
        // } else {
        //     setColumnMapping(prevMapping => ({
        //         ...prevMapping,
        //         [index]: selectedValue
        //     }));
        // }
    };

    const handleNextOrFinish = (columnMapping) => {
        const values = Object.values(columnMapping);

        if (type === 'product') {
            const hasPinGroup = values.includes("pin_group");
            const hasProductPin = values.includes("product_pin");
            const hasProductName = values.includes("product_name");

            if (modal === 1) {
                if (!hasPinGroup) {
                    toast.error("'Pin Group' is mandatory for bulk upload.");
                    setLoading(false);
                    return;
                }
                if (!hasProductPin) {
                    toast.error("'Product pin' is mandatory for bulk upload.");
                    setLoading(false);
                    return;
                }
                prepareDataForBackend();
            } else {
                if (!hasProductName) {
                    toast.error("'Product name' is mandatory for bulk upload.");
                    setLoading(false);
                    return;
                }
                prepareDataForBackend();
            }
        } else {
            const hasLocationName = values.includes("location_name");

            if (!hasLocationName) {
                toast.error("'Location name' is mandatory for bulk upload.");
                setLoading(false);
                return;
            }

            prepareDataForBackend();
        }
    };


    
    
    // const handleNextOrFinish = (columnMapping) => {
    //     if (type === 'product') {
    //         if ( 
    //             (modal === 1 &&
    //                 Object.values(columnMapping).includes("pin_group") &&
    //                 Object.values(columnMapping).includes("product_pin")) ||
    //             (modal !== 1 && Object.values(columnMapping).includes("product_name"))
    //         ) {
    //             // handleNext();
    //             prepareDataForBackend()
    //         } else {
    //             toast.error(`${modal == 1 ? "Group name" : "Product name" } is mandatory for bulk upload.`);
    //             setLoading(false)
    //         }
    //     } else {
    //         if (Object.values(columnMapping).includes("location_name")) {
    //             // handleCancel()
    //             prepareDataForBackend();
    //         } else {
    //             toast.error('Location name is mandatory for bulk upload.');
    //             setLoading(false)
    //         }
    //     }
    // }


    return (
        <>
            <Row >
                <Col md={12}>
                    <div className='table-responsive ' style={{ maxHeight: '40vh', minHeight: '30vh' }}>
                        <Table className='custom-table'>
                            <thead>
                                <tr>
                                    <th className='theadStyle'>Field Title</th>
                                    <th className='theadStyle'>Preview Data</th>
                                    <th className='theadStyle'>Find My Way Field</th>

                                </tr>
                            </thead>
                            <tbody>
                                {excelData[0]?.map((header, index) => (
                                    <tr key={index}>
                                        <td>{header}</td>
                                        <td className="preview-data-cell">
                                            {(() => {
                                                const columnData = excelData.slice(1).map(row => row[index]).filter(Boolean);

                                                if (columnData.length === 0) {
                                                    return null;
                                                } else if (columnData.length === 1) {
                                                    return <span>{columnData[0]}</span>;
                                                } else if (columnData.length === 2) {
                                                    return <span>{columnData.join(', ')}</span>;
                                                } else {
                                                    return <span>{columnData.slice(0, 2).join(', ')}, ...</span>;
                                                }
                                            })()}
                                        </td>
                                        {/* <td className="preview-data-cell"
                                            data-tooltip-id={`Tooltip-${index}`}
                                        >
                                            {excelData.slice(1).slice(0, 2).map((row, rowIndex) => (
                                                <span key={rowIndex}>
                                                    {row[index]}
                                                    {excelData.slice(1).length > 1 && rowIndex < 1 && rowIndex < excelData.slice(1).length - 1 && row[index] && <span>, </span>}
                                                </span>
                                            ))}
                                            {excelData.slice(1).length > 2 && <span>...</span>}
                                        </td> */}
                                        <td>
                                            <CommonDropdown
                                                options={options}
                                                value={options.find(option => option.value === columnMapping[index]) || ""}
                                                onChange={(e) => handleColumName(e, index, columnMapping)}
                                                isClearable={true}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
            <div
                className="form-group text-right modal-btn-grp"
            >
                <Button
                    color="secondary"
                    className="btn btnCancel mr-3"
                    onClick={() => {
                        handleCancel()
                    }}
                >
                    {'Cancel'}
                </Button>
                <Button className="btn btn-primary-outline mr-3"
                    onClick={() => {
                        handleBack()
                        setColumnMapping({})
                        setLoading(false)
                    }}
                // hidden={type === 'location'}
                >
                    Back
                </Button>
                <Button color="primary" type="submit" className="btn btn-primary float-right"
                    onClick={() => {
                        setLoading(true)
                        handleNextOrFinish(columnMapping)
                    }}
                    disabled={Object.keys(columnMapping).length === 0 || loading}
                >
                    {loading ? (
                        <>
                            <p style={{ opacity: '0', position: 'relative' }}>Upload</p>
                            <Spinner
                                className="ml-2 spinner-style"
                                color="light"
                            />
                        </>
                    ) : 'Upload'}

                    {/* {type === 'product' ? 'Next' : 'Finish'} */}
                </Button>
            </div>
        </>
    );
};

export default UploadedData;