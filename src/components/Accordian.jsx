import React, { useEffect, useRef, useState } from "react";
import { MoreOutlined } from "@ant-design/icons";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row, Col, Label, Button, Table, CardBody, Card,
  Spinner
} from "reactstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import swal from 'sweetalert';
import { useNavigate } from "react-router-dom";
import "../pages/project/project.css";
import { getRequest, getRequestForDownload, postRequest, deleteRequest } from '../hooks/axiosClient';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { LocationSvgSmall, ProductSvgSmall } from "../pages/buildProject/CustomSvg";
import { encode, getCurrentUser } from "../helpers/utils";
import { FiSearch } from "react-icons/fi";
import noDataImg from "../assets/img/noData.png";
import PaymentForm from './stripe/payment';
import MoveOrCopy from "./modal/moveOrCopyModal";
import ProjectLinksModalComponent from "./modal/ProjectLinksModal";
import { BiCrown } from "react-icons/bi";
import { UpgradeProModal } from "../pages/buildProject/Helpers/modal/upgradeModal";
import CommonDropdown from "./common/CommonDropdown";
import InfiniteScroll from 'react-infinite-scroll-component';
import jsPDF from "jspdf";


const AccordionItem = ({ panel, getProjectlist, index, getProjectById, getAllList }) => {
  const canvasRef = useRef(null);

  const [isOpen, setIsOpen] = useState([]);
  const [modal, setModal] = useState(false);
  const toggle2 = () => setModal(!modal);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [planDetails, setPlanDetails] = useState();
  const [stripeModal, setStripeModal] = useState(false);
  const toggleStripe = () => setStripeModal(!stripeModal);
  const [fromStatus, setFromStatus] = useState(false);

  const [moveOrCopyModal, setMoveOrCopyModal] = useState(false);
  const toggleMoveOrCopy = () => setMoveOrCopyModal(!moveOrCopyModal);
  const [moveOrCopy, setMoveOrCopy] = useState();
  const [rowDetails, setRowDetails] = useState();
  const [modalLink, setModalLink] = useState(false);
  const toggleModalLink = () => setModalLink(!modalLink);

  const [upgradeProModal, setUpgradeProModal] = useState(false);
  const toggleUpgrade = () => setUpgradeProModal(!upgradeProModal);
  const [fromUpgrade, setFromUpgrade] = useState(false);



  const styleElement = document.createElement("style");
  styleElement.innerHTML = `

.free{
  color:#6a6d73;
  background-color:#dddddd
}
.pro{
  color:#f9b74c;
  background-color:#fde9ca
}
.active{
  color:#6daa76;
}
.inactive{
  color:#D93025;
}
.publish{
  padding: 4px 20px;
  font-size:1rem;
  border-radius: 6px;
  color: #69a472;
  font-weight: 400;
  background-color: #dff7e3;

}
.pending{
  padding: 4px 20px;
  font-size:1rem;
  border-radius: 6px;
  color: #6a6d73;
  font-weight: 400;
  background-color: #f5f6f7;

}
.actionIcons{
  padding: "3px 6px 4px 6px",
  backgroundColor:"#dff1fa",
  borderRadius:"6px",
  
}
.dropdown-toggle {
  background-color: transparent; /* Remove background color */
  border: none; /* Remove border */
  box-shadow: none; /* Remove box shadow */
  color: inherit; /* Inherit text color */
  padding: 0; /* Remove padding */
}
.dropdown-toggle::after {
  display: none;
}
 .dropdown-menu {
  font-size: 0.875rem !important;
  //  width: auto !important;
  --bs-dropdown-min-width: 5rem !important;
  inset: 0px 0px auto auto !important;
  // box-shadow:0px 0px 15px 1px #ccc !important;
  // border: none !important;

}
.drpdown{
   width: auto !important;
}
.dropdown-item:focus, .dropdown-item:hover {
  background-color: #f3f8fa !important
}
.anticon svg {
  margin-top:0px !important
}
.round{
  height:10px;
  width:10px;
  border-radius:50px;
}

.customer-email{
  padding: 4px 20px;
  font-size: 0.875rem;
  border-radius: 6px;
  color: #26a3db;
  font-weight: 500;
  background-color: #dff1fa;
}
`;

  document.head.appendChild(styleElement);

  const role_id = getCurrentUser()?.user?.role_id;

  const statusChange = async (id, values, isAccepted, ip) => {
    let data = {}
    if (values) {
      data.is_accepted = isAccepted == true ? 1 : 0,
        data.ip_address = ip
    }
    try {
      const response = await postRequest(`project/${id}/status`);
      const data = response.response?.data ?? [];
      console.log(response);
      if (response?.type === 2) {
        swal({
          text: response?.errormessage,
          icon: "error",
        })
      } else {
        swal({
          text: data?.message,
          icon: "success",
        })
        // getProjectlist();
        getAllList()
      }
      if (values) {
        toggleStripe();
      }

    } catch (error) {
      console.log(error);
    }
  }

  const handleDuplicate = async (id) => {
    let data = {
      project_id: id,
    }
    try {
      const response = await postRequest(`project-clone`, data);
      getProjectlist();
    } catch (error) {
      console.log(error);
    }
  }

  const StatusClick = (row) => {
    swal({
      title: "Are you sure",
      text: "You want to change status?",
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

            if (row?.status == 0 && ((row?.published_date != null && row?.recurring_date == null) || (row?.is_copy == 1 && row?.published_date == null && row?.recurring_date == null && row?.is_basic == 1))) {
              checkPackageDetails(row?.enc_id, 'status');
            } else {
              statusChange(row?.enc_id) 
            }
            break;
          default:
            break;
        }
      });
  }

  const toggleDropdown = (index, panel) => {
    const updatedOpenStates = [...isOpen];
    updatedOpenStates[index] = !updatedOpenStates[index];
    if (role_id != 1) {
      if (panel.inactivated_by == 1) {
        toast.error('Your project is inactive. Please contact the administrator.')
      } else {
        setIsOpen(updatedOpenStates);
      }
    } else {
      setIsOpen(updatedOpenStates);
    }
  };

  const EditClick = (panel) => {
    if (window.innerWidth > 1100) {
      navigate(`/view-floor/${encode(panel?.enc_id)}`)
    } else {
      toast.warning('These modules do not support the mobile version. Please switch to  laptops, or PCs to access the advantages',
        { autoClose: 5000 }
      )
    }
  }


  
  const DownloadPdf = async (row, type) => {
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

          // ✅ Export
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


  const generateQrcode = async (row, type) => {
    setLoading(true);
    if (type !== 4) {
      DownloadPdf(row,type)

      // try {
      //   const response = await getRequestForDownload(`generate-qr/${row?.enc_id}/${type}`);
      //   const dataRes = response.data;
      //   downloaQr(dataRes, row)
  
      // } catch (error) {
      //   if (error.response.status === 400) {
      //     toast.error("Please publish the project to generate QR Code Beacon.")
      //   }
      // } finally {
  
      //   setTimeout(() => {
      //     setLoading(false)
      //   }, 3000);
      // }
    } else {
      try {
        const response = await getRequest(`download-qr/${row?.enc_id}`);
        console.log(response);
        const dataRes = response.data;
        downloadQrPng(dataRes, row)
  
      } catch (error) {
        console.log(error);
        if (error.response.status === 400) {
          toast.error("Please publish the project to generate QR Code Beacon.")
        }
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 3000);
      }
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
        console.log(error);
        if (error.response.status === 400) {
          toast.error("Please publish the project to generate QR Code Beacon.")
        }
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 3000);
      }
  }

  const downloaQr = (dataRes, row) => {
    const blob = new Blob([dataRes], {
      type: "application/pdf",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const pdfName = row?.beacon_name
    link.setAttribute("download", `${pdfName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('QR Code beacon poster generated successfully.');
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

  const deleteClick = (row) => {
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
            deleteProject(row?.enc_id)
            break;
          default:
            break;
        }
      });
  }

  const deleteProject = async (id) => {
    try {
      const response = await deleteRequest(`project/${id}`);
      const data = response.data ?? [];
      toast.success(data?.message);
      // getProjectlist()
      getAllList()
    } catch (error) {
      console.log(error);
    }
  }

  const publishClick = (row) => {
    if (row?.logo == null) {
      toast.error('Please upload the project logo for publishing.')
    } else if (!row?.error_reporting_email) {
      toast.error("Please enter the error report recipient's email address to publish the project.");
    } else {
      swal({
        title: "Are you sure you want to publish?",
        text: "Publishing will overwrite old data, making it irreversible.",
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
              handlePublish(row?.enc_id);
              break;
            default:
              break;
          }
        });
    }
  }

  const checkPackageDetails = async (id, from) => {
    try {
      const reqUrl = `check-package/${id}`;
      const response = await getRequest(reqUrl);
      const data = response?.data ?? [];
      setPlanDetails(data);
      if (from == 'status') {
        setFromStatus(true);
        setStripeModal(true);
      } else {
        setFromStatus(false);
        if (data?.plan?.basic_expired == 1 || data?.plan?.additional_expired == 1 || data?.plan?.additional_count == 1) {
          setStripeModal(true);
        } else {
          handlePublish(id);
        }
      }
    } catch (error) {
    }
  }

  const onUpgradeDetails = async (id,) => {
    try {
      const reqUrl = `plan-upgrade/${id}`;
      const response = await getRequest(reqUrl);
      const data = response?.data ?? [];
      setFromUpgrade(true)
      setPlanDetails(data);
      setUpgradeProModal(true);


    } catch (error) {
    }
  }

  const OnUpgrade = (row) => {
    onUpgradeDetails(row?.enc_id)
  }
  const handlePublish = async (rowid, values, isAccepted, ip) => {
    let data = {
      id: Number(rowid),
    };
    // if (values) {
    //   data.free_expired = values?.plan?.free_expired,
    //     data.basic_expired = values?.plan?.basic_expired,
    //     data.additional_expired = values?.plan?.additional_expired,
    //     data.additional_count = values?.plan?.additional_count,
    //     data.basic_expired = values?.plan?.basic_expired,
    //     data.is_accepted = isAccepted == true ? 1 : 0,
    //     data.ip_address = ip
    // }
    try {
      const reqUrl = `publish`;
      const response = await postRequest(reqUrl, data);
      // handleEnableDisable();
      const result = response?.response?.data ?? [];
      if (response?.type === 1) {
        toast.success(result?.message);
        getAllList()
        
      } else {
        toast.error(response?.errormessage);
      }
    } catch (error) {
    }
    return

  };
  const discardClick = (rowId) => {
    swal({
      title: "Are you sure you want to discard?",
      text: " Once discarded, the latest published details will be restored.",
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
            handleDiscard(rowId)
            break;
          default:
            break;
        }
      });
  }

  const revertPackage = async (rowId) => {
    try {
      const reqUrl = `revert-package/${rowId}`;
      const response = await getRequest(reqUrl);
    } catch (error) {
    }
  }

  const handleDiscard = async (rowId) => {
    let data = {
      id: Number(rowId),
    }
    try {
      const reqUrl = `discard`;
      const response = await postRequest(reqUrl, data);
      // handleEnableDisable();
      const result = response?.response?.data ?? [];
      toast.success(result?.message);
      revertPackage(rowId);
      setTimeout(() => {
        getAllList()
      }, 500);
    } catch (error) {
    }
  }

  const handleMoveOrCopy = (row, type) => {
    /* type 1 = Move To
    type 2 = Copy To */
    setMoveOrCopyModal(true)
    setMoveOrCopy(type);
    setRowDetails(row);
    console.log('herehere')

  }
  const [beaconOptions, setBeaconOptions] = useState([]);
  const [beaconValue, setBeaconValue] = useState({});

  useEffect(() => {
    if (modal == true) {
      setBeaconOptions((prev) => {
        return panel?.beacon_data.map((el) => ({ ...el, value: el.enc_id, label: el.beacon_name }))
      });
    }


  }, [modal])


  const onChangeBeacon = (e) => {
    // console.log(e)
    setBeaconValue(e)
  }

  const renderPanelHeader = (panel, index) => (
    <>
      {/* {console.log(panel,"panel panel panel")} */}
      <Row>
        <Col md={6} className="mb-2">
          <div style={{ color: "#1D1D1B" }} className="d-flex align-items-center" >
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              marginRight: "6px"
            }}>
            </div>
            <span className="round mr-2" style={{ backgroundColor: panel?.status == 1 ? '#98d12c' : 'red' }}></span>
            <h5 className="f-w-600 f-size" >{panel?.project_name}</h5>
          </div>
        </Col>
        <Col md={6} className="mb-2">
          <div className="d-flex justify-content-end align-items-center">
            <span className={panel?.is_published == 1 ? "publish" : 'pending'}  >
              {panel?.is_published == 1 ? 'Published' : 'Pending Changes'}
            </span>
            <span
              style={{ fontWeight: '600', marginLeft: "15px", fontSize: '0.875rem', padding: '4px 20px ', borderRadius: "6px" }}
              className={`mr-3 ${panel.is_basic == 1
                ? " pro "
                : "free"
                }`}
            >
              {panel.is_basic == 1 ? "PRO" : "FREE"}
            </span>
            <Dropdown isOpen={isOpen[index]} toggle={() => toggleDropdown(index, panel)} className="dropdown-toggle">
              <DropdownToggle caret>
                <span className='menuIcon' style={{ padding: "13px 13px ", backgroundColor: "#dff1fa", borderRadius: "6px", color: "#26A3DB" }}>
                  <MoreOutlined style={{ fontSize: "16px", marginTop: '0px !important' }} />
                </span>
              </DropdownToggle>
              <DropdownMenu className="drpdown">
                <DropdownItem className={`d-flex align-items-center mr-3 `} style={{ color: '#f9b74c' }} onClick={() => OnUpgrade(panel)} >{panel.is_basic == 1 ? "Increase pin limit" : "Upgrade to Pro"}<BiCrown className="ml-1" /></DropdownItem>
                <hr></hr>

                <DropdownItem className={`d-flex align-items-center mr-3 `} style={{ color: panel.status === 1 ? "#E13025" : "#98d12c" }} onClick={() => StatusClick(panel)} >{panel.status == 1 ? "Deactivate " : "Activate"}</DropdownItem>
                <>
                  <hr></hr>
                  <DropdownItem onClick={() => EditClick(panel)} className="d-flex align-items-center" >Edit</DropdownItem>
                  <hr></hr>
                  <DropdownItem onClick={() => publishClick(panel)} className="d-flex align-items-center" disabled={(panel?.publish == 0 || panel?.status == 0)} >Publish</DropdownItem>
                  <DropdownItem onClick={() => discardClick(panel?.enc_id)} className="d-flex align-items-center" disabled={panel?.discard == 0} >Discard Changes</DropdownItem>
                  <hr></hr>
                  <DropdownItem onClick={() => getProjectById(panel?.enc_id)} className="d-flex align-items-center" >Rename</DropdownItem>
                  {(role_id != 1 && panel.is_basic != 0) &&
                    <DropdownItem onClick={() => handleDuplicate(panel?.enc_id)} className="d-flex align-items-center" disabled={panel.is_basic == 0} >Duplicate</DropdownItem>
                  }
                  <hr></hr>
                  <DropdownItem className="d-flex align-items-center" onClick={() => setModalLink(true)} disabled={(panel?.status == 0)}>Project Links</DropdownItem>

                  <DropdownItem className="d-flex align-items-center" onClick={() => setModal(true)} disabled={(panel?.status == 0)}>Generate QR Code Beacon Poster</DropdownItem>
                  <hr></hr>
                  <DropdownItem className="d-flex align-items-center" onClick={() => deleteClick(panel)}>Delete</DropdownItem>
                  {(role_id == 1 && panel.is_basic != 0) &&
                    <>
                      <hr></hr>

                      <DropdownItem style={{ color: '#9C27B0' }} className="d-flex align-items-center" onClick={() => handleMoveOrCopy(panel, 1)}>Move To</DropdownItem>
                      <DropdownItem style={{ color: '#9C27B0' }} className="d-flex align-items-center" onClick={() => handleMoveOrCopy(panel, 2)}>Copy To</DropdownItem>
                    </>
                  }
                </>
              </DropdownMenu>
            </Dropdown>
          </div>
        </Col>
      </Row>
      <Row style={{ fontSize: "1rem" }}>
        <Col md={6} style={{ paddingLeft: '33px' }}>
          <div className="mt-2 d-flex">
            <span style={{ cursor: "pointer", display: 'flex' }}>
              <LocationSvgSmall color={panel?.location_color} /> <span className="ml-1"> {panel?.pin_details?.used_loc}/{panel?.pin_details ? (panel?.pin_details?.free_loc) + (panel?.pin_details?.basic_loc) + (panel?.pin_details?.add_loc) : ''}</span>
            </span>
            <span style={{ cursor: "pointer", marginLeft: "30px", display: 'flex' }}>
              <ProductSvgSmall color={panel?.product_color} /> <span className="ml-1"> {panel?.pin_details?.used_prod}/{panel?.pin_details ? (panel?.pin_details?.free_prod) + (panel?.pin_details?.basic_prod) + (panel?.pin_details?.add_prod) : ''}</span>
            </span>
          </div>
        </Col>
        <Col md={6}>
          <span className="float-right " style={{ alignItems: 'center', marginTop: '10px' }}>
            {role_id == 1 &&
              <span className={"customer-email "}  >
                {panel?.email}
              </span>
            }
          </span>
        </Col>
      </Row>
      <Modal className="panel-header-canvas" isOpen={modal} toggle={() => { toggle2(); setBeaconValue({}); setBeaconOptions([]); }} style={{ zIndex: '999999 !important', maxWidth: '850px' }} centered>
        <canvas ref={canvasRef} style={{display:"none"}}/>
        
        <ModalHeader toggle={() => { toggle2(); setBeaconValue({}); setBeaconOptions([]); }} style={{ padding: '33px 32px 0px 32px' }}>
          Generate QR Code Beacon Poster
        </ModalHeader>
        <ModalBody className="modalbody-padding" >
          <Row className='mt-2 mb-3' >
            <Col md={6}>

              <Label className='form-labels'>Select QR Code Beacon</Label>
              <CommonDropdown name='agent' options={beaconOptions} value={Object.keys(beaconValue).length > 0 ? beaconValue : null} onChange={(e) => { onChangeBeacon(e) }} />

            </Col>
          </Row>
          {/* <Row >
            <Col md={12}>
              <div className="mb-2">
                <Label style={{ color: '#6a6d73', fontSize: '0.875rem', fontWeight: 'bold', marginTop: '11.48px' }}>{panel?.project_name}</Label>
              </div>
            </Col>
          </Row> */}
          <Row >
            <Col md={12}>
              <div className="table-responsive">
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
                    {
                      // panel?.beacon_data?.length > 0 ? (
                      // panel?.beacon_data?.map((item, index) => (
                        beaconValue?.beacon_name ? (
                        <tr
                          // key={index}
                        >
                          <td>{beaconValue.beacon_name}</td>
                          <td >
                            <div className='d-flex'>  
                              <button className="btn btn-sm buttoninfo mr-2 mb-1" onClick={() => generateQrcode(beaconValue, 1)}>A4</button>{" "}
                              <button className="btn btn-sm buttoninfo mr-2 mb-1" onClick={() => generateQrcode(beaconValue, 2)}>A3</button>
                            </div>
                          </td>
                          {/* <td>
                            <button className="btn btn-sm buttoninfo mb-1" onClick={() => generateQrcode(beaconValue, 3)}>FHD</button>
                          </td> */}
                          <td>
                            <button className="btn btn-sm buttoninfo mb-1" onClick={() => DownloadQrcodeAsPng(beaconValue)}> Download</button>
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
              </div>
            </Col>
          </Row>
          <Row className="mt-3 mb-3">
            <Col md={12}>
              <Button color="secondary" className="btn btnCancel float-right" onClick={() => { toggle2(); setBeaconValue({}); setBeaconOptions([]); }}>
                Cancel
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
      {loading &&
        <Modal isOpen={true} size="sm" className="loading-modal" style={{ zIndex: '9999999 !important', maxWidth: '200px', backgroundColor: 'transparent', justifyContent: 'center' }} centered>
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

      <MoveOrCopy
        modal={moveOrCopyModal}
        toggle={toggleMoveOrCopy}
        type={moveOrCopy}
        rowDetails={rowDetails}
        // getProjectlist={getProjectlist}
        getProjectlist={getAllList}

      />



    </>
  );

  return (
    <div className="" style={customPanelStyle}>
      <div className="" >
        <div >
          <div>{renderPanelHeader(panel, index)}</div>
        </div>
      </div>
      <PaymentForm
        toggleStripe={toggleStripe}
        stripeModal={stripeModal}
        planDetails={planDetails}
        project_id={panel?.enc_id}
        fromStatus={fromStatus}
        from='project'
        handlePublish={handlePublish}
        statusChange={statusChange}
        fromUpgrade={fromUpgrade}
        // getProjectlist={getProjectlist}
        getProjectlist={getAllList}
        setUpgradeProModal={setUpgradeProModal}
      />
      <ProjectLinksModalComponent
        modal={modalLink}
        toggle={toggleModalLink}
        panel={panel}

      />
      <UpgradeProModal
        isOpen={upgradeProModal}
        toggle={toggleUpgrade}
        planDetails={planDetails}
        projectSettings={panel}
        setStripeModal={setStripeModal}
      />
    </div>
  );
};


const customPanelStyle = {
  background: "#ffff",
  borderRadius: 6,
  marginTop: '18.71px',
  border: 0,
  padding: "15px",
};

const Accordion = ({ projectList, getProjectlist,
  getProjectById, setPage, tempProjectList,
  searchTerm,getAllList,setSearchTerm
}) => {
  // const [searchTerm, setSearchTerm] = useState('');
  const [tempProject, setTempProject] = useState([]);
  const [noData, setNodata] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    setTempProject(projectList);
    if (projectList.length == 0) {
      setNodata(true);
    } else {
      setNodata(false);
    }
    // setAllProjects(projectList.slice(0, 10))
    // setAllProjects(projectList) 
    // setCurrentIndex(20)
    setDisableButton(false)
    setLoadingList(false)
  }, [projectList])

  const loadMore = () => {
    setDisableButton(true)
    let pageCount
    setPage((prev) => {
      pageCount = prev + 1
      return prev + 1;
    })
    getProjectlist(pageCount, searchTerm)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // setPage(1)
    // setSearchTerm(e.target.value);
    // const currentValue = e.target.value;
    // if (currentValue) {
    //   getProjectlist(1, currentValue)
    // } else {
    //   getProjectlist(1)
    //   setNodata(false)
    // }
  };

  useEffect(() => {
    setPage(1);
    setLoadingList(true)
    if (debouncedSearchTerm) {
      getProjectlist(1, debouncedSearchTerm);
    } else {
      getProjectlist(1);
      setNodata(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); 
  
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <div>
      <Row>
        <Col sm={12} md={6} lg={4} xl={2} xxl={2}>
          <div className="d-flex">
            <input
              type="text"
              value={searchTerm}
              className="form-control"
              placeholder="Search..."
              onChange={(e) => handleSearchChange(e)}
            />
            <div
              className="input-group-append"
              style={{ marginLeft: "-36px" }}
            >
              <span
                className="input-group-text"
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  padding: '4px'
                }}
              >
                <FiSearch className="iconStyle" />
              </span>
            </div>
          </div>
        </Col>
      </Row>
      {(!noData) ? (
        <>
          {loadingList ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginTop:"50px"}}>
              <Spinner
                style={{width:"2rem",height:"2rem", color:"rgb(38, 163, 219)"}}
                // color="rgb(38, 163, 219)"
              />  
            </div>
             :  tempProject.map((panel, index) => (
            <>
              <AccordionItem key={panel?.enc_id} panel={panel} getProjectlist={getProjectlist} index={index} getProjectById={getProjectById} getAllList={getAllList}/>
            </>
          ))}
        </>
      )
        :
        (
          <div className="row mt-3">
            <div className="col-sm-12">
              <Card>
                <CardBody>
                  <div className='text-center'>
                    <div className="d-flex align-items-center justify-content-center mb-2 pt-3">
                      <div className="d-flex justify-content-center">
                        <img src={noDataImg} style={{ width: "35%" }}></img>
                      </div>
                    </div>
                    <div className='text-center'>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>No data found!</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )
      }
      <>
      
      {tempProjectList.length >= 15 && !loadingList &&
          <div className="text-center mt-3" >
            <Button className="btn btnCancel w-100"
              style={{height:"40px",fontWeight:"600",display:"flex",alignItems:"center", justifyContent:"center",color:"#26a3db" , backgroundColor:"#dff1fa"}}
              // className=" "
              onClick={loadMore}
              disabled={disableButton}
            >
              {disableButton ?
                <Spinner
                  style={{ width: "1rem", height: "1rem" }}
                  color={"#26a3db"}
                  /> : "Load More"}
            </Button>
          </div>
        }

      </>
    </div>
  );
};

export default Accordion;
