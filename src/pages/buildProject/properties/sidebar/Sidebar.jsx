import React from 'react'; 
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom'; 
import { useSelector } from 'react-redux';
import './sidebar.css' 

const NAV_ITEMS = [
  { type: 'settings',          typeId: 1,  label: 'Project Settings',    route: 'settings' },
  { type: 'floorDetails',      typeId: 2,  label: 'Floor Plans',         route: 'floor-plan' },
  { type: 'locations',         typeId: 3,  label: 'Location Pins',       route: 'location' },
  { type: 'products',          typeId: 4,  label: 'Product Pins',        route: 'product' },
  { type: 'beacons',           typeId: 5,  label: 'QR Code Beacons',     route: 'beacon' },
  { type: 'amenitys',          typeId: 6,  label: 'Amenity Pins',        route: 'amenity' },
  { type: 'safety',            typeId: 7,  label: 'Safety Pins',         route: 'safety' },
  { type: 'verticalTransport', typeId: 8,  label: 'Vertical Transports', route: 'vertical-transport' },
  { type: 'traversable',       typeId: 2,  label: 'Navigation Path',     route: 'navigation' },
  { type: 'advertisements',    typeId: 9,  label: 'Advertising Banners', route: 'advertisements' },
]; 

const confirmNavigation = (onConfirm) => {
  swal({
    title: 'Are you sure?',
    text: 'Do you want to navigate?',
    icon: 'warning',
    buttons: {
      cancel: { text: 'No',  value: false, visible: true, className: 'btn-danger',  closeModal: true },
      confirm: { text: 'Yes', value: true,  visible: true, className: 'btn-success', closeModal: true },
    },
  }).then((confirmed) => {
    if (confirmed) onConfirm();
  });
}; 

const NavItem = ({ label, isActive, onClick }) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    aria-label={label}
    title={label}
    onClick={onClick}
    className={`sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`}
  > 
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
    <span>Help</span>
  </a>
); 

const SideBar = ({ onIconClick, hasPendingChanges = false }) => {
  const activeTab = useSelector((state) => state.api.activeTab);
  const navigate = useNavigate()

  const handleNavClick = (route) => {
    if (hasPendingChanges) {
      confirmNavigation(() => onIconClick(type));
    } else {
      onIconClick(type);
      navigate(route)
    }
  };

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
        {NAV_ITEMS.map(({ type, label, route }) => {
          const isActive = activeTab === type;
          return (
            <NavItem
              key={type}
              label={label}
              isActive={isActive}
              onClick={() => navigate(route)}
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