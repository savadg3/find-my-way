/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./ImageUploader.module.css";
import { Modal, Button } from 'reactstrap';
import { BiZoomIn, BiZoomOut } from 'react-icons/bi';
import { MdOutlineSync } from 'react-icons/md';
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import debounce from "lodash.debounce";
import {
  IoIosArrowUp,
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosArrowDown,
} from "react-icons/io";

function ImageUploader({
  id, onSubmit, onCancel,
  sourceImageUrl,
  setSourceImageUrl,
  openCropModal,
  setOpenCropModal,
  toggle,
  setPostCall,
  name,
  setFieldValue,
  page,
  imgAspect,
  diasbleFreeFlow

}) {
  const defaultAspect = imgAspect;
  const cropDefault = {
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,

  };

  const zoomFactor = 0.1;
  const [crop, setCrop] = useState(cropDefault);
  const [aspectRatio, setAspectRatio] = useState(defaultAspect);
  const [key, setKey] = useState(0);
  const imageRef = useRef(null);
  const imageContainerRef = useRef(null);
  const zoomContainerRef = useRef(null);
  // const [sourceImageUrl, setSourceImageUrl] = useState(null);
  // const [openCropModal, setOpenCropModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        setSourceImageUrl(fileReader.result);
        setOpenCropModal(true);
      });
      fileReader.readAsDataURL(file);
    }
  };

  const getClipPathOverLay = useCallback(
    () => `polygon(
    0 0, 100% 0, 100% 100%, 0 100%, 
    0 100%, 
    0 ${crop.y}%, 
    ${crop.x}% ${crop.y}%, 
    ${crop.x}% ${crop.y + crop.height}%, 
    ${crop.x + crop.width}% ${crop.y + crop.height}%,
    ${crop.x + crop.width}% ${crop.y}%, 
    0 ${crop.y}% 
  )`,
    [crop.height, crop.width, crop.x, crop.y]
  );

  useEffect(() => {
    const debouncedResize = debounce(function handleResize() {
      setKey((k) => k + 1);
    }, 200);

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  const handleImageLoad = (e) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

    // setAspectRatio(defaultAspect)

    // setAspectRatio(4 / 3);

    const crop1 = centerCrop(
      makeAspectCrop(
        {
          // You don't need to pass a complete crop into
          // makeAspectCrop or centerCrop.
          unit: "%",
          width: 40,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );

    setCrop(crop1);
  };

  const adjustCropToBounds = (crop, imageWidth, imageHeight) => {
    let { x, y, width, height } = crop;

    // Convert percentage dimensions to pixels
    const pixelX = (x / 100) * imageWidth;
    const pixelY = (y / 100) * imageHeight;
    const pixelWidth = (width / 100) * imageWidth;
    const pixelHeight = (height / 100) * imageHeight;

    // Calculate the center of the crop area
    const centerX = pixelX + pixelWidth / 2;
    const centerY = pixelY + pixelHeight / 2;

    // Adjust width and height to ensure they are within the image boundaries
    let adjustedWidth = Math.min(pixelWidth, imageWidth);
    let adjustedHeight = Math.min(pixelHeight, imageHeight);

    // Calculate new X and Y based on the center position
    let adjustedX = centerX - adjustedWidth / 2;
    let adjustedY = centerY - adjustedHeight / 2;

    // Ensure the crop area does not go outside the image boundaries
    adjustedX = Math.max(0, Math.min(adjustedX, imageWidth - adjustedWidth));
    adjustedY = Math.max(0, Math.min(adjustedY, imageHeight - adjustedHeight));

    // Convert the adjusted dimensions back to percentages
    return {
      ...crop,
      x: (adjustedX / imageWidth) * 100,
      y: (adjustedY / imageHeight) * 100,
      width: (adjustedWidth / imageWidth) * 100,
      height: (adjustedHeight / imageHeight) * 100,
    };
  };

  const handleCropChange = (_, percentCrop) => {
    const adjustedCrop = adjustCropToBounds(
      percentCrop,
      imageRef.current.width,
      imageRef.current.height
    );
    setCrop(adjustedCrop);
  };

  const getCroppedImg = (image, crop) => {

    const pixelCrop = {
      x: ((crop.x / 100) * image.naturalWidth) / zoomScale,
      y: ((crop.y / 100) * image.naturalHeight) / zoomScale,
      width: (crop.width / 100) * image.naturalWidth,
      height: (crop.height / 100) * image.naturalHeight,
      widthOrginal:
        ((crop.width * zoomScale) / 100) * (image.naturalWidth / zoomScale),
      heightOriginal:
        ((crop.height * zoomScale) / 100) * (image.naturalHeight / zoomScale),
    };

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.widthOrginal / zoomScale,
      pixelCrop.heightOriginal / zoomScale,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    // ctx.restore();
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          blob.name = "cropped-image.jpg";
          const croppedImageUrl = window.URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        },
        "image/png",
        1
      );
    });
  };


  const resetCrop = () => {
    setKey(0);
    setCrop(cropDefault);
    imageRef.current = null;
    setSourceImageUrl(null);
  };

  const handleSubmit = async () => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(imageRef.current, crop);
      const blob = await fetch(croppedImageUrl).then((r) => r.blob());
      const base64String = await convertBlobToBase64(blob);
      const blobUrl = URL.createObjectURL(blob);
      if (onSubmit) {
        onSubmit(blob, base64String, blobUrl);
        if (name) {
          setFieldValue(name, croppedImageUrl)
        }
        setOpenCropModal(false);
        resetCrop();
        setPostCall(true);
        setZoomScale(1)
      }
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const blobToFile = (blob, fileName) => {
    // Create a new File object
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  };

  const handleCancel = () => {
    onCancel();
    setOpenCropModal(false);
    resetCrop();
    setZoomScale(1)

  };

  const handleZoom = (name) => {
    // const name = e.target.name;
    console.log(name)
    switch (name) {
      case "zoomin": {
        const scaleNew = zoomScale + zoomFactor;
        setZoomScale((s) => s + zoomFactor);

        break;
      }
      case "resetzoom": {
        setZoomScale(1);
        break;
      }
      case "zoomout": {
        const scaleNew = zoomScale - zoomFactor;
        setZoomScale((s) => s - zoomFactor);

        break;
      }
    }
  };

  const handleUp = () => {
    zoomContainerRef.current?.scrollBy(0, -60);
  };

  const handleDown = () => {
    zoomContainerRef.current?.scrollBy(0, 60);
  };

  const handleLeft = () => {
    zoomContainerRef.current?.scrollBy(-60, 0);
  };

  const handleRight = () => {
    zoomContainerRef.current?.scrollBy(60, 0);
  };

  return (
    <div className={classes.ImageUploaderRoot}>
      {/* <label htmlFor={id} className="fileinput-label">
        + Upload Image
      </label>
      <input type="file" id={id} name={id} onChange={handleFileChange} /> */}
      <Modal isOpen={openCropModal} toggle={toggle} size='lg' style={{ zIndex: '999999 !important' }} centered>
        <div className={classes.cropModalBody}>
          <div className="header">
            <h5 class="modal-title">Image Cropping</h5>
          </div>
          <div className="image-container  text-center" ref={imageContainerRef}>
            <ReactCrop
              key={key}
              keepSelection={true}
              crop={crop}
              onChange={handleCropChange}
              aspect={aspectRatio}
            // aspect={diasbleFreeFlow ? aspectRatio : false}
            // locked
            >
              <div
                className="crop-overlay"
                style={{
                  clipPath: getClipPathOverLay(),
                }}
              />
              <div
                className="zoom-container"
                tabIndex={-1}
                ref={zoomContainerRef}
              >
                <img
                  className="crop-img"
                  ref={imageRef}
                  src={sourceImageUrl}
                  alt="Image to crop"
                  onLoad={handleImageLoad}
                  style={{ transform: `scale(${zoomScale})` }}
                />
              </div>
            </ReactCrop>
          </div>
          <div className="row mt-3 mb-5">
            {/* <div className="col-sm-12 text-center"> */}
            {/* <button onClick={onRotateLeft} className="btn btn-canvas mr-2"><AiOutlineUndo /></button>
              <button onClick={onRotateRight} className="btn btn-canvas mr-2"><AiOutlineRedo /></button> */}
            {/* <button type="button" name="zoomout" onClick={() => handleZoom("zoomout")} className="btn btn-canvas mr-2" ><BiZoomOut /></button> */}
            {/* <button type="button" name="zoomin" onClick={() => handleZoom("zoomin")} className="btn btn-canvas mr-2"><BiZoomIn /></button> */}
            {/* <button className="btn btn-canvas resetClr" type="button" name="resetzoom" onClick={() => handleZoom("resetzoom")} */}
            {/* ><MdOutlineSync /></button> */}
            {/* </div> */}
          </div>
          <div className="rhs p-4 pt-0">
            <Button color="secondary" className="btn btnCancel" onClick={handleCancel}>
              Cancel
            </Button>
            <Button color="primary" className="btn btn-primary float-right" onClick={handleSubmit}>
              Save
            </Button>{' '}
          </div>
          {/* <div className="rhs">
              <button type="button" className="primary" onClick={handleSubmit}>
                Submit
              </button>
              <button
                type="button"
                className="secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div> */}
          {/* <div className="actions">
            <div className="lhs">
              <div className="zoomControls">
                <button type="button" name="zoomin" onClick={handleZoom}>
                  +
                </button>
                <button type="button" name="resetzoom" onClick={handleZoom}>
                  Reset Zoom
                </button>
                <button type="button" name="zoomout" onClick={handleZoom}>
                  -
                </button>
              </div>
              <div className="zoomNavs">
                <div style={{ textAlign: "center", lineHeight: 1 }}>
                  <button type="button" onClick={handleUp}>
                    <IoIosArrowUp />
                  </button>
                </div>
                <div style={{ textAlign: "center", lineHeight: 1 }}>
                  <button type="button" onClick={handleLeft}>
                    <IoIosArrowBack />
                  </button>
                  <button type="button" onClick={handleRight}>
                    <IoIosArrowForward />
                  </button>
                </div>
                <div style={{ textAlign: "center", lineHeight: 1 }}>
                  <button type="button" onClick={handleDown}>
                    <IoIosArrowDown />
                  </button>
                </div>
              </div>
            </div>
            <div className="rhs">
              <button type="button" className="primary" onClick={handleSubmit}>
                Submit
              </button>
              <button
                type="button"
                className="secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div> */}
        </div>
      </Modal>
    </div>
  );
}

export default ImageUploader;




// /* eslint-disable no-unused-vars */
// import { useCallback, useEffect, useRef, useState } from "react";
// import classes from "./ImageUploader.module.css";
// import { Modal, Button } from 'reactstrap';
// import { BiZoomIn, BiZoomOut } from 'react-icons/bi';
// import { MdOutlineSync } from 'react-icons/md';
// import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";
// import debounce from "lodash.debounce";
// import {
//   IoIosArrowUp,
//   IoIosArrowBack,
//   IoIosArrowForward,
//   IoIosArrowDown,
// } from "react-icons/io";

// function ImageUploader({
//   id, onSubmit, onCancel,
//   sourceImageUrl,
//   setSourceImageUrl,
//   openCropModal,
//   setOpenCropModal,
//   toggle,
//   setPostCall,
//   name,
//   setFieldValue,
//   page,
//   imgAspect

// }) {
//   const defaultAspect = imgAspect;
//   const cropDefault = {
//     unit: "%",
//     x: 0,
//     y: 0,
//     width: 100,
//     height: 100,

//   };

//   const zoomFactor = 0.1;
//   const [crop, setCrop] = useState(cropDefault);
//   const [aspectRatio, setAspectRatio] = useState(defaultAspect);
//   const [key, setKey] = useState(0);
//   const imageRef = useRef(null);
//   const imageContainerRef = useRef(null);
//   const zoomContainerRef = useRef(null);
//   // const [sourceImageUrl, setSourceImageUrl] = useState(null);
//   // const [openCropModal, setOpenCropModal] = useState(false);
//   const [zoomScale, setZoomScale] = useState(1);

//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       const fileReader = new FileReader();
//       fileReader.addEventListener("load", () => {
//         setSourceImageUrl(fileReader.result);
//         setOpenCropModal(true);
//       });
//       fileReader.readAsDataURL(file);
//     }
//   };

//   const getClipPathOverLay = useCallback(
//     () => `polygon(
//     0 0, 100% 0, 100% 100%, 0 100%,
//     0 100%,
//     0 ${crop.y}%,
//     ${crop.x}% ${crop.y}%,
//     ${crop.x}% ${crop.y + crop.height}%,
//     ${crop.x + crop.width}% ${crop.y + crop.height}%,
//     ${crop.x + crop.width}% ${crop.y}%,
//     0 ${crop.y}%
//   )`,
//     [crop.height, crop.width, crop.x, crop.y]
//   );

//   useEffect(() => {
//     const debouncedResize = debounce(function handleResize() {
//       setKey((k) => k + 1);
//     }, 200);

//     window.addEventListener("resize", debouncedResize);

//     return () => {
//       window.removeEventListener("resize", debouncedResize);
//     };
//   }, []);

//   const handleImageLoad = (e) => {
//     const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

//     // setAspectRatio(defaultAspect)

//     // setAspectRatio(4 / 3);

//     const crop1 = centerCrop(
//       makeAspectCrop(
//         {
//           // You don't need to pass a complete crop into
//           // makeAspectCrop or centerCrop.
//           unit: "%",
//           width: 40,
//         },
//         aspectRatio,
//         width,
//         height
//       ),
//       width,
//       height
//     );

//     setCrop(crop1);
//   };

//   const adjustCropToBounds = (crop, imageWidth, imageHeight) => {
//     let { x, y, width, height } = crop;

//     // Convert percentage dimensions to pixels
//     const pixelX = (x / 100) * imageWidth;
//     const pixelY = (y / 100) * imageHeight;
//     const pixelWidth = (width / 100) * imageWidth;
//     const pixelHeight = (height / 100) * imageHeight;

//     // Calculate the center of the crop area
//     const centerX = pixelX + pixelWidth / 2;
//     const centerY = pixelY + pixelHeight / 2;

//     // Adjust width and height to ensure they are within the image boundaries
//     let adjustedWidth = Math.min(pixelWidth, imageWidth);
//     let adjustedHeight = Math.min(pixelHeight, imageHeight);

//     // Calculate new X and Y based on the center position
//     let adjustedX = centerX - adjustedWidth / 2;
//     let adjustedY = centerY - adjustedHeight / 2;

//     // Ensure the crop area does not go outside the image boundaries
//     adjustedX = Math.max(0, Math.min(adjustedX, imageWidth - adjustedWidth));
//     adjustedY = Math.max(0, Math.min(adjustedY, imageHeight - adjustedHeight));

//     // Convert the adjusted dimensions back to percentages
//     return {
//       ...crop,
//       x: (adjustedX / imageWidth) * 100,
//       y: (adjustedY / imageHeight) * 100,
//       width: (adjustedWidth / imageWidth) * 100,
//       height: (adjustedHeight / imageHeight) * 100,
//     };
//   };

//   const handleCropChange = (_, percentCrop) => {
//     const adjustedCrop = adjustCropToBounds(
//       percentCrop,
//       imageRef.current.width,
//       imageRef.current.height
//     );
//     setCrop(adjustedCrop);
//   };

//   const getCroppedImg = (image, crop) => {

//     let cropPositionX=((crop.x / 100) * image.naturalWidth) / zoomScale
//     let cropPositionY= ((crop.y / 100) * image.naturalHeight) / zoomScale
//     const pixelCrop = {
//       x: cropPositionX+(image.naturalWidth*(zoomScale-1)/4),
//       y:cropPositionY+image.naturalHeight*(zoomScale-1)/4,
//       width: (crop.width / 100) * image.naturalWidth,
//       height: (crop.height / 100) * image.naturalHeight,
//       widthOrginal:
//         ((crop.width * zoomScale) / 100) * (image.naturalWidth / zoomScale),
//       heightOriginal:
//         ((crop.height * zoomScale) / 100) * (image.naturalHeight / zoomScale),
//     };

//     const canvas = document.createElement("canvas");
//     canvas.width = pixelCrop.width;
//         canvas.height = pixelCrop.height;

//     const ctx = canvas.getContext("2d");
// console.log( pixelCrop.x,
//       pixelCrop.y,
//       pixelCrop.widthOrginal / zoomScale,
//       pixelCrop.heightOriginal / zoomScale,
//      0,0,
//       pixelCrop.width,
//       pixelCrop.height,'ffffff')
//     ctx.drawImage(
//       image,
//       pixelCrop.x,
//       pixelCrop.y,
//       pixelCrop.widthOrginal / zoomScale,
//       pixelCrop.heightOriginal / zoomScale,
//      0,0,
//       pixelCrop.width,
//       pixelCrop.height
//     );
//     // ctx.restore();
//     return new Promise((resolve) => {
//       canvas.toBlob(
//         (blob) => {
//           if (!blob) {
//             console.error("Canvas is empty");
//             return;
//           }
//           blob.name = "cropped-image.jpg";
//           const croppedImageUrl = window.URL.createObjectURL(blob);
//           resolve(croppedImageUrl);
//         },
//         "image/png",
//         1
//       );
//     });
//   };


//   const resetCrop = () => {
//     setKey(0);
//     setCrop(cropDefault);
//     imageRef.current = null;
//     setSourceImageUrl(null);
//   };

//   const handleSubmit = async () => {
//     if (imageRef.current && crop.width && crop.height) {
//       const croppedImageUrl = await getCroppedImg(imageRef.current, crop);

//       const blob = await fetch(croppedImageUrl).then((r) => r.blob());
//       const base64String = await convertBlobToBase64(blob);
//       if (onSubmit) {
//         onSubmit(blob, base64String);
//         if (name) {
//           setFieldValue(name, croppedImageUrl)
//         }
//         setOpenCropModal(false);
//         resetCrop();
//         setPostCall(true);
//         setZoomScale(1)
//       }
//     }
//   };

//   const convertBlobToBase64 = (blob) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         resolve(reader.result);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   };

//   const handleCancel = () => {
//     onCancel();
//     setOpenCropModal(false);
//     resetCrop();
//     setZoomScale(1)

//   };

//   const handleZoom = (name) => {
//     // const name = e.target.name;
//     console.log(name)
//     switch (name) {
//       case "zoomin": {
//         const scaleNew = zoomScale + zoomFactor;
//         setZoomScale((s) => s + zoomFactor);

//         break;
//       }
//       case "resetzoom": {
//         setZoomScale(1);
//         break;
//       }
//       case "zoomout": {
//         const scaleNew = zoomScale - zoomFactor;
//         setZoomScale((s) => s - zoomFactor);

//         break;
//       }
//     }
//   };

//   const handleUp = () => {
//     zoomContainerRef.current?.scrollBy(0, -60);
//   };

//   const handleDown = () => {
//     zoomContainerRef.current?.scrollBy(0, 60);
//   };

//   const handleLeft = () => {
//     zoomContainerRef.current?.scrollBy(-60, 0);
//   };

//   const handleRight = () => {
//     zoomContainerRef.current?.scrollBy(60, 0);
//   };

//   return (
//     <div className={classes.ImageUploaderRoot}>
//       {/* <label htmlFor={id} className="fileinput-label">
//         + Upload Image
//       </label>
//       <input type="file" id={id} name={id} onChange={handleFileChange} /> */}
//       <Modal isOpen={openCropModal} toggle={toggle} size='lg' style={{ zIndex: '999999 !important' }} backdrop="static">
//         <div className={classes.cropModalBody}>
//           <div className="header">
//             <h5 class="modal-title">Image Cropping</h5>
//           </div>
//           <div className="image-container  text-center" ref={imageContainerRef}>
//             <ReactCrop
//               key={key}
//               keepSelection={true}
//               crop={crop}
//               onChange={handleCropChange}
//               aspect={aspectRatio}
//               locked
//             >
//               <div
//                 className="crop-overlay"
//                 style={{
//                   clipPath: getClipPathOverLay(),
//                 }}
//               />
//               <div
//                 className="zoom-container"
//                 tabIndex={-1}
//                 ref={zoomContainerRef}
//               >
//                 <img
//                   className="crop-img"
//                   ref={imageRef}
//                   src={sourceImageUrl}
//                   alt="Image to crop"
//                   onLoad={handleImageLoad}
//                   style={{ transform: `scale(${zoomScale})` }}
//                 />
//               </div>
//             </ReactCrop>
//           </div>
//           <div className="row mt-3 mb-5">
//             <div className="col-sm-12 text-center">
//               {/* <button onClick={onRotateLeft} className="btn btn-canvas mr-2"><AiOutlineUndo /></button>
//               <button onClick={onRotateRight} className="btn btn-canvas mr-2"><AiOutlineRedo /></button> */}
//               <button type="button" name="zoomout" onClick={() => handleZoom("zoomout")} className="btn btn-canvas mr-2" ><BiZoomOut /></button>
//               <button type="button" name="zoomin" onClick={() => handleZoom("zoomin")} className="btn btn-canvas mr-2"><BiZoomIn /></button>
//               <button className="btn btn-canvas resetClr" type="button" name="resetzoom" onClick={() => handleZoom("resetzoom")}
//               ><MdOutlineSync /></button>
//             </div>
//           </div>
//           <div className="rhs p-4 pt-0">
//             <Button color="secondary" className="btn btnCancel" onClick={handleCancel}>
//               Cancel
//             </Button>
//             <Button color="primary" className="btn btn-primary float-right" onClick={handleSubmit}>
//               Save
//             </Button>{' '}
//           </div>
//           {/* <div className="rhs">
//               <button type="button" className="primary" onClick={handleSubmit}>
//                 Submit
//               </button>
//               <button
//                 type="button"
//                 className="secondary"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>
//             </div> */}
//           {/* <div className="actions">
//             <div className="lhs">
//               <div className="zoomControls">
//                 <button type="button" name="zoomin" onClick={handleZoom}>
//                   +
//                 </button>
//                 <button type="button" name="resetzoom" onClick={handleZoom}>
//                   Reset Zoom
//                 </button>
//                 <button type="button" name="zoomout" onClick={handleZoom}>
//                   -
//                 </button>
//               </div>
//               <div className="zoomNavs">
//                 <div style={{ textAlign: "center", lineHeight: 1 }}>
//                   <button type="button" onClick={handleUp}>
//                     <IoIosArrowUp />
//                   </button>
//                 </div>
//                 <div style={{ textAlign: "center", lineHeight: 1 }}>
//                   <button type="button" onClick={handleLeft}>
//                     <IoIosArrowBack />
//                   </button>
//                   <button type="button" onClick={handleRight}>
//                     <IoIosArrowForward />
//                   </button>
//                 </div>
//                 <div style={{ textAlign: "center", lineHeight: 1 }}>
//                   <button type="button" onClick={handleDown}>
//                     <IoIosArrowDown />
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="rhs">
//               <button type="button" className="primary" onClick={handleSubmit}>
//                 Submit
//               </button>
//               <button
//                 type="button"
//                 className="secondary"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div> */}
//         </div>
//       </Modal>
//     </div>
//   );
// }

// export default ImageUploader;