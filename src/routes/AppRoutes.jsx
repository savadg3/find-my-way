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