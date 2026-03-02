import React, { useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom' 
import { AppContext } from '../providers/ContextProvider'
import { ProjectHeaderProvider } from '../pages/buildProject/Helpers/pageDiv/ProjectHeaderContext' 
import ProjectHeaderDiv from '../pages/buildProject/Helpers/pageDiv/headerDiv'
import './layout.css' 
import NewComponent from '../pages/buildProject/NewComponent'

const ProjectLayout = () => {

    const navigate = useNavigate(); 

    const { setUser } = useContext(AppContext) 

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


    return (
        <ProjectHeaderProvider>
            <ProjectHeaderDiv />
            <div className='pageDiv' id='pageDiv' > 
                    <Outlet /> 
                <div style={{width:"100%"}}> 
                    <NewComponent/>
                </div>
            </div>
        </ProjectHeaderProvider>
    )
}

export default ProjectLayout