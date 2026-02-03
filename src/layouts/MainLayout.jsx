import React, { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { AppContext } from '../providers/ContextProvider'

const MainLayout = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { setUser } = useContext(AppContext)
    const [hideNav, setHideNav] = useState(0)
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight)
    const [showNav, SetShowNav] = useState(true)



    const isLoggedIn = async () => {
        const userData = localStorage.getItem('current_user')
        if (userData) {
            setUser(userData)
        } else {
            navigate('/')
        }
    }

    useEffect(() => {
        isLoggedIn();
        window.scrollTo(0, 0)
    })

    useEffect(() => {
        /* to remove the padding in floorplan page for full screen */
        const mainDiv = document.querySelector('.main-div');
        const pageDiv = document.querySelector('.pageDiv');
        const bar = document.querySelector('.customScroll');


        const ViewFloor = location.pathname.split('/');
        if (ViewFloor[1] == 'view-floor') {
            SetShowNav(false)
        } else {
            SetShowNav(true)

        }
        if (mainDiv) {
            if (ViewFloor[1] == 'view-floor') {
                mainDiv.classList.add('body-style');
            } else {
                mainDiv.classList.remove('body-style');
            }
        }
        if (pageDiv) {
            if (ViewFloor[1] == 'view-floor') {
                pageDiv.classList.add('scrolling');
            } else {
                pageDiv.classList.remove('scrolling');
            }
        }
        if (bar) {
            bar.classList.add('scrolling');

        }
        // if (location.pathname === '/add-credit-card') {
        //     setHideNav(1)
        // } else {
        //     setHideNav(0)
        // }
    }, [location]);

    const handleResize = () => {
        const { clientHeight } = window.document.getElementById('pageDiv')
        setMapDivSize({ clientHeight });

    }
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize()
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])



    return (
        <div className='h-[100vh] w-[100hw] pageDiv' id='pageDiv' style={{ width: '100%', height: mapDivSize, position: 'absolute' }} >
            {/* {hideNav === 0 ? <NavBar /> : null} */}
            {showNav &&
                < NavBar />
            }
            <div className='main-div' >
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayout