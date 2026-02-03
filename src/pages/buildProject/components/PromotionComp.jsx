import React, { useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IoMdClose } from 'react-icons/io'
import ImageUploader from '../../../components/constants/imageCropNew';


const PromotionComp = ({
    promo, promotions, setPromotions,
    index,
    setFieldValue, values, setPromotionError,
    postPromotion,
}) => {
    let tempPromos = [...promotions]

    const ref = useRef();
    const [check, setCheck] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [blobImage, setBlobImage] = useState(null);

    const [postCall, setPostCall] = useState(false);
    const [modal, setModal] = useState(false);
    const [error, setError] = useState()
    const toggle2 = () => setModal(!modal);
    const [isEndDate, setIsEndDate] = useState(false);
    const [fileKey, setFileKey] = useState(Date.now());

    const onSelectImg = async (e) => {
        const file = e?.target?.files[0];
        // setFieldValue(e)
        setFileKey(Date.now());
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            //   onReset()
            setModal(true);

        };
        if (file) {
            reader.readAsDataURL(file);
        }
    }

    const onValueChange = (value, type) => {
        if (type == 'end_date') {
            tempPromos[index].endDtError = ''
        } else {
            tempPromos[index].startDtError = ''
        }
        tempPromos[index][type] = value ?? '';
        setPromotions([...tempPromos]);
        setFieldValue(`promo_${type[index]}`, tempPromos[index][type])
        setTimeout(() => {
            postPromotion()
        }, 1000);
    }

    useEffect(() => {
        if (index && !tempPromos[index].image_path && !tempPromos[index]['start_date']) {
            tempPromos[index] = {}
            setPromotions([...tempPromos])
        } if (index && !tempPromos[index].image_path && tempPromos[index]['start_date']) {
            tempPromos[index].image_path = '';

            setPromotions([...tempPromos])
        } if (index && tempPromos[index].image_path && !tempPromos[index]['start_date']) {
            tempPromos[index]['start_date'] = '';
            setPromotions([...tempPromos])
        }
    }, [index]);

    const validateTwoDates = () => {
        let startDate
        let endDate
        if (tempPromos[index]['start_date']) {
            startDate = new Date(tempPromos[index]['start_date'])
            startDate.setHours(0, 0, 0, 0)
            // postPromotion()
        }
        if (tempPromos[index]['end_date']) {
            endDate = new Date(tempPromos[index]['end_date'])
            endDate.setHours(0, 0, 0, 0)
            // postPromotion()
        }
        if (startDate && endDate && startDate > endDate) {
            setError("The end date shouldn't be less than the start date.");
            setPromotionError(true)
        } else if (endDate && !startDate) {
            tempPromos[index]['start_date'] = new Date()
            setPromotions([...tempPromos])
            setError("The end date shouldn't be less than the start date.");
            setPromotionError(true)
        }
        else {
            setError();
            setPromotionError(false)
        }
    }

    useEffect(() => {
        if ((index >= 0) && !check && !tempPromos[index]['end_date']) {
            tempPromos[index]['end_date'] = ''
            setPromotions([...tempPromos])
        } if (tempPromos[index]['end_date']) {
            setCheck(true);
            setIsEndDate(true);
        }
    }, [!check, index >= 0]);

    useEffect(() => {
        validateTwoDates()
    }, [check, promotions, tempPromos])

    useEffect(() => {
        if (croppedImage) {
            tempPromos[index].image_path = blobImage
            tempPromos[index].imgError = '';
            setPromotions([...tempPromos]);
            setTimeout(() => {
                let error = false
                setPromotionError((prev) => {
                    error = prev;
                    return prev;
                });
                console.log(error, 'error')
                if (!error) {
                    postPromotion()
                }
                setCroppedImage()
            }, 500);

        }
    }, [croppedImage])

    const onDelete = (selIndex) => {
        swal({
            title: "Are you sure you want to delete?",
            text: "This action is permanent and cannot be undone.",
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
                        const promos = tempPromos.splice(selIndex, 1);
                        setPromotions([...tempPromos]);
                        postPromotion(tempPromos)
                        break;
                    default:
                        break;
                }
            });
        return
    }

    return (
        <>
            <div className='pl-4 pr-4 mb-2 d-flex align-items-center'>
                <div className='promo-container' >
                    {promo.image_path ? <img src={croppedImage ?? promo.image_path} className='promo-img' style={{ cursor: 'pointer' }} onClick={() => ref.current.click()} /> :
                        <div className='select-logo loc' onClick={() => ref.current.click()} >
                            <p>+</p>
                        </div>
                    }
                    <input type='file' key={fileKey} ref={ref} hidden onChange={onSelectImg} accept='.svg, .png, .jpg, .jpeg,'
                    />
                    <div className='txt-container'>
                        <p className='d-flex justify-content-between' ><span style={{ fontSize: '0.875rem px' }}>Date Range</span> <span>

                        </span></p>
                        <div className='dt-wrpr' >
                            <DatePicker
                                name={name}
                                selected={promotions[index].start_date}
                                onChange={(e) => onValueChange(e, 'start_date')}
                                dateFormat="dd-MM-yy"
                                placeholderText='Select '
                                className="form-control datePicker datePicker custom-datepicker-page bgGrey" // You can add your custom className here
                            />
                            <DatePicker
                                name={name}
                                selected={promotions[index].end_date ?? ''}
                                onChange={(e) => onValueChange(e, 'end_date')}
                                dateFormat="dd-MM-yy"
                                placeholderText={isEndDate ? 'Select ' : 'Ongoing'}
                                style={{ backgroundColor: '#ccc' }}
                                className={`form-control datePicker datePicker custom-datepicker-page bgGrey`} // You can add your custom className here
                            />
                        </div>
                        {error && <div className="text-danger mt-1">
                            {error}
                        </div>}
                        {promotions[index].startDtError && <div className="text-danger mt-1">{promotions[index].startDtError}</div>}
                        {promotions[index].imgError && <div className="text-danger mt-1">{promotions[index].imgError}</div>}
                        {promotions[index].endDtError && <div className="text-danger mt-1">{promotions[index].endDtError}</div>}

                    </div>
                </div>
                <div onClick={() => onDelete(index)} className='ml-4 p-1 rounded-circle' style={{
                    backgroundColor: '#E5E5E5', cursor: 'pointer', height: '18px',
                    width: '21px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666666'
                }} >
                    <IoMdClose style={{ fontSize: '10px' }} />
                </div>
            </div>
            <ImageUploader
                onSubmit={(blob, url, blobUrl) => {
                    console.log(blobUrl, 'blobUrl')
                    setCroppedImage(url);
                    setBlobImage(blob)
                }}
                onCancel={() => {
                    console.log("Cancelled");
                }}
                sourceImageUrl={previewImage}
                setSourceImageUrl={setPreviewImage}
                openCropModal={modal}
                setOpenCropModal={setModal}
                toggle={toggle2}
                name={`image_${index}`}
                setFieldValue={setFieldValue}
                setPostCall={setPostCall}
                page='location'
                imgAspect={18 / 7}
                diasbleFreeFlow={true}
            />
        </>
    )
}

export default PromotionComp