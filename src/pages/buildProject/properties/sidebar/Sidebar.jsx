import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoMdSettings } from "react-icons/io";
import { LocationSvg, ProductSvg, AmminitySvg, SafetySvg, BeaconSvg, VerticalTransportSvg, TraversableSvg, LayersSvg, AdvertisementSvg } from '../../CustomSvg'
import './sidebar.css'
import { BsQuestionCircleFill } from 'react-icons/bs';

const NAV_ITEMS = [
  { type: 'settings',          typeId: 1,  label: 'Project Settings',    route: 'settings', icon : <IoMdSettings fontSize={15} /> },
  { type: 'floorDetails',      typeId: 2,  label: 'Floor Plans',         route: 'floor-plan', icon : <LayersSvg fontSize={20} /> },
  { type: 'locations',         typeId: 3,  label: 'Location Pins',       route: 'location', icon : <LocationSvg fontSize={20} /> },
  { type: 'products',          typeId: 4,  label: 'Product Pins',        route: 'product', icon : <ProductSvg fontSize={20} /> },
  { type: 'beacons',           typeId: 5,  label: 'QR Code Beacons',     route: 'beacon', icon : <BeaconSvg fontSize={20} /> },
  { type: 'amenitys',          typeId: 6,  label: 'Amenity Pins',        route: 'amenity', icon : <AmminitySvg fontSize={20} /> },
  { type: 'safety',            typeId: 7,  label: 'Safety Pins',         route: 'safety', icon : <SafetySvg fontSize={20} /> },
  { type: 'verticalTransport', typeId: 8,  label: 'Vertical Transports', route: 'vertical-transport', icon : <VerticalTransportSvg fontSize={20} /> },
  { type: 'traversable',       typeId: 2,  label: 'Navigation Path',     route: 'navigation', icon : <TraversableSvg fontSize={20} /> },
  { type: 'advertisements',    typeId: 9,  label: 'Advertising Banners', route: 'advertisements', icon : <AdvertisementSvg fontSize={20} /> },
];
 
const ALWAYS_ENABLED = new Set(['settings']);

const NavItem = ({ label, isActive, onClick, disabled, icon }) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    aria-label={label}
    title={disabled ? 'Set a project location first' : label}
    onClick={onClick}
    disabled={disabled}
    className={[
      'sidebar-nav-item',
      isActive ? 'sidebar-nav-item--active'   : '',
      disabled ? 'sidebar-nav-item--disabled' : '',
    ].filter(Boolean).join(' ')}
  >
    {icon && (
      <span className="sidebar-nav-item__icon">
        {icon}
      </span>
    )}
    <span className="sidebar-nav-item__label">{label}</span>
  </button>
);

const HelpLink = ({ href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Open help and tutorials (opens in new tab)"
    className="sidebar-help-link"
  >
    <span className="sidebar-nav-item__icon">
      <BsQuestionCircleFill fontSize={15}/>
    </span>
    <span>Help</span>
  </a>
);

const SideBar = ({ onIconClick, hasPendingChanges = false }) => {
  const activeTab   = useSelector((state) => state.api.activeTab);
  const projectData = useSelector((state) => state.api.projectData);
  const navigate    = useNavigate();
 
  const hasLocation = !!projectData?.positions;
 

  return (
    <aside
      className="bp-sidebar"
      aria-label="Map editor navigation"
    >
      <nav
        role="tablist"
        aria-orientation="vertical"
        aria-label="Editor sections"
        className="bp-sidebar__nav"
      >
        {NAV_ITEMS.map(({ type, label, route, icon }) => {
          const isActive = activeTab === type;
          const disabled = !hasLocation && !ALWAYS_ENABLED.has(type);
          return (
            <NavItem
              key={type}
              icon={icon}
              label={label}
              isActive={isActive}
              disabled={disabled}
              onClick={() => !disabled && navigate(route)}
            />
          );
        })}
      </nav>

      <div className="bp-sidebar__footer">
        <HelpLink href="https://fmw.app/tutorials/" />
      </div>
    </aside>
  );
};

export default SideBar;
