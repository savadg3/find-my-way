import React from 'react'
import Lottie from 'lottie-react';
import Loading from '../../../../assets/icons/fmw.json';

function Overlay({projectSettings}) {
    const ItemStyle = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: projectSettings?.background_color ?? '#F6F7F3',
        zIndex: 99,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
    } 
    const paragraph = {}

    return ( 
        <div style={ItemStyle}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}>
                <Lottie speed={2} className='lottie-svg' animationData={Loading} loop={true} />
                <div class="loading">
                    <span>L</span>
                    <span>o</span>
                    <span>a</span>
                    <span>d</span>
                    <span>i</span>
                    <span>n</span>
                    <span>g</span>
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </div>
            </div>
        </div>
    )
}

export default Overlay