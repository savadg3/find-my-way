import React, { useState } from "react";
// import {  } from '@ant-design/icons';
import { IoMdSettings } from "react-icons/io";
import {AiOutlineSafety } from "react-icons/ai";
import { BiLayer, BiCircle } from "react-icons/bi";
import { GiCube } from "react-icons/gi";
import { PiTextT,PiElevator } from "react-icons/pi";
import { LocationSvg, ProductSvg, AmminitySvg } from "./CustomSvg";

const ViewFloor = () => {

  const [activeTab, setActiveTab] = useState("");
  const [setting, setSetting] = useState(false);
  const [floorplan, setFloorplan] = useState(false);
  const [mapbuilder, setMapbuilder] = useState(false);
  const [location, setLocation] = useState(false);
  const [product, setProduct] = useState(false);
  const [pin, setPin] = useState(false);
  const [verticalTransport, setVerticalTransport] = useState(false);
  const [safetyPin, setSafetyPin] = useState(false);
  const [traversable, setTraversable] = useState(false);
  const [text, setText] = useState(false);



  const settings = () => {
    if (setting) {
      setSetting(false);
      setActiveTab("")
    } else {
      setSetting(true);
      setActiveTab("settings")
      setFloorplan(false);
      setMapbuilder(false);
      setLocation(false);
      setProduct(false);
      setPin(false);
      setText(false);
      setTraversable(false);
      setSafetyPin(false);
      setVerticalTransport(false);


    }
  };
  const floorPlan = () => {
    if (floorplan) {
      setFloorplan(false);
      setActiveTab("")
    } else {
      setFloorplan(true);
      setActiveTab("floorDetails")
      setSetting(false);
      setLocation(false);
      setProduct(false);
      setMapbuilder(false);
      setPin(false);
      setText(false);
      setTraversable(false);
      setSafetyPin(false);
      setVerticalTransport(false);

    }
    
  };
  const mapBuilder = () => {
    if (mapbuilder) {
      setMapbuilder(false);
      setActiveTab("")
    } else {
      setMapbuilder(true);
      setActiveTab("mapBuilder")
      setSetting(false);
      setFloorplan(false);
      setLocation(false);
      setProduct(false);
      setPin(false);
      setText(false);
      setTraversable(false);
      setSafetyPin(false);
      setVerticalTransport(false);

    }
  };
  const handleLocation = () => {
    if (location) {
      setLocation(false);
      setActiveTab("")
    } else {
      setLocation(true);
      setActiveTab("location")
      setSetting(false);
      setFloorplan(false);
      setMapbuilder(false);
      setProduct(false);
      setPin(false);
      setText(false);
      setTraversable(false);
      setSafetyPin(false);
      setVerticalTransport(false);

    }
  };
   const handleProduct = () => {
    if (product) {
      setProduct(false);
      setActiveTab("")
    } else {
      setProduct(true);
      setActiveTab("product")
      setSetting(false);
      setFloorplan(false);
      setMapbuilder(false);
      setLocation(false);
      setPin(false);
      setText(false);
      setTraversable(false);
      setSafetyPin(false);
      setVerticalTransport(false);

    }
  }; 
  const handlePin = () => {
    if (pin) {
      setPin(false);
      setActiveTab("")
    } else {
      setPin(true);
      setActiveTab("pin")
      setSetting(false);
      setFloorplan(false);
      setMapbuilder(false);
      setLocation(false);
      setProduct(false);
      setText(false);
      setTraversable(false);
      setSafetyPin(false);
      setVerticalTransport(false);

    }
  }; 
  const handleVerticalTransport = () => {
    if (verticalTransport) {
      setVerticalTransport(false);
      setActiveTab("")
    } else {
      setVerticalTransport(true);
      setActiveTab("verticalTransport")
      setSetting(false);
      setFloorplan(false);
      setMapbuilder(false);
      setLocation(false);
      setProduct(false);
      setPin(false);
      setText(false);
      setTraversable(false);
      setSafetyPin(false);

    }
  }; 
  const handleSafetyPin = () => {
    if (safetyPin) {
      setSafetyPin(false);
      setActiveTab("")
    } else {
      setSafetyPin(true);
      setActiveTab("safetyPin")
      setSetting(false);
      setFloorplan(false);
      setMapbuilder(false);
      setLocation(false);
      setProduct(false);
      setPin(false);
      setText(false);
      setTraversable(false);
      setVerticalTransport(false);

    }
  };
   const handleTraversable = () => {
    if (traversable) {
      setTraversable(false);
      setActiveTab("")
    } else {
      setTraversable(true);
      setActiveTab("traversable")
      setSetting(false);
      setFloorplan(false);
      setMapbuilder(false);
      setLocation(false);
      setProduct(false);
      setPin(false);
      setText(false);
      setVerticalTransport(false);
      setSafetyPin(false);

    }
  };
   const handleText = () => {
    if (text) {
      setText(false);
      setActiveTab("")
    } else {
      setText(true);
      setActiveTab("text")
      setSetting(false);
      setFloorplan(false);
      setMapbuilder(false);
      setLocation(false);
      setProduct(false);
      setPin(false);
      setTraversable(false);
      setVerticalTransport(false);
      setSafetyPin(false);

    }
  };

  return (
    <>
    
      {setting && (
        <div className="customizer-contain open" id="inner-customizer">
          <div className="header">
            <h5>Project Settings</h5>
          </div>
        </div>
      )}
      {floorplan && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Floor Plan Details</h5>
          </div>
        </div>
      )}
      {mapbuilder && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Map Builder Details</h5>
          </div>
        </div>
      )}
      {location && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Location Pin Details</h5>
          </div>
        </div>
      )}
      {product && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Product Details</h5>
          </div>
        </div>
      )}
      {pin && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Amenities pin Details</h5>
          </div>
        </div>
      )}
      {verticalTransport && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Vertical Transport Pin Details</h5>
          </div>
        </div>
      )}
      {safetyPin && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Safety Pin Details</h5>
          </div>
        </div>
      )}
      {traversable && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Traversable Path Details</h5>
          </div>
        </div>
      )}
      {text && (
        <div className="customizer-contain open1" id="inner-customizer2">
          <div className="header">
            <h5>Text Details</h5>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewFloor;
