import { IoMdClose } from "react-icons/io";
import { Button, Card, CardBody, Col, Label, Modal, ModalBody, Table, ModalHeader, Row } from "reactstrap";
import { additionalSvg, customRound, proSvg } from "../constants/constant";
import { getRequest, getRequestForDownload, postRequest } from "../../../../hooks/axiosClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../BuildProject.css';
import { useEffect, useRef, useState } from "react";
import CommonDropdown from "../../../../components/common/CommonDropdown";
import jsPDF from "jspdf";

const ProPinModal = ({
    isOpen,
    toggle,
    totalPinsUsed,
    planDetails,
    addCardDetails,
    projectSettings
}) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size='sm' style={{ zIndex: '999999 !important', color: '#000' }} centered>
            <ModalHeader style={{ padding: '25px 25px 15px 25px', fontSize: '1.5rem' }}>
                <div className='d-flex justify-space-between'>
                    <span>
                        You've Hit Your Limit!
                    </span>
                    <div className='ml-2  rounded-circle payment-close-btn' onClick={() => toggle()} >
                        <IoMdClose fontSize={15} />
                    </div>
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: '0px 32px 32px 32px', fontSize: '0.875rem', fontWeight: '500' }}>
                <Card >
                    <p>You've reached the maximum number of pins for your current plan:</p>
                    <ul className='ulStyles' style={{ marginTop: '10px' }}>
                        <li>
                            <span className={`${totalPinsUsed?.used_locations == totalPinsUsed?.total_locations ? 'red' : ''}`}>{totalPinsUsed?.used_locations}</span>/{totalPinsUsed?.total_locations} Location Pins
                        </li>
                        <li>
                            <span className={`${totalPinsUsed?.used_products == totalPinsUsed?.total_products ? 'red' : ''}`}>{totalPinsUsed?.used_products}</span>/{totalPinsUsed?.total_products} Product Pins
                        </li>
                    </ul>
                    <p style={{ marginTop: '10px' }}>
                        {((planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0)) ? 'Please upgrade your plan to increase your total pin limit.' : 'Please purchase additional pins to increase your total pin limit.'}
                    </p>

                    <Card className="cardContainer">

                        <CardBody className='greycard'>
                            <div className="svgContainer">
                                {((planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0)) ? proSvg : additionalSvg}

                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? 'Pro' : (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0) ? 'Additional' : 'Additional +'}</h1>
                            <ul className='ulStyles'>
                                <li>
                                    {
                                        (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0)
                                            ?
                                            `$${customRound(((planDetails?.plan?.basic_cost) - ((planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100))), 2)}`
                                            :
                                            `$${customRound(((planDetails?.plan?.additional_cost) - ((planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100))), 2)}`} / month
                                </li>
                                <li>
                                    {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `${planDetails?.plan?.basic_location_pins}` : `${planDetails?.plan?.additional_location_pins}`}   Additional Location Pins
                                </li>
                                <li>
                                    {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `${planDetails?.plan?.basic_product_pins}` : `${planDetails?.plan?.additional_product_pins}`}  Additional Product Pins
                                </li>
                            </ul>
                        </CardBody>
                        <Button className={` ${(planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0) ? 'btn-warning ' : 'btn-successs'}`}
                            onClick={() => {
                                if ((planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0) && projectSettings?.status == 0) {
                                    toast.warning('Project is inactive! To upgrade to the pro plan, please activate your project.')
                                } else {
                                    addCardDetails(planDetails?.plan)
                                }
                            }
                            }
                        >
                            Proceed to Payment
                        </Button>
                    </Card>
                </Card >
            </ModalBody>
        </Modal>
    )
}

const GenerateQrModal = ({
    isOpen,
    toggle,
    projectSettings,
    filteredData,
}) => {
    const [loading, setLoading] = useState(false);
    const [beaconOptions, setBeaconOptions] = useState([]);
    const [beaconValue, setBeaconValue] = useState({});
    const canvasRef = useRef(null);

    const onChangeBeacon = (e) => {
        setBeaconValue(e)
    }

    useEffect(() => {
        if (isOpen == true) {
            setBeaconValue({})
            // console.log(filteredData, 'filteredData')
            const sortedData = filteredData.filter(item => item.position !== null);
            setBeaconOptions((prev) => {
                return sortedData.map((el) => ({ ...el, value: el.enc_id, label: el.beacon_name }))
            });
        }
    }, [isOpen])

    const generateQrcode = async (row, type) => {
        setLoading(true);
        try {
            DownloadPdf(row,type)
            // const response = await getRequestForDownload(`generate-qr/${row?.enc_id}/${type}`);
            // console.log(response)
            // const dataRes = response.data;
            // const blob = new Blob([dataRes], {
            //     type: "application/pdf",
            // });
            // const url = window.URL.createObjectURL(blob);
            // const link = document.createElement("a");
            // link.href = url;
            // const pdfName = row?.beacon_name
            // link.setAttribute("download", `${pdfName}.pdf`);
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            // window.URL.revokeObjectURL(url);
            // toast.success('QR Code beacon poster generated successfully.');
            // createNotification('success', 'Student pin details downloaded successfully.', 'filled');
        } catch (error) {
            console.log(error)
            if (error.response.status === 400) {
                toast.error("Please publish the project to generate QR Code Beacon.")
            }
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 3000);
        }
    }

    const deleteQrPng = async (imageUrl) => {
        try {
          const response = await postRequest(`delete-qr`,{url:imageUrl});
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      }

    const DownloadQrcodeAsPng = async (row) => {
    setLoading(true);
        try {
        const response = await getRequest(`download-qr/${row?.enc_id}`);
        // console.log(response);
        const dataRes = response.data;
        downloadQrPng(dataRes, row)
        } catch (error) {
        // console.log(error);
        if (error.response.status === 400) {
            toast.error("Please publish the project to generate QR Code Beacon.")
        }
        } finally {
        setTimeout(() => {
            setLoading(false)
        }, 3000);
        }
    }

    const downloadQrPng = async (responseData, row) => {
        try {
            const imageUrl = responseData?.url;
            if (!imageUrl) {
                toast.error("Image URL not found.");
                return;
            }
    
            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();
    
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const imageName = row?.beacon_name || "QRCode"; 
            link.setAttribute("download", `${imageName}.png`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
    
            toast.success("QR Code image downloaded successfully.");
            deleteQrPng(imageUrl)

        } catch (error) {
            console.error("Error downloading the QR Code:", error);
            toast.error("Failed to download QR Code.");
        }
    };


     
    const DownloadPdf = async (row, type) => {
        // console.log(row, type);
        const pdfSizes = {
          1: { width: 595, height: 842, format: 'a4' },
          2: { width: 842, height: 1191, format: 'a3' },
          3: { width: 1684, height: 2382, format: [1684, 2382] }
        };
        const a4Size = pdfSizes[1];
        const targetSize = pdfSizes[type];
    
        try {
          const url = `generate-qr/${row?.enc_id}`;
          const response = await getRequest(url);
          const data = response?.data?.data;
    
          const beacon_template = JSON.parse(data?.beacon_template);
          const beacon_name = data?.beacon_name;
          const new_qr = data?.qrcodePath;
         
          if (!beacon_template || typeof beacon_template !== 'object') {
            console.error("Invalid or missing beacon_template:", beacon_template);
            return;
          }
    
    
          const canvasElement = canvasRef.current;
          if (!canvasElement) {
            console.error("Canvas ref not found.");
            return;
          }
    
          const canvas = new fabric.Canvas(canvasElement, {
            width: a4Size.width,
            height: a4Size.height,
            backgroundColor: '#ffffff',
          });
    
          // fabric.Image.fromURL(new_qr, (newImg) => {
    
          //   canvas.loadFromJSON(beacon_template, () => {
          //     canvas.renderAll();
    
          //     canvas.getObjects().forEach((obj) => {
          //       if (obj.name === "qrimage" && obj.type === "image") {
          //         // newImg.set({ left: obj.left, top: obj.top });
          //         // // // console.log(obj.width,obj.height,newImg.width,newImg.height,);
          //         // const maxWidth = obj.width;
          //         // const maxHeight = obj.height;
          //         // const scale = Math.min(maxWidth / newImg.width, maxHeight / newImg.height);
    
          //         // newImg.set({
          //         //   width : maxWidth,
          //         //   height : maxHeight,
          //         //   scaleX: scale,
          //         //   scaleY: scale,
          //         //   originX: 'left',
          //         //   originY: 'top',
          //         //   includeInHistory: true,
          //         //   selectable: false,
          //         //   name: "qrimage"
          //         // });
          //         // canvas.remove(obj);
          //         // canvas.add(newImg);
    
    
          //         newImg.set({
          //           left: obj.left,
          //           top: obj.top,
          //           scaleX: obj.scaleX,
          //           scaleY: obj.scaleY,
          //           angle: obj.angle,
          //           originX: obj.originX,
          //           originY: obj.originY,
          //           name: obj.name,
          //           selectable: obj.selectable,
          //           zIndex: obj.zIndex
          //         });
    
          //         canvas.remove(obj);
          //         canvas.add(newImg);
          //       }
    
          //       if (obj.name === "qrimage" && obj.type === "textbox") {
          //         const originalCenter = obj.getCenterPoint();   
    
          //         obj.text = applyMatchingCase(obj.text, beacon_name);
    
          //         obj.set({
          //           originX: 'center',
          //           originY: 'center',
          //           left: originalCenter.x,
          //           top: originalCenter.y
          //         });
          //       }
          //       if (obj.objectLayoutType === "layout-boundary") {
          //         obj.set({
          //           shadow: null,
          //           stroke: null,
          //           strokeWidth: 0
          //         });
          //       }
          //     });
    
          //     const backgroundObject = canvas.getObjects().find(obj => obj.objectLayoutType === "layout-boundary");
          //     if (!backgroundObject) {
          //       console.error("❌ No layout-boundary object found.");
          //       return;
          //     }          
    
          //     const bounds = backgroundObject.getBoundingRect();
          //     const objectsInside = canvas.getObjects().filter(obj => {
          //       if (obj === backgroundObject) return true;
    
          //       const objBounds = obj.getBoundingRect();
          //       return (
          //         objBounds.left >= bounds.left &&
          //         objBounds.top >= bounds.top &&
          //         objBounds.left + objBounds.width <= bounds.left + bounds.width &&
          //         objBounds.top + objBounds.height <= bounds.top + bounds.height
          //       );
          //     });
    
          //     const tempCanvas = new fabric.StaticCanvas(null, {
          //       width: bounds.width,
          //       height: bounds.height,
          //       backgroundColor: '#ffffff'
          //     });
    
          //     objectsInside.forEach(obj => {
          //       const clone = fabric.util.object.clone(obj);
          //       clone.left -= bounds.left;
          //       clone.top -= bounds.top;
          //       tempCanvas.add(clone);
          //     });
    
          //     tempCanvas.renderAll();
    
          //     const scaleX = targetSize.width / a4Size.width;
          //     const scaleY = targetSize.height / a4Size.height;
          //     const scale = Math.min(scaleX, scaleY);
    
          //     exportCanvasAsPNG(tempCanvas, beacon_name, targetSize, scale);
          //   });
    
          // }, { crossOrigin: 'anonymous' });
    
          
          
          fabric.Image.fromURL(new_qr, (newImg) => {
            canvas.loadFromJSON(beacon_template, () => {
                canvas.renderAll();
                removeTaintedGroups(canvas)
    
                canvas.getObjects().forEach((obj) => {
                    if (obj.name === "qrimage" && obj.type === "image") {
                    newImg.set({
                        left: obj.left,
                        top: obj.top,
                        scaleX: obj.scaleX,
                        scaleY: obj.scaleY,
                        angle: obj.angle,
                        originX: obj.originX,
                        originY: obj.originY,
                        name: obj.name,
                        selectable: obj.selectable,
                        zIndex: obj.zIndex
                    });
        
                    canvas.remove(obj);
                    canvas.add(newImg);
                    }
        
                    if (obj.name === "qrimage" && obj.type === "textbox") {
                    const originalCenter = obj.getCenterPoint();
        
                    obj.text = applyMatchingCase(obj.text, beacon_name);
        
                    obj.set({
                        originX: 'center',
                        originY: 'center',
                        left: originalCenter.x,
                        top: originalCenter.y
                    });
                    }
        
                    if (obj.objectLayoutType === "layout-boundary") {
                    obj.set({
                        shadow: null,
                        stroke: null,
                        strokeWidth: 0
                    });
                    }
                });
    
                const backgroundObject = canvas.getObjects().find(obj => obj.objectLayoutType === "layout-boundary");
                if (!backgroundObject) {
                    console.error("❌ No layout-boundary object found.");
                    return;
                }
    
                const bounds = backgroundObject.getBoundingRect();
    
                // ✅ Select all objects fully or partially inside the layout-boundary
                const objectsInside = canvas.getObjects().filter(obj => {
                    if (obj === backgroundObject) return true;
        
                    const objBounds = obj.getBoundingRect();
                    return !(
                    objBounds.left + objBounds.width < bounds.left ||
                    objBounds.left > bounds.left + bounds.width ||
                    objBounds.top + objBounds.height < bounds.top ||
                    objBounds.top > bounds.top + bounds.height
                    );
                });
        
                const tempCanvas = new fabric.StaticCanvas(null, {
                    width: bounds.width,
                    height: bounds.height,
                    backgroundColor: '#ffffff'
                });
        
                // ✅ Group with clipPath to clip everything to layout-boundary
                const clipRect = new fabric.Rect({
                    left: 0,
                    top: 0,
                    width: bounds.width,
                    height: bounds.height,
                    absolutePositioned: true
                });

                const group = new fabric.Group([], {
                clipPath: clipRect
                });

                objectsInside.forEach(obj => {
                const clone = fabric.util.object.clone(obj);
                clone.left -= bounds.left;
                clone.top -= bounds.top;
                group.addWithUpdate(clone);
                });

                tempCanvas.add(group);
                tempCanvas.renderAll();

                const scaleX = targetSize.width / a4Size.width;
                const scaleY = targetSize.height / a4Size.height;
                const scale = Math.min(scaleX, scaleY);
                
        
                exportCanvasAsPNG(tempCanvas, beacon_name, targetSize, scale);
            });
          }, { crossOrigin: 'anonymous' });
    
          
          
          
        } catch (error) {
          console.error("QR fetch error:", error);
        }
    };
    
    
    const applyMatchingCase = (templateText, inputText) => {
        if (!templateText) return inputText;
    
        const isUpperCase = templateText === templateText.toUpperCase();
        const isLowerCase = templateText === templateText.toLowerCase();
        const isCapitalized = /^[A-Z][a-z]/.test(templateText);
    
        if (isUpperCase) {
          return inputText.toUpperCase();
        } else if (isLowerCase) {
          return inputText.toLowerCase();
        } else if (isCapitalized) {
          return inputText
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }
    
        return inputText;
    };
    
    
    function exportCanvasAsPNG(canvas, name = 'beacon', size) {
        try {
            const multiplier = 3; 
            const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: multiplier,
            quality: 1,
            });
        
            const pdf = new jsPDF({
            // orientation: size.width > size.height ? 'landscape' : 'portrait',
            orientation: 'portrait',
            unit: 'pt',
            format: size.format
            });
        
            pdf.addImage(dataURL, 'PNG', 0, 0, size.width, size.height);
            pdf.save(`${name}-${size?.format}.pdf`);
            setLoading(false);
            toast.success('QR Code beacon poster generated successfully.');
        } catch (err) {
            console.error('Export failed:', err);
            toast.error("Please publish the project to generate QR Code Beacon.")
            // alert('Export failed due to a tainted image.');
            setLoading(false)
        }
    }
        
    function containsTaintedImage(obj) {
        if (obj.type === 'image') {
            const src = obj.getSrc?.();
            return src && !src.startsWith('data:image');
        }
        if (obj._objects) {
            return obj._objects.some(child => containsTaintedImage(child));
        }
        return false;
    }
    
    function removeTaintedGroups(canvas) {
        const objects = canvas.getObjects();
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if ((obj.type === 'group' || obj._objects) && containsTaintedImage(obj)) {
                console.warn('Removing tainted group:', obj);
                canvas.remove(obj);
            }
        }
        canvas.renderAll();
    }

    return (
        <>
            <Modal className="panel-header-canvas" isOpen={isOpen} toggle={toggle} style={{ zIndex: '999999 !important', maxWidth: '850px' }} centered>
                <canvas ref={canvasRef} style={{display:"none"}}/>
                <ModalHeader toggle={toggle} style={{ padding: '33px 32px 0px 32px' }}>
                    Generate QR Code Beacon Poster
                </ModalHeader>

                <ModalBody className="modalbody-padding" >
                    <Row className='mt-2 mb-3' >
                        <Col md={6}>

                            <Label className='form-labels'>Select QR Code Beacon</Label>
                            <CommonDropdown name='agent' options={beaconOptions} value={Object.keys(beaconValue).length > 0 ? beaconValue : null} onChange={(e) => { onChangeBeacon(e) }} />


                        </Col>
                    </Row>
                    <Row >
                        <Col md={12}>
                            <div className="mb-2">
                                <Label style={{ color: '#6a6d73', fontSize: '0.875rem', fontWeight: 'bold', marginTop: '11.48px' }}>{projectSettings?.project_name}</Label>
                            </div>
                        </Col>
                    </Row>
                    <Row >
                        <Col md={12}>
                            <Table className="custom-table">
                                <thead>
                                    <tr>
                                        <th className='theadStyle'>QR Code Beacon</th>
                                        <th className='theadStyle'>Print</th>
                                        {/* <th className='theadStyle'>Web</th> */}
                                        <th className='theadStyle'>QR</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {beaconValue?.beacon_name ? (
                                        // filteredData?.length > 0 ? (
                                        // filteredData?.map((item, index) => (
                                            <tr >
                                                <td>{beaconValue.beacon_name}</td>
                                                <td>
                                                    <div className='d-flex'>
                                                        <button className="btn btn-sm buttoninfo mr-2" onClick={() => generateQrcode(beaconValue, 1)}>A4</button>{" "}
                                                        <button className="btn btn-sm buttoninfo mr-2" onClick={() => generateQrcode(beaconValue, 2)}>A3</button>
                                                    </div>
                                                </td>
                                                {/* <td>
                                                    <button className="btn btn-sm buttoninfo" onClick={() => generateQrcode(beaconValue, 3)}>FHD</button>
                                                </td> */}
                                                <td>
                                                    <button className="btn btn-sm buttoninfo " onClick={() => DownloadQrcodeAsPng(beaconValue)}> Download</button>
                                                </td>
                                            </tr>
                                        // ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3">No data found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                        </Col>
                    </Row>
                    <Row className="mt-3 mb-3">
                        <Col md={12}>
                            <Button color="secondary" className="btn btnCancel float-right" onClick={toggle}>
                                Cancel
                            </Button>
                        </Col>
                    </Row>

                </ModalBody>
                
            </Modal>
            {loading &&
                <Modal isOpen={true} size="sm" className="loading-modal" style={{ zIndex: '9999999 !important', maxWidth: '200px', backgroundColor: 'transparent' }} centered>
                    <ModalBody >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                            <div class="folder">
                                <span class="folder-tab"></span>
                                <div class="folder-icn">
                                    <div class="downloading">
                                        <span class="custom-arrow"></span>
                                    </div>
                                    <div class="bar-downld"></div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            }
        </>

    )
}

export {
    ProPinModal,
    GenerateQrModal,
}