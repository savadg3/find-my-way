import { useRef, useState } from "react";
import { Col, Row, Button } from "reactstrap";
import { FaFileExcel } from "react-icons/fa"; // Excel icon from react-icons
import { IoMdClose } from "react-icons/io";
import * as XLSX from 'xlsx';
import uploadImage from '../../../../assets/img/file-upload.png';
import excelIcon from '../../../../assets/img/excel-icon.png';
import { toast } from "react-toastify";



const UploadExcel = ({
    setExcelData,
    excelData,
    handleCancel,
    handleNext,
    file, setFile,
    uploadProgress, setUploadProgress
}) => {
    const fileInputRef = useRef(null);
    // const [file, setFile] = useState(null);
    // const [uploadProgress, setUploadProgress] = useState(0);


    const selectExcel = (event) => {
        const file = event.target.files[0];
        console.log(file, 'file')
        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx files
            "application/vnd.ms-excel"
        ];

        if (file && !allowedTypes.includes(file.type)) {
            toast.warning('Sorry! Only .xlsx, .xls files are allowed for upload.');
            return;
        } else if (file) {
            progress()
            setFile(file)
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Assuming data is in the first sheet
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const filterArray = jsonData.filter(row => row.length > 0);
                console.log(filterArray, 'jsonData')
                setExcelData(filterArray);
            };
            reader.readAsArrayBuffer(file);
        }

    };

    const handleDragOver = (e) => {
        e.preventDefault(); 
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files; 
        if (files && files.length > 0) {
            selectExcel({ target: { files } }); 
        }
    };


    const progress = () => {
        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if (prevProgress >= 100) { // Keep it at 90% until processing is done
                    clearInterval(interval);
                    return prevProgress;
                }
                return prevProgress + 25;
            });
        }, 200);
    }

    const deleteFile = () => {
        setExcelData([]);
        setFile(null)
        fileInputRef.current.value = "";
        setUploadProgress(0)
    };

    return (
        <>
            <Row className="">
                <Col md={{ size: 10, offset: 1 }}>
                    <div
                        className='image-upload excel-upload'
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className='text-center'>
                            <label style={{ cursor: 'pointer' }}>
                                <img className='mt-1' src={uploadImage} width={50} alt="excel-upload" />
                                <p className='drag-drop-label mt-3'>Drag and Drop file here or Choose file</p>
                            </label>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".xlsx, .xls"
                            onChange={selectExcel}
                        />
                    </div>

                    {file && (
                        <div className='drag-wrpr mt-3'>
                            <div className=' excel-item'>
                                <div >
                                    {/* <FaFileExcel size={20} color="green" /> */}
                                    <img className="excel-icon" src={excelIcon} width={70} alt="excel-icon" />
                                </div>
                                <div style={{ width: '100%' }}>
                                    <div className="d-flex justify-content-between">
                                        <p style={{ fontSize: '12px', fontWeight: '500' }}>{file.name}</p>
                                        <p className="mr-1" style={{ fontSize: '12px', fontWeight: '500' }}>
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <progress value={uploadProgress} max={100} className="custom-progress"></progress>
                                        <p className="mr-1 ml-2" style={{ fontSize: '12px', fontWeight: '500' }}>{uploadProgress}%</p>
                                    </div>
                                </div>
                                {/* <div className='flex-grow-1' /> */}
                            </div>

                            <div className='ml-2  rounded-circle' onClick={deleteFile} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                                <IoMdClose fontSize={10} />
                            </div>
                        </div>
                    )}
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
                <Button color="primary" type="submit" className="btn btn-primary float-right"
                    onClick={handleNext}
                    disabled={!file}
                >
                    Next
                </Button>
            </div>
        </>
    );
};

export default UploadExcel;
