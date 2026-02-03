import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, Button, Row, Col, Label, Spinner } from 'reactstrap';
import { Stepper, Step } from 'react-form-stepper';
import UploadExcel from '../BulkUploadSteps/uploadExcel';
import UploadedData from '../BulkUploadSteps/uploadedData';
import { FaCheck } from 'react-icons/fa';
import Finalize from '../BulkUploadSteps/Finalize';
import { getRequest, postRequest } from '../../../../hooks/axiosClient';
import { getCurrentUser } from '../../../../helpers/utils';
import { toast } from 'react-toastify';
import { hasDuplicates } from '../calculateDistance';

const BulkUploadPin = ({
    modal,
    setModal,
    type,
    projectSettings,
    selFloorPlanDtls,
    getList,
    handleEnableDisable
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [excelData, setExcelData] = useState([]);
    const [columnMapping, setColumnMapping] = useState({});
    const [finalData, setFinalData] = useState([]);
    const [dropDownValues, setDropDownValues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);


    useEffect(() => {
        if (modal) {
            getDropdownValuesByType(type)
        }
    }, [modal])


    const getDropdownValuesByType = async (type) => {
        try {
            const url = `bulk-dropdown/${type === 'product' ? (modal == 1 ? 3 : 1 ): 2}`
            const response = await getRequest(url);
            const data = response.data?.columns ?? [];
            if (data?.length > 0) {
                let values = data?.map((item) => ({ ...item, label: item?.value, value: item?.column }))
                setDropDownValues(values)
            }
        } catch (error) {
            console.log(error);
        }
    };


    const handleCancel = () => {
        setModal(false)
        setFinalData([])
        setActiveStep(0)
        setExcelData([])
        setColumnMapping({})
        setFile(null)
        setUploadProgress(0)
    }

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
        // prepareDataForBackend()
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const prepareDataForBackend = () => {
        // return
        // const checkSameData = hasDuplicates(columnMapping)
        // console.log(checkSameData, 'checkSameData')
        // if (checkSameData) {
        //     toast.error('Some fields have same values, please check the uploaded file.')
        //     setLoading
        //     return
        // }
        // excelData


        // console.log({excelData,columnMapping});
        
        // return
        if (modal == 1) {
            const structuredOutput = transformProductData(excelData, columnMapping);
            postMatchedFields(structuredOutput, type)
        } else {
            const preparedData = excelData.slice(1).map(row => {
                const mappedRow = {};
                Object.keys(columnMapping).forEach((columnIndex) => {
                    const columnKey = columnMapping[columnIndex];
                    mappedRow[columnKey] = row[columnIndex];
                });
                return mappedRow;
            });
            postMatchedFields(preparedData, type)
        }

        return


        
        const preparedData = excelData.slice(1).map(row => {
            const mappedRow = {};
            Object.keys(columnMapping).forEach((columnIndex) => {
                const columnKey = columnMapping[columnIndex];
                mappedRow[columnKey] = row[columnIndex];
            });
            return mappedRow;
        });
        // setFinalData(preparedData)

    };

    // bulk group upload structure
    // function transformProductData(data, fieldMap = {}) {
    //     if (!Array.isArray(data) || data.length === 0) return [];

    //     const headers = data[0];

    //     const entries = data.slice(1).map(row => {
    //         const entry = {};
    //         headers.forEach((key, i) => {
    //         entry[key] = row[i] !== null && row[i] !== undefined ? row[i] : "";
    //         });
    //         return entry;
    //     });

    //     const mainItemsMap = {};
    //     entries.forEach(entry => {
    //         if (!entry["Pin Group"]) {
    //             mainItemsMap[entry["Product ID"]] = entry;
    //         }
    //     });


    //     console.log(mainItemsMap,entries,"mainItemsMap");
    //     const result = Object.keys(mainItemsMap).map(productId => {
    //         const mainItem = mainItemsMap[productId];

    //         const subItems = entries
    //         .filter(e => e["Pin Group"] === productId)
    //         .map(sub => {
    //             const item = {
    //             name: sub["Product Pin"],
    //             description: sub["Description"],
    //             product_code: sub["Product Code"],
    //             tags: sub["Tags"],
    //             website: sub["Website"] || ""
    //             };
    //             return item;
    //         });

    //         const fullGroup = {
    //             pin_group: mainItem["Product Pin"],
    //             description: mainItem["Description"],
    //             product_code: mainItem["Product Code"],
    //             tags: mainItem["Tags"],
    //             website: mainItem["Website"] || "",
    //             product_pin: subItems
    //         };

    //         // Apply filtering based on fieldMap
    //         if (Object.keys(fieldMap).length > 0) {
    //         const filteredGroup = {};
    //         Object.values(fieldMap).forEach(field => {
    //             if (field in fullGroup) {
    //             filteredGroup[field] = fullGroup[field];
    //             }
    //         });
    //         return filteredGroup;
    //         }

    //         return fullGroup;
    //     });



    //     console.log(result,"resultresultresultresultresult");
    //     return result;
    // }

    function transformProductData(data, fieldMap) {
        if (!Array.isArray(data) || data.length < 2) return [];

        const headers = data[0];
        const rows = data.slice(1);

        const resultMap = {};

        rows.forEach((row, rowIndex) => {
            if (!Array.isArray(row)) return;

            const entry = {};

            for (const index in fieldMap) {
            const fieldName = fieldMap[index];
            entry[fieldName] = row[parseInt(index)];
            }

            if (!entry.product_pin || !entry.pin_group) {
            console.warn(`Row ${rowIndex + 1} skipped: Missing required field(s) [product_pin or pin_group]`);
            return;
            }

            const groupName = entry.pin_group;

            if (!resultMap[groupName]) {
            resultMap[groupName] = [];
            }

            const productData = {};

            for (const key of Object.values(fieldMap)) {
                if (key === 'pin_group') continue; 
                if (key === 'product_pin') {
                    productData.name = entry[key]; 
                } else {
                    productData[key] = entry[key];
                }
            }

            resultMap[groupName].push(productData);
        });

        return Object.entries(resultMap).map(([group, products]) => ({
            pin_group: group,
            product_pin: products
        }));
    }





    const postMatchedFields = async (matchArray, type) => {

        let value = {
            customer_id: projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
            project_id: projectSettings?.enc_id,
            // fp_id: selFloorPlanDtls?.enc_id,
            data: matchArray,
            // is_published: "0",
            // discard: "1",
            // publish: "1",
        }

       
        try {
            // const url = type === 'product' ? 'bulk-product' : 'bulk-location'
            const url = type === 'product' ? ( modal == 1 ? 'bulk-group' : 'bulk-product') : 'bulk-location'
            const response = await postRequest(url, value);
            console.log(response, 'response')
            if (response?.type === 1) {
                const data = response.response.data?.data ?? [];
                console.log(data, 'postMatchedFields')
                const reorderedProducts = data.map(product => {
                    const { image_path, ...rest } = product;
                    return { ...rest, image_path };
                });
                // console.log(reorderedProducts, 'reorderedProducts')
                getList()
                handleEnableDisable()
                if (type === 'product') {
                    setFinalData(reorderedProducts)
                    handleNext();
                    setLoading(false)
                } else {
                    handleCancel()
                    setLoading(false)
                }
            } else {
                toast.error(response?.errormessage);
                setLoading(false)
            }
        } catch (error) {
            console.log(error);
        }
    };


    const stepperStyleConfig = {
        activeBgColor: '#26a3db',
        activeTextColor: '#fff',
        completedBgColor: 'green',
        completedTextColor: '#fff',
        inactiveBgColor: '#e0e0e0',
        inactiveTextColor: '#757575',
        size: '2em',
        circleFontSize: '1em',
        labelFontSize: '1em',
        borderRadius: '50%',
        fontWeight: 'bold',
        marginTop: '5px',
        completedIcon: <FaCheck color="white" />,
    };

    const steps = ['Upload', 'Match fields', ...(type === 'product' ? ['Finalise'] : [])];


    return (
        <Modal
            isOpen={modal}
            size="xl"
            // style={{ maxWidth: '1000px', zIndex: "999999 !important" }}
            centered
        >
            <ModalBody className=" ">
                <h5 className="f-w-600 mb-4" style={{ fontSize: "18px" }}>
                    {`Bulk ${modal == 1 ? 'Group ' : ""}Pin Upload`}
                </h5>
                <Row className="">
                    <Col md={12}>
                        <Stepper
                            activeStep={activeStep}
                            styleConfig={stepperStyleConfig}
                        >
                            <Step label='Upload'>
                                {activeStep > 0 ? <FaCheck /> : 1}
                            </Step>
                            <Step label='Match Fields' >
                                {activeStep > 1 ? <FaCheck /> : 2}
                            </Step>
                            {type === 'product' &&
                                <Step label='Finalise' />
                            }

                        </Stepper>
                        <div style={{ margin: '20px 0' }}>
                            {activeStep === 0 &&
                                <div>
                                    <UploadExcel
                                        setExcelData={setExcelData}
                                        excelData={excelData}
                                        handleCancel={handleCancel}
                                        handleNext={handleNext}
                                        file={file}
                                        setFile={setFile}
                                        uploadProgress={uploadProgress}
                                        setUploadProgress={setUploadProgress}
                                    />
                                </div>
                            }
                            {activeStep === 1 &&
                                <div>
                                    <UploadedData
                                        excelData={excelData}
                                        prepareDataForBackend={prepareDataForBackend}
                                        columnMapping={columnMapping}
                                        setColumnMapping={setColumnMapping}
                                        handleCancel={handleCancel}
                                        handleNext={handleNext}
                                        handleBack={handleBack}
                                        type={type}
                                        options={dropDownValues}
                                        loading={loading}
                                        setLoading={setLoading}
                                        modal={modal}
                                    />
                                </div>
                            }
                            {activeStep === 2 && <div>
                                <Finalize
                                    // data={finalData?.map((item) => ({ ...item, image: null }))}
                                    data={finalData}
                                    setData={setFinalData}
                                    handleCancel={handleCancel}
                                    handleNext={handleNext}
                                    handleBack={handleBack}
                                    postMatchedFields={postMatchedFields}
                                    getList={getList}
                                />
                            </div>}
                        </div>
                    </Col>
                </Row>
                {/* <div
                    className="form-group text-right "
                    style={{ marginTop: "30px" }}
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
                    {activeStep === 1 &&
                        <Button className="btn btn-primary-outline mr-3"  onClick={handleBack}>Back</Button>

                    }
                    
                    <Button color="primary" type="submit" className="btn btn-primary float-right"
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </div> */}
            </ModalBody>
        </Modal>
    )
}
export default BulkUploadPin;