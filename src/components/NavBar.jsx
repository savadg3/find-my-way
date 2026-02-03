import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    UncontrolledDropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu,
} from 'reactstrap';
import { postRequest, getRequest } from '../hooks/axiosClient';
import LogoIco from '../assets/icons/Logo.svg';
import { AppContext } from '../providers/ContextProvider';
import { getCurrentUser, encode } from "../helpers/utils";
import { environmentaldatas } from '../constant/defaultValues';
import Default from '../assets/img/default_user.svg';
import swal from 'sweetalert';
import { FaBars } from "react-icons/fa";
import { Row, Col } from 'reactstrap';

const { image_url } = environmentaldatas;

const NavBar = () => {
    const { setUser } = useContext(AppContext);
    const navigate = useNavigate();
    const path = useLocation().pathname;
    const [menuVisible, setMenuVisible] = useState(false);
    const id = getCurrentUser()?.user?.id;
    const role = getCurrentUser()?.user?.role_id;
    const user = getCurrentUser()
    const [details, setUserDetails] = useState([]);
    const [image, setImage] = useState(null);


    const LinkBtn = ({ label, to, icon }) => {
        const selected = '/' + path.split('/')[1] === (role === 3 ? ('/' + to.split('/')[1]) : to);
        return (
            <Link
                to={to}
                onClick={toggleMenu}
                className={`f-16  ${selected ? '' : 'text-black '} `}
            >
                <p className={`${selected ? 'active-navitem' : 'noactive-navitem'}`} style={{ width: role === 3 ? '120px' : (to == '/admin') ? '157px' : (to == '/customer-list' || to == '/notification') ? '125px' : '100px' }}>{label}</p>
            </Link>
        );
    };

    const signUpHandler = () => {
        localStorage.removeItem('current_user');
        localStorage.removeItem('keepLoggedIn');
        setUser();
        navigate('/');
    };

    const LogoutApi = async () => {
        try {
            const response = await postRequest('logout');
            signUpHandler()
        } catch (error) {
            console.log(error);
        }
    };

    const getUser = async () => {
        try {
            const response = await getRequest(`settings/${id}`);
            const userData = response.data.data ?? [];
            setUserDetails(userData);
        } catch (error) {
            console.log(error);
        }
    }
    const getImage = async () => {
        try {
            const response = await getRequest(`settings/${id}/image`);
            const resUrl = response.data.data.image_path;
            const url = resUrl ? (image_url + resUrl) : Default
            setImage(url)
        } catch (error) {
            console.log(error);
        }

    }



    useEffect(() => {
        getUser();
        getImage();
    }, []);


    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const onNavigateToPath = (paths) => {
        navigate(`/${paths}`);
    }

    const navigateToHome = () => {
        if (role == 1) {
            navigate(`/admin`)
        } else if (role == 2) {
            navigate(`/dashboard`)
        } else {
            navigate(`/agent-portal/${encode(user?.user?.role_id)}/${encode(user?.user?.common_id)}`)
        }
    }

    const logoutClick = (row) => {
        swal({
            title: "Are you leaving?",
            className: "swal-text-style",
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
                        LogoutApi()
                        break;
                    default:
                        break;
                }
            });
    }


    return (
        <>
            <div className='header-div'>
                <Row className='row align-items-center'>
                    <Col xs={6} sm={6} md={9} lg={9} xl={9} className=' d-flex' id='menu' >
                        <img src={LogoIco} className='img-fluid herder-logo' onClick={() => navigateToHome()} />
                        {role == 2 &&
                            <div className='menu-toggle '>
                                <UncontrolledDropdown className="dropdown-menu-right">
                                    <DropdownToggle className="p-0 navtoggle" color="empty" style={{ border: 'none !important' }} >
                                        <FaBars />
                                    </DropdownToggle>
                                    <DropdownMenu className="mt-1 drpdown" style={{ width: '129px !important', }} right>
                                        <DropdownItem className='drop-down' style={{ fontSize: '12px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }} onClick={() => { onNavigateToPath('dashboard') }} >
                                            <Link
                                                to='/dashboard'
                                                style={{ fontSize: '0.875rem', position: 'relative', width: '100%', marginRight: '0px !important', color: '#6a6d73' }}
                                                className={`a  ${path == '/dashboard' ? 'text-primary1' : ' nav-item-style2'} `}
                                            ><div className='d-flex align-items-center'>
                                                    Dashboard
                                                </div>
                                            </Link>
                                        </DropdownItem>
                                        <hr></hr>
                                        {role != 3 &&
                                            <DropdownItem className='drop-down' style={{ fontSize: '12px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }} onClick={() => { onNavigateToPath('project-list') }}>
                                                <Link
                                                    to='/project-list'
                                                    style={{ fontSize: '0.875rem', position: 'relative', width: '100%', marginRight: '0px !important', color: '#6a6d73' }}
                                                    className={`a ${path == '/project-list' ? 'text-primary1' : ' nav-item-style2'} `}
                                                ><div className='d-flex align-items-center'>
                                                        Projects
                                                    </div>
                                                </Link>
                                            </DropdownItem>
                                        }
                                        <hr></hr>
                                        <DropdownItem className='drop-down' style={{ fontSize: '12px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }} onClick={() => { onNavigateToPath('reporting') }}>
                                            <Link
                                                to='/reporting'
                                                style={{ fontSize: '0.875rem', position: 'relative', width: '100%', marginRight: '0px !important', color: '#6a6d73' }}
                                                className={`a ${path == '/reporting' ? 'text-primary1' : ' nav-item-style2'} `}
                                            ><div className='d-flex align-items-center'>
                                                    Reporting
                                                </div>
                                            </Link>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </div>
                        }
                        <div className={`${role == 2 ? 'menu-items' : 'menu-items2'} `} style={{ marginLeft: '80.22px' }}>
                            {role == 3 &&
                                <LinkBtn label='Agent Portal' to={`/agent-portal/${encode(user?.user?.role_id)}/${encode(user?.user?.common_id)}`} />
                            }
                            {role == 2 &&
                                <LinkBtn label='Dashboard' to='/dashboard' />
                            }
                            {role == 1 &&
                                <LinkBtn label='Admin Dashboard' to='/admin' />
                            }
                            {role != 3 &&
                                <>
                                    <LinkBtn label='Projects' to='/project-list' />
                                    <LinkBtn label='Reporting' to='/reporting' />
                                </>
                            }
                            {role == 1 &&
                                <>
                                    <LinkBtn label='Notifications' to='/notification' />
                                    <LinkBtn label='Customers' to='/customer-list' />
                                    <LinkBtn label='Agents' to='/agent-list' />
                                    <LinkBtn label='Pricing' to='/pricing' />
                                </>
                            }
                        </div>
                    </Col>
                    <Col xs={6} sm={6} md={3} lg={3} xl={3} className=' text-right '>
                        <UncontrolledDropdown className="dropdown-menu-right">
                            <DropdownToggle className="p-0 navtoggle" color="empty" style={{ border: 'none !important' }} >
                                <div className='d-flex justify-content-end align-items-center'>
                                    <div style={{ marginRight: '15.9px' }}>
                                        <div style={{ height: '23px' }}>
                                            <p class="ml-2  " style={{ fontSize: '1rem', color: '#1D1D1B' }}>{details?.first_name} {details?.last_name}</p>
                                        </div>
                                        <p class="ml-2  float-right" style={{ fontSize: '0.875rem', color: '#6a727d' }}>{role == 1 ? 'Admin' : role == 2 ? '' : 'Agent'}</p>
                                    </div>
                                    <div className='float-right user-div' >
                                        <img src={(image ?? Default)} alt='Uploaded Preview' className="preview-image" />
                                    </div>
                                </div>
                            </DropdownToggle>
                            <DropdownMenu className="mt-1 drpdown" style={{ width: '129px !important', }} right>
                                <DropdownItem className='drop-down' style={{ fontSize: '12px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }} onClick={() => { onNavigateToPath('settings') }} >
                                    <Link
                                        to='/settings'
                                        style={{ fontSize: '0.875rem', position: 'relative', width: '100%', marginRight: '0px !important', color: '#6a6d73' }}
                                        onClick={toggleMenu}
                                        className={`a  ${path == '/settings' ? 'text-primary1' : ' nav-item-style2'} `}
                                    ><div className='d-flex align-items-center'>
                                            Edit Profile
                                        </div>
                                    </Link>
                                </DropdownItem>
                                <hr></hr>
                                {role != 3 &&
                                    <DropdownItem className='drop-down' style={{ fontSize: '12px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }} onClick={() => { onNavigateToPath('billing/0') }}>
                                        <Link
                                            to='/billing/0'
                                            style={{ fontSize: '0.875rem', position: 'relative', width: '100%', marginRight: '0px !important', color: '#6a6d73' }}
                                            onClick={toggleMenu}
                                            className={`a ${path == '/billing/0' ? 'text-primary1' : ' nav-item-style2'} `}
                                        ><div className='d-flex align-items-center'>
                                                Billing
                                            </div>
                                        </Link>
                                    </DropdownItem>
                                }
                                <hr></hr>
                                <DropdownItem onClick={() => logoutClick()} style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', color: '#E13025 ', paddingLeft: '8px' }} >
                                    <span className='nav-item-style2'>
                                        Log Out
                                    </span>
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default NavBar;
