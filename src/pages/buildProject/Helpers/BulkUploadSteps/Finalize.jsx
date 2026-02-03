import { useEffect, useRef, useState } from "react";
import { Col, Row, Button, Table } from "reactstrap";
import CustomPagination from "../../../../components/constants/Pagination";
import uploadImage from '../../../../assets/img/file-upload.png';
import { FaFileUpload } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import ImageUploader from "../../../../components/constants/imageCropNew";
import { postRequest } from "../../../../hooks/axiosClient";
import { environmentaldatas } from "../../../../constant/defaultValues";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
const image_url = environmentaldatas?.image_url

const Finalize = ({
    data, handleCancel, handleBack,
    postMatchedFields,
    setData,
    getList

}) => {
    useEffect(() => {
        if (data) {
            const transformed = data.map(item => {
                let parsedTags;
                try {
                    parsedTags = JSON.parse(item.tags);
                    if (!Array.isArray(parsedTags)) parsedTags = [];
                } catch (e) {
                    parsedTags = [];
                }

                const groupDetails = Array.isArray(item.group_details)
                    ? item.group_details.map(g => g?.name)
                    : [];

                return {
                    ...item,
                    tags: parsedTags?.join(","),
                    group_details: groupDetails?.join(","),
                };
            });
            setModalData(transformed)
        }
    },[data])

    // console.log(data,"asdhsahdsa");
    const [modalData, setModalData] = useState([]);
    const [fileKey, setFileKey] = useState(Date.now());
    const [modal, setModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [blobImage, setBlobImage] = useState(null);
    const [selProdId, setSelProdId] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);

    const imgInputRefs = useRef({});
    const headers = modalData?.length > 0 ? Object.keys(modalData[0]) : [];
    // console.log(data,headers,"datadatadata");

    const onSelectImg = async (e, item) => {
        console.log(item, 'onSelectImg');
        const file = e?.target?.files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

        if (file && !allowedTypes.includes(file.type)) {
            toast.warning('Sorry! Only JPEG, PNG, and JPG files are allowed for upload.');
            return;
        }
        setFileKey(Date.now());
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelProdId(item.enc_id);
            setPreviewImage(reader.result);
            setModal(true);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleImageCropSubmit = (blob, url, id) => {
        console.log(id, 'handleImageCropSubmit');
        const item = modalData?.find((item) => item?.enc_id === id)
        postImages(blob, 'post', item, id)
    };

    const postImages = async (imagePath, type, item, id) => {
        const formData = new FormData();
        formData.append('id', id);

        if (type === 'post') {
            if (imagePath) {
                formData.append(`image_path[${0}]`, imagePath);
            }
        } else {
            if (imagePath) {
                formData.append(`deleted_images[${0}]`, imagePath);
            }
        }
        try {
            const reqUrl = `product-image`
            const response = await postRequest(reqUrl, formData, true);
            const res = response.response?.data ?? [];
            if (response.type === 1) {
                console.log(res)
                const image_path = res?.image_path[0]
                const bulkData = modalData?.map((el) =>
                    el.enc_id === id ? { ...el, image_path: image_path ?? null } : el
                )
                console.log(bulkData)
                setData(bulkData)
                // postMatchedFields(data, 'product')
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteImage = (item) => {
        console.log(item, 'item')
        postImages(item?.image_path, 'delete', item, item?.enc_id)
    }

    return (
        <>
            <Row className="">
                <Col md={12}>
                    <div className='table-responsive' style={{ maxHeight: '40vh' }}>
                        {/* <Table className="custom-table">
                            <thead>
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} className="theadStyle">
                                            {header.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {headers.map((header, colIndex) => (
                                            <td key={colIndex}>
                                                {header === 'image_path' ? (
                                                    item[header] === null ? (
                                                        <span className="upload-image" onClick={() => imgInputRefs.current[item.enc_id].click()}>
                                                            <LuUpload />
                                                            <input
                                                                key={fileKey}
                                                                type='file'
                                                                accept=".jpeg, .png, .jpg"
                                                                ref={ref => imgInputRefs.current[item.enc_id] = ref}
                                                                hidden
                                                                onChange={(e) => onSelectImg(e, item)}
                                                            />
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <div className='img-wrpr prduct-bulk' >
                                                                <span className='image-container'>
                                                                    <img src={image_url + item[header]} style={{ borderRadius: '6px', border: '1px solid rgb(204, 204, 204)' }} />
                                                                    <span className='delete-logo-icon' style={{ right: '0px' }}><div onClick={() => handleDeleteImage(item)} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', }} >
                                                                        <IoMdClose style={{ fontSize: '10px' }} />
                                                                    </div></span>
                                                                </span>
                                                            </div>
                                                        </>

                                                    )
                                                ) : (
                                                    item[header]
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table> */}

                        <Table className="custom-table">
                            <thead>
                                <tr>
                                    {headers
                                        .filter(header => header !== 'enc_id') // Filter out 'enc_id' from headers
                                        .map((header, index) => (
                                            <th key={index} className="theadStyle" style={{textTransform:'capitalize'}}>
                                                {header.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modalData?.map((item, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {headers
                                            .filter(header => header !== 'enc_id') 
                                            .map((header, colIndex) => (
                                                // <td key={colIndex}>
                                                //     {header === 'image_path' ? (
                                                //         item[header] === null ? (
                                                //             <span className="upload-image" onClick={() => imgInputRefs.current[item.enc_id].click()}>
                                                //                 <LuUpload />
                                                //                 <input
                                                //                     key={fileKey}
                                                //                     type='file'
                                                //                     accept=".jpeg, .png, .jpg"
                                                //                     ref={ref => imgInputRefs.current[item.enc_id] = ref}
                                                //                     hidden
                                                //                     onChange={(e) => onSelectImg(e, item)}
                                                //                 />
                                                //             </span>
                                                //         ) : (
                                                //             <>
                                                //                 <div className='img-wrpr prduct-bulk'>
                                                //                     <span className='image-container'>
                                                //                         <img src={image_url + item[header]} style={{ borderRadius: '6px', border: '1px solid rgb(204, 204, 204)' }} alt="Product" />
                                                //                         <span className='delete-logo-icon' style={{ right: '0px' }}>
                                                //                             <div onClick={() => handleDeleteImage(item)} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer' }}>
                                                //                                 <IoMdClose style={{ fontSize: '10px' }} />
                                                //                             </div>
                                                //                         </span>
                                                //                     </span>
                                                //                 </div>
                                                //             </>
                                                //         )
                                                //     ) : (
                                                //         item[header]
                                                //     )}
                                                // </td>

                                                <td key={colIndex}>
                                                    {header === 'image_path' ? (
                                                        item[header] === null ? (
                                                            <span className="upload-image" onClick={() => imgInputRefs.current[item.enc_id].click()}>
                                                                <LuUpload />
                                                                <input
                                                                    key={fileKey}
                                                                    type='file'
                                                                    accept=".jpeg, .png, .jpg"
                                                                    ref={ref => imgInputRefs.current[item.enc_id] = ref}
                                                                    hidden
                                                                    onChange={(e) => onSelectImg(e, item)}
                                                                />
                                                            </span>
                                                        ) : (
                                                            <div className='img-wrpr prduct-bulk'>
                                                                <span className='image-container'>
                                                                    <img src={image_url + item[header]} style={{ borderRadius: '6px', border: '1px solid rgb(204, 204, 204)' }} alt="Product" />
                                                                    <span className='delete-logo-icon' style={{ right: '0px' }}>
                                                                        <div onClick={() => handleDeleteImage(item)} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer' }}>
                                                                            <IoMdClose style={{ fontSize: '10px' }} />
                                                                        </div>
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        )
                                                    ) : Array.isArray(item[header]) ? (
                                                        <ul style={{ marginBottom: 0 }}>
                                                            {item[header].map((v, idx) => (
                                                                <li key={idx} style={{ listStyle: "none" }}>{typeof v === "object" ? JSON.stringify(v) : v}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        item[header]
                                                    )}
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <ImageUploader
                        onSubmit={(blob, url) => {
                            setCroppedImage(url);
                            setBlobImage(blob);
                            setModal(false);
                            console.log(selProdId, 'handleImageCropSubmit');
                            handleImageCropSubmit(blob, url, selProdId);
                        }}
                        onCancel={() => {
                            setModal(false);
                            console.log("Cancelled");
                        }}
                        sourceImageUrl={previewImage}
                        setSourceImageUrl={setPreviewImage}
                        openCropModal={modal}
                        setOpenCropModal={setModal}
                        imgAspect={4 / 4}
                        diasbleFreeFlow={true}
                        from={'product'}
                    />

                </Col>
            </Row >
            <div className="form-group text-right modal-btn-grp">
                {/* <Button
                    color="secondary"
                    className="btn btnCancel mr-3"
                    onClick={() => {
                        handleCancel()
                        // getList()
                    }}
                >
                    Skip Image Upload
                </Button> */}
                <Button
                    color="primary"
                    type="submit"
                    className="btn btn-primary float-right"
                    onClick={() => {
                        handleCancel()
                        getList()
                    }}
                >
                    Finish
                </Button>
            </div>
        </>
    );
};

export default Finalize;