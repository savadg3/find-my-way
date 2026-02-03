// import React, { useRef, useState, useEffect } from 'react';
// import {
//     Modal,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
//     Button,
// } from 'reactstrap';
// import ReactCrop, {
//     centerCrop,
//     makeAspectCrop,
// } from 'react-image-crop';
// import { AiOutlineClose, AiOutlineUndo, AiOutlineRedo } from 'react-icons/ai';
// import { BiZoomIn, BiZoomOut } from 'react-icons/bi';
// import { MdOutlineSync } from 'react-icons/md';

// const ImageCropModal = ({
//     modal, toggle, previewImage, setPreviewImage, fileName, setFileName, setCroppedImage, setPostCall, page,
//     name,
//     setFieldValue
// }) => {
//     // Crop related state and functions go here...
//     const fileInputRef = useRef(null);
//     const [crop, setCrop] = useState(null);
//     console.log(crop, 'crop')
//     const [completedCrop, setCompletedCrop] = useState();
//     const [scale, setScale] = useState(1);
//     const [rotate, setRotate] = useState(0);
//     const [aspect, setAspect] = useState((page == 'product') ? (4 / 4) : (16 / 9));
//     const imgRef = useRef(null);

//     const onRotateLeft = () => setRotate((prevRotate) => prevRotate - 90);
//     const onRotateRight = () => setRotate((prevRotate) => prevRotate + 90);
//     const onZoomIn = () => {
//         const newScale = scale + 0.1;
//         const newWidth = Math.min(100, imgRef.current?.width * newScale);
//         const newHeight = Math.min(100, imgRef.current?.height * newScale);

//         setScale((prevScale) => prevScale + 0.1);
//         setCrop((c) => ({
//             ...c,
//             width: newWidth,
//             height: newHeight,
//         }))

//     };
//     const onZoomOut = () => setScale((prevScale) => prevScale - 0.1);
//     const onReset = () => {
//         setAspect(16 / 9);
//         setRotate(0);
//         setScale(1);
//     };

//     function centerAspectCrop(
//         mediaWidth,
//         mediaHeight,
//         aspect,
//     ) {
//         return centerCrop(
//             makeAspectCrop(
//                 {
//                     unit: '%',
//                     width: 90,
//                 },
//                 aspect,
//                 mediaWidth,
//                 mediaHeight,
//             ),
//             mediaWidth,
//             mediaHeight,
//         )
//     }

//     function onImageLoad(e) {
//         if (aspect && !crop) {
//             const { width, height } = e.currentTarget;
//             const newCrop = centerAspectCrop(width, height, aspect);
//             setCrop(newCrop);
//         }
//     }


//     const removeImage = () => {
//         setPreviewImage(null);
//         setCroppedImage(null);
//     };

//     function getCroppedImg(image, crop, rotate, scale) {
//         const canvas = document.createElement("canvas");
//         const scaleX = image.naturalWidth / image.width;
//         const scaleY = image.naturalHeight / image.height;
//         canvas.width = crop.width;
//         canvas.height = crop.height;
//         const ctx = canvas.getContext("2d");

//         ctx.drawImage(
//             image,
//             crop.x * scaleX,
//             crop.y * scaleY,
//             crop.width * scaleX * scale,
//             crop.height * scaleY * scale,
//             0,
//             0,
//             crop.width * scale,
//             crop.height * scale
//         );

//         const dataURL = canvas.toDataURL('image/png');
//         return dataURL;
//     }

//     function onSubmit() {
//         if (imgRef.current && completedCrop) {
//             const croppedImageUrl = getCroppedImg(
//                 imgRef.current,
//                 completedCrop,
//                 rotate,
//                 scale // Include the scale here
//             );
//             setCroppedImage(croppedImageUrl);
//             if (name) {
//                 setFieldValue(name, croppedImageUrl)
//             }
//             toggle();
//             setPostCall(true);
//             onReset();
//         }
//     }

//     const closeBtn = (
//         <button className="close" onClick={toggle} type="button">
//             &times;
//         </button>
//     );
//     return (
//         <div tabindex="-1" style={{ position: 'relative', zIndex: '999999', display: 'block' }}>

//             <Modal isOpen={modal} toggle={toggle} size='lg' style={{ zIndex: '999999 !important' }}>
//                 <ModalHeader toggle={toggle} close={closeBtn}>
//                     Image Cropping
//                 </ModalHeader>
//                 <ModalBody className='p-5 align-content-center'>
//                     <div className='text-center crop-size'>
//                         <ReactCrop
//                             crop={crop}
//                             onChange={(_, percentCrop) => setCrop(percentCrop)}
//                             onComplete={(c) => setCompletedCrop(c)}
//                             aspect={aspect}
//                             locked
//                         >
//                             <img
//                                 ref={imgRef}
//                                 alt="Crop me"
//                                 src={previewImage}
//                                 style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
//                                 onLoad={onImageLoad}
//                             />
//                         </ReactCrop>
//                     </div>
//                     <div className="row mt-3">
//                         <div className="col-sm-12 text-center">
//                             <button onClick={onRotateLeft} className="btn btn-canvas mr-2"><AiOutlineUndo /></button>
//                             <button onClick={onRotateRight} className="btn btn-canvas mr-2"><AiOutlineRedo /></button>
//                             <button onClick={onZoomOut} className="btn btn-canvas mr-2" ><BiZoomOut /></button>
//                             <button onClick={onZoomIn} className="btn btn-canvas mr-2"><BiZoomIn /></button>
//                             <button className="btn btn-canvas resetClr" onClick={onReset}
//                             ><MdOutlineSync /></button>
//                         </div>
//                     </div>
//                 </ModalBody>
//                 <ModalFooter style={{ display: 'block' }}>
//                     <Button color="secondary" className="btn btnCancel" onClick={toggle}>
//                         Cancel
//                     </Button>
//                     <Button color="primary" className="btn btn-primary float-right" onClick={onSubmit}>
//                         Save
//                     </Button>{' '}
//                 </ModalFooter>
//             </Modal>
//         </div>

//     );
// };

// export default ImageCropModal;
import React, { useRef, useState, useEffect } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from 'reactstrap';
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
} from 'react-image-crop';
import { AiOutlineClose, AiOutlineUndo, AiOutlineRedo } from 'react-icons/ai';
import { BiZoomIn, BiZoomOut } from 'react-icons/bi';
import { MdOutlineSync } from 'react-icons/md';

const ImageCropModal = ({
    modal, toggle, previewImage, setPreviewImage, fileName, setFileName, setCroppedImage, setPostCall, page,
    name,
    setFieldValue
}) => {
    // Crop related state and functions go here...
    const fileInputRef = useRef(null);
    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] = useState();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState((page == 'product') ? (4 / 4) : (16 / 9));
    const imgRef = useRef(null);

    const onRotateLeft = () => setRotate((prevRotate) => prevRotate - 90);
    const onRotateRight = () => setRotate((prevRotate) => prevRotate + 90);
    const onZoomIn = () => setScale((prevScale) => prevScale + 0.1);
    const onZoomOut = () => setScale((prevScale) => prevScale - 0.1);
    const onReset = () => {
        setAspect(16 / 9);
        setRotate(0);
        setScale(1);
    };

    function centerAspectCrop(
        mediaWidth,
        mediaHeight,
        aspect,
    ) {
        return centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspect,
                mediaWidth,
                mediaHeight,
            ),
            mediaWidth,
            mediaHeight,
        )
    }

    function onImageLoad(e) {
        if (aspect && !crop) {
            const { width, height } = e.currentTarget;
            const newCrop = centerAspectCrop(width, height, aspect);
            setCrop(newCrop);
        }
    }


    const removeImage = () => {
        setPreviewImage(null);
        setCroppedImage(null);
    };

    function getCroppedImg(image, crop, rotate, scale) {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        const dataURL = canvas.toDataURL('image/png');
        return dataURL;
    }

    function onSubmit() {
        if (imgRef.current && completedCrop) {
            const croppedImageUrl = getCroppedImg(
                imgRef.current,
                completedCrop,
                rotate,
                1 // Include the scale here
            );
            setCroppedImage(croppedImageUrl);
            if (name) {
                setFieldValue(name, croppedImageUrl)
            }
            toggle();
            setPostCall(true);
            onReset();
        }
    }

    const closeBtn = (
        <button className="close" onClick={toggle} type="button">
            &times;
        </button>
    );
    return (
        <div tabindex="-1" style={{ position: 'relative', zIndex: '999999', display: 'block' }}>

            <Modal isOpen={modal} toggle={toggle} size='lg' style={{ zIndex: '999999 !important' }}>
                <ModalHeader toggle={toggle} close={closeBtn}>
                    Image Cropping
                </ModalHeader>
                <ModalBody className='p-5 align-content-center'>
                    <div className='text-center crop-size'>
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            locked
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={previewImage}
                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    </div>
                    <div className="row mt-3">
                        <div className="col-sm-12 text-center">
                            <button onClick={onRotateLeft} className="btn btn-canvas mr-2"><AiOutlineUndo /></button>
                            <button onClick={onRotateRight} className="btn btn-canvas mr-2"><AiOutlineRedo /></button>
                            <button onClick={onZoomOut} className="btn btn-canvas mr-2" ><BiZoomOut /></button>
                            <button onClick={onZoomIn} className="btn btn-canvas mr-2"><BiZoomIn /></button>
                            <button className="btn btn-canvas resetClr" onClick={onReset}
                            ><MdOutlineSync /></button>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter style={{ display: 'block' }}>
                    <Button color="secondary" className="btn btnCancel" onClick={toggle}>
                        Cancel
                    </Button>
                    <Button color="primary" className="btn btn-primary float-right" onClick={onSubmit}>
                        Save
                    </Button>{' '}
                </ModalFooter>
            </Modal>
        </div>

    );
};

export default ImageCropModal;


