import React, { Fragment } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import Login from '../pages/auth/Login';
import Reset from '../pages/auth/ResetPassword';
import SetPassword from '../pages/auth/SetPassword';
import TwoFactorCode from '../pages/auth/TwoFactorCode';


import EditMap from '../pages/editMap/EditMap';
import ProjectList from '../pages/project/ProjectList';
import Forgot from '../pages/auth/Forgot';
import Register from '../pages/auth/Register';
import Agent from '../pages/Agent/AgentList';
import Pricing from '../pages/Pricing/Pricing';
import PricingList from '../pages/Pricing/PricingList';
import Billing from '../pages/Billing/Billing';
import AddAgent from '../pages/Agent/AgentAdd';
import AddLocations from '../pages/editMap/AddLocations';
import AddFloor from '../pages/editMap/AddFloor';
import CustomerList from '../pages/customer/customer';
import AddCustomer from '../pages/customer/addCustomer';
import Report from '../pages/report/report';
import Reporting from '../pages/report/Reporting';
import ReportVisitor from '../pages/report/ReportVisitor';
import ReportEngagement from '../pages/report/ReportEngagement';
import AddCreditCard from '../pages/Billing/AddCreditCard';
import Notifications from '../pages/Notification/notification';
import NotificationList from '../pages/Notification/notificationList';
import ProjectSettings from '../pages/editMap/ProjectSettings';
import Settings from '../pages/Settings/settings';
import ViewFloor from '../pages/buildProject/ViewFloorPlan';
import CanvasApp from '../pages/buildProject/newScriptCLone';
import AgentDashboard from '../pages/AgentPortal/AgentPortal';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ReportAdvertisement from '../pages/report/reportAdvertisement';
import Error from './Error'
import Logs from '../pages/customer/log';

import AutoConnectComponent from '../pages/viewFloordummy';


import { ProtectedRoute } from '../helpers/authGuard';
import CanvasEditor from '../pages/Editor/CanvasEditor';
import IdleLayout from './IdleLayout';
import ProjectLayout from '../layouts/ProjectLayout';
import SideBar from '../pages/buildProject/newComponents/sidebar/Sidebar';
import ProjectSettingsSideBar from '../pages/buildProject/newComponents/sidebar/projectSettings/ProjectSettingsSideBar';
import FloorPlan from '../pages/buildProject/newComponents/sidebar/floorplan/Floorplan';
import FloorPlanView from '../pages/buildProject/newComponents/sidebar/floorplan/FloorPlanView';
import LocationSidebar from '../pages/buildProject/newComponents/sidebar/location/Location';
import EditLocation from '../pages/buildProject/newComponents/sidebar/location/EditLocation';
import ProductSideBar from '../pages/buildProject/newComponents/sidebar/product/Product';
import EditProduct from '../pages/buildProject/newComponents/sidebar/product/EditProduct';
import BeaconSideBar from '../pages/buildProject/newComponents/sidebar/beacon/Beacon';
import EditBeacon from '../pages/buildProject/newComponents/sidebar/beacon/EditBeacon';
import AmenitySideBar from '../pages/buildProject/newComponents/sidebar/amenity/Amenity';
import EditAmenity from '../pages/buildProject/newComponents/sidebar/amenity/EditAmenity';
import SafetySideBar from '../pages/buildProject/newComponents/sidebar/safety/Safety';
import EditSafety from '../pages/buildProject/newComponents/sidebar/safety/EditSafety';
import VerticalSideBar from '../pages/buildProject/newComponents/sidebar/verticalTransport/Vertical';
import EditVertical from '../pages/buildProject/newComponents/sidebar/verticalTransport/EditVertical';
import Navigation from '../pages/buildProject/newComponents/sidebar/navigation/Navigation';
import AdvertisingSideBar from '../pages/buildProject/newComponents/sidebar/advertising/Advertising';
import EditAdvertising from '../pages/buildProject/newComponents/sidebar/advertising/EditAdvertising';



const AppRoutes = () => {

    const router = createBrowserRouter(
        createRoutesFromElements(
            <Fragment>
                <Route path="/" element={<Login />} />
                <Route element={<IdleLayout />}>
                    <Route path="/canvas-editor/:id" element={<CanvasEditor />} />

                    <Route path="forgot-password" element={<Forgot />} />
                    <Route path="reset-password/:token" element={<Reset />} />
                    <Route path="set-password/:token" element={<SetPassword />} />
                    <Route path="two-step-verification/:userId" element={<TwoFactorCode />} />


                    <Route path="register" element={<Register />} />
                    
                    {/* <Route path="/project/:id">
                        <Route index element={<ProjectLayout />} />
                        <Route path=":tab" element={<ProjectLayout />} >
                            <Route path=":subid"/>
                        </Route>
                    </Route> */}
                    <Route path="/project/:id" element={<ProjectLayout />}>
                        <Route index element={<SideBar />} />
                        <Route path="settings" element={<ProjectSettingsSideBar />} /> 
                        <Route path="floor-plan" element={<FloorPlan />} />
                        <Route path="floor-plan/:subid" element={<FloorPlanView />} />
                        <Route path="location" element={<LocationSidebar />} />
                        <Route path="location/:subid" element={<EditLocation />} />
                        <Route path="product" element={<ProductSideBar />} />
                        <Route path="product/:subid" element={<EditProduct />} />
                        <Route path="beacon" element={<BeaconSideBar />} />
                        <Route path="beacon/:subid" element={<EditBeacon />} />
                        <Route path="amenity" element={<AmenitySideBar />} />
                        <Route path="amenity/:subid" element={<EditAmenity />} />
                        <Route path="safety" element={<SafetySideBar />} />
                        <Route path="safety/:subid" element={<EditSafety />} />
                        <Route path="vertical-transport" element={<VerticalSideBar />} />
                        <Route path="vertical-transport/:subid" element={<EditVertical />} />
                        <Route path="navigation" element={<Navigation />} />
                        <Route path="advertisements" element={<AdvertisingSideBar />} />
                        <Route path="advertisements/:subid" element={<EditAdvertising />} />
                    </Route>

                    <Route
                        path="/"
                        element={<MainLayout />}
                        
                    >
                        <Route path="view-floor-test" element={<AutoConnectComponent />} />,

                        <Route path="dashboard" element={<Dashboard />} />,
                        <Route path="agent-portal/:roleId/:commonId" element={<AgentDashboard />} />,
                        <Route path="admin" element={<AdminDashboard />} />,
                        <Route path="project-list" element={<ProjectList />} />,
                        <Route path="view-floor/:id" element={<ViewFloor />} />,
                        <Route path="agent-list" element={<Agent />} />,
                        <Route path="agent-add/:id" element={<AddAgent />} />,
                        <Route path="pricing" element={<PricingList />} />,
                        <Route path="add-package/:id" element={<Pricing />} />,
                        <Route path="billing/:id" element={<Billing />} />,
                        <Route path="customer-list" element={<CustomerList />} />,
                        <Route path="customer/:id" element={<AddCustomer />} />,
                        <Route path="report" element={<Report />} />,
                        <Route path="reporting" element={<Reporting />} />,
                        <Route path="report-visitor" element={<ReportVisitor />} />,
                        <Route path="report-engagement" element={<ReportEngagement />} />,
                        <Route path="report-advertisement" element={<ReportAdvertisement />} />,

                        <Route path="add-credit-card" element={<AddCreditCard />} />,
                        <Route path="add-notification/:id" element={<Notifications />} />,
                        <Route path="notification" element={<NotificationList />} />,
                        <Route path="settings" element={<Settings />} />,
                        <Route path="new-script" element={<CanvasApp />} />,
                        <Route
                            path="edit-map"
                            element={<EditMap />}
                            children={[
                                <Route path="" element={<ProjectSettings />} />,
                                <Route path="add-floor" element={<AddFloor />} />,
                                <Route path="add-locations" element={<AddLocations />} />,
                            ]}
                        />,
                        <Route path="log/:id" element={<Logs />} />,

                        <Route
                            path="/"
                            element={<ProtectedRoute component={Login} />}
                        />,
                    </Route>

                    <Route path="*" element={<Error/>} />


                    {/* <Route element={<AuthLayout />}>
                        <Route
                            path="login"
                            element={<Login />} 
                            loader={redirectIfUser}
                        />
                        <Route path="logout" action={logoutUser} />
                    </Route> */}
                    {/* <Route path="/login" element={<Navigate replace to="/login" />} /> */}
                </Route>
            </Fragment >
        )
    );
    return (
        <RouterProvider router={router} />
    )
}

export default AppRoutes