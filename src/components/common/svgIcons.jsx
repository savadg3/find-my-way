const PencilSvg = ({ fill }) => {
    return (
        <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="none">
            <g>
                <title>Draw</title>
                <path id="svg_1" fill={fill} d="m17.4558,0.5584l-14.56846,14.5684l-2.108,5.8628c-0.0108,0.0425 0.0238,0.077 0.0663,0.0663l5.8628,-2.108l14.56846,-14.5684l-0.5515,-1.1618l-0.9931,-1.1147l-1.045,-0.9984l-1.2315,-0.5462z" />
                <path id="svg_2" fill="white" d="m3.98663,17.8479c-0.8784,-0.8784 -1.2616,-2.0862 -1.241,-2.5801l-1.9657,5.7471c-0.0101,0.029 0.0107,0.0498 0.0397,0.0397l5.7471,-1.9657c-0.494,0.021 -1.7015,-0.3624 -2.5801,-1.241z" />
                <path id="svg_3" fill={fill} d="m1.90902,19.9253c-0.2229,-0.2229 -0.4968,-0.7132 -0.4691,-0.861l-0.6552,1.9752c-0.0043,0.0091 0.001,0.0143 0.0101,0.0101l1.9752,-0.6552c-0.1478,0.0278 -0.6381,-0.2462 -0.861,-0.4691z" />
                <path id="svg_4" stroke-miterlimit="10" stroke-width="0.5048" stroke="white" d="m18.8112,6.8448c-0.2021,0.2021 -1.2213,-0.4895 -2.2764,-1.5446c-1.0551,-1.0551 -1.7467,-2.0743 -1.5446,-2.2764" />
                <path id="svg_5" stroke-miterlimit="10" stroke-width="0.5048" stroke={fill} d="m19.7306,2.103c-1.0552,-1.0553 -2.0743,-1.7464 -2.2763,-1.5444l-14.7095,14.7092l-1.9677,5.7227c-0.0099,0.0413 0.0246,0.0759 0.0663,0.066l5.7224,-1.9675l14.7095,-14.7092c0.2021,-0.2025 -0.4895,-1.2215 -1.5447,-2.2768z" />
            </g>
        </svg>
    )
}

export { PencilSvg };

const FillSvg = ({ fill }) => {
    return (
        <svg width="21" height="22" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Paint</title>
                <path id="svg_1" fill="white" d="m17.7513,8.74196l-6.809,-6.80895c-0.3802,-0.38021 -0.99662,-0.38021 -1.37683,0.00001l-8.87348,8.87348c-0.38022,0.3802 -0.38022,0.9967 -0.00001,1.3769l6.80895,6.8089c0.38021,0.3802 0.99666,0.3802 1.37688,0l8.87349,-8.8735c0.3802,-0.38018 0.3802,-0.99663 0,-1.37684z" />
                <path id="svg_2" fill={fill} d="m12.2693,3.25975l-1.8318,-1.83176l-10.25036,10.25041l1.83176,1.8317l10.2504,-10.25035z" />
                <path id="svg_3" fill={fill} d="m14.1015,5.09162l-0.916,-0.91592l-10.25031,10.2504l0.91592,0.9159l10.25039,-10.25038z" />
                <path id="svg_4" stroke-miterlimit="10" stroke-width="0.5964" stroke={fill} d="m17.9817,8.55031l-6.8479,-6.84784c-0.3694,-0.36947 -0.9685,-0.36947 -1.33795,0l-9.12345,9.12343c-0.36947,0.3695 -0.36947,0.9685 0,1.338l6.84784,6.8478c0.36947,0.3695 0.96851,0.3695 1.33798,0l9.12348,-9.12341c0.3694,-0.36947 0.3694,-0.96851 0,-1.33798z" />
                <path id="svg_5" stroke-linecap="round" stroke-miterlimit="10" stroke-width="0.5962" stroke={fill} d="m5.3418,0.7398l4.8272,4.8273" />
                <path id="svg_6" stroke-miterlimit="10" stroke-width="0.414" stroke={fill} fill={fill} d="m18.6525,14.2583c-0.2895,-0.4295 -0.1838,1.4363 -1.334,3.128c-0.3609,0.5308 -0.5457,0.8923 -0.6095,1.3225c-0.1265,0.8529 0.4322,1.8832 1.5295,2.0815c0.8543,0.1544 1.4292,-0.0426 1.9115,-0.5236c0.7947,-0.7927 0.6154,-2.2276 0.2505,-3.0184c-0.5151,-1.1165 -1.3741,-2.4351 -1.748,-2.99z" />
            </g>
        </svg>
    )
}

export { FillSvg };

const TextSvg = ({ fill }) => {
    return (
        <svg width="20" height="19" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Text</title>
                <path id="svg_1" fill={fill} d="m12.4228,12.8503l-6.70776,0l-1.175,2.7342c-0.2903,0.6735 -0.43489,1.176 -0.43489,1.5075c0,0.265 0.12559,0.4972 0.37689,0.6968c0.2513,0.2006 0.79491,0.3304 1.62891,0.3895l0,0.4729l-5.4547,0l0,-0.4729c0.7231,-0.1277 1.19189,-0.2935 1.40509,-0.4983c0.4339,-0.4086 0.9153,-1.2394 1.4442,-2.4914l6.0945,-14.2581l0.44656,0l6.0313,14.4112c0.4846,1.1591 0.9257,1.9108 1.3216,2.256c0.3959,0.3442 0.948,0.5384 1.6543,0.5806l0,0.4729l-6.8345,0l0,-0.4729c0.6894,-0.0338 1.156,-0.1489 1.3988,-0.3452c0.2428,-0.1953 0.3642,-0.4339 0.3642,-0.7147c0,-0.3748 -0.171,-0.967 -0.511,-1.7767l-1.0485,-2.4914zm-0.3579,-0.9448l-2.93796,-7.0013l-3.0161,7.0013l5.95406,0z" />
            </g>
        </svg>
    )
}

export { TextSvg };

const EraseSvg = ({ fill }) => {
    return (
        <svg width="21" height="20" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Erase</title>
                <path id="svg_1" stroke-miterlimit="10" stroke-width="0.4823" stroke={fill} d="m15.9433,18.8672l-8.97846,0" />
                <path id="svg_2" stroke-miterlimit="10" stroke-width="0.5056" stroke={fill} fill="white" d="m8.99868,18.8672l10.22732,-10.2273c0.4831,-0.4832 0.4831,-1.2665 0,-1.7494l-5.8135,-5.8135c-0.4831,-0.4832 -1.2664,-0.4832 -1.7495,0l-10.36903,10.369c-0.4831,0.483 -0.4831,1.2662 0,1.7494l5.6717,5.6717l2.03301,0.0001z" />
                <path id="svg_3" stroke-miterlimit="10" stroke-width="0.4823" stroke={fill} fill={fill} d="m13.4118,1.0769l5.8136,5.81355c0.4828,0.48281 0.4828,1.26672 0,1.74953l-8.3328,8.33272l-7.56301,-7.56297l8.33271,-8.33276c0.4829,-0.48281 1.2667,-0.48288 1.7495,-0.00007z" />
            </g>
        </svg>
    )
}
export { EraseSvg };

const SelectSvg = ({ fill }) => {
    return (
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Select</title>
                <path id="svg_1" stroke-miterlimit="10" stroke-width="0.3977" stroke={fill} fill={fill} d="m15.4117,5.9682l-14.35938,-5.572c-0.4906,-0.1904 -0.97361,0.2927 -0.78331,0.7833l5.57201,14.3594c0.1807,0.4657 0.8158,0.5244 1.0789,0.0998l2.24769,-3.6278l5.05939,5.0594c0.2105,0.2105 0.5517,0.2105 0.7622,0l1.9539,-1.9539c0.2105,-0.2105 0.2105,-0.5517 0,-0.7622l-5.0594,-5.0594l3.6278,-2.2477c0.4246,-0.2631 0.3658,-0.8982 -0.0998,-1.0789z" />
            </g>
        </svg>
    )
}
export { SelectSvg };


const ImportSvg = ({ fill }) => {
    return (
        <svg width="15" height="19" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Import</title>
                <path id="svg_1" fill="white" d="m0.99805,1.1255l8.82678,0l4.71507,4.7149l0,12.6159l-13.54185,0l0,-17.3308z" />
                <path id="svg_2" stroke-linejoin="round" stroke-linecap="round" stroke-width="0.75" stroke={fill} d="m7.76953,9.7909l0,4.8889" />
                <path id="svg_3" stroke-linejoin="round" stroke-linecap="round" stroke-width="0.75" stroke={fill} d="m10.3629,12.2353l-2.59258,2.4445l-2.59259,-2.4445" />
                <path id="svg_4" fill={fill} d="m9.82617,1.2123l0,4.0611c0,0.3137 0.25433,0.5681 0.56813,0.5681l4.0813,0" />
                <path id="svg_5" stroke-miterlimit="10" stroke-width="0.4823" stroke={fill} d="m9.82617,1.2123l0,4.0611c0,0.3137 0.25433,0.5681 0.56813,0.5681l4.0813,0" />
                <path id="svg_6" stroke-linejoin="round" stroke-linecap="round" stroke-width="0.506" stroke={fill} d="m1.56909,1.1255l8.01935,0c0.1514,0 0.29669,0.0602 0.40369,0.1672l4.38047,4.3805c0.1071,0.1071 0.1672,0.2523 0.1672,0.4037l0,11.8084c0,0.3153 -0.2556,0.571 -0.571,0.571l-12.39977,0c-0.3153,0 -0.57098,-0.2556 -0.57098,-0.571l0,-16.1889c0,-0.3153 0.25564,-0.5709 0.57104,-0.5709z" />
            </g>
        </svg>
    )
}
export { ImportSvg };

const PolygonSvg = ({ fill }) => {
    return (
        <svg width="21" height="21" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Polygon</title>
                <path id="svg_1" stroke-width="0.47" stroke={fill} fill={fill} d="m4.53986,1.0256l-3.8758,9.3672l4.39649,7.4863l5.62065,1.881l9.8439,-7.8105l-4.4759,-5.64119l-6.58204,1.11148l-4.9273,-6.39429z" />
            </g>
        </svg>
    )
}
export { PolygonSvg };

const CircleSvg = ({ fill }) => {
    return (
        <svg width="17" height="17" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Circle</title>
                <path id="svg_1" stroke-miterlimit="10" stroke-width="0.4447" stroke={fill} fill={fill} d="m8.40625,16.3928c4.41825,0 7.99995,-3.5817 7.99995,-8.00001c0,-4.41828 -3.5817,-8 -7.99995,-8c-4.41828,0 -8,3.58172 -8,8c0,4.41831 3.58172,8.00001 8,8.00001z" />
            </g>
        </svg>
    )
}
export { CircleSvg };

const RectangleSvg = ({ fill }) => {
    return (
        <svg width="20" height="13" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Rectangle</title>
                <path id="svg_1" stroke-miterlimit="10" stroke-width="0.4712" stroke={fill} fill={fill} d="m18.8347,0.3772l-17.66673,0l0,12.0312l17.66673,0l0,-12.0312z" />
            </g>
        </svg>
    )
}
export { RectangleSvg };


const BoldSvg = ({ fill }) => {
    return (
        <svg width="13" height="17" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Bold</title>
                <path id="svg_1" fill={fill} d="m7.40039,16.1603l-7.06055,0l0,-15.72268l6.87555,0c1.5181,0 2.70897,0.3486 3.57371,1.0459c0.8643,0.6973 1.2963,1.65617 1.2963,2.87647c0,0.8354 -0.2719,1.57281 -0.8168,2.21191c-0.5449,0.6391 -1.2203,1.02048 -2.02696,1.14398l0,0.19629c1.03906,0.0801 1.89796,0.47222 2.57716,1.17682c0.6792,0.7046 1.0185,1.56151 1.0185,2.57131c0,1.3804 -0.4867,2.4751 -1.4599,3.2852c-0.9736,0.8101 -2.29871,1.2148 -3.97701,1.2148zm-3.77002,-13.20608l0,3.99897l2.47357,0c0.8857,0 1.56491,-0.17429 2.03711,-0.52289c0.4722,-0.3486 0.7085,-0.83889 0.7085,-1.47119c0,-0.6318 -0.21628,-1.12404 -0.64838,-1.47614c-0.4321,-0.3525 -1.0405,-0.52875 -1.82471,-0.52875l-2.74609,0zm0,10.68898l2.93121,0c0.9443,0 1.66696,-0.1943 2.16846,-0.583c0.501,-0.3882 0.75153,-0.9492 0.75153,-1.6831c0,-0.7192 -0.25593,-1.2656 -0.76813,-1.6401c-0.5122,-0.374 -1.25487,-0.56097 -2.22797,-0.56097l-2.85498,0l-0.00012,4.46717z" />
            </g>
        </svg>
    )
}
export { BoldSvg };

const LeftAlignSvg = ({ fill }) => {
    return (
        <svg width="21" height="15" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Left</title>
                <path id="svg_1" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m0.5,1.29199l15.2983,0" />
                <path id="svg_2" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m0.5,7.73407l19.7052,0" />
                <path id="svg_3" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m0.5,14.1762l11.9368,0" />
            </g>
        </svg>
    )
}
export { LeftAlignSvg };

const CenterAlignSvg = ({ fill }) => {
    return (
        <svg width="21" height="15" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Center</title>
                <path id="svg_1" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m3.10938,1.29199l15.29832,0" />
                <path id="svg_2" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m0.90625,7.73407l19.70525,0" />
                <path id="svg_3" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m4.78906,14.1762l11.93684,0" />
            </g>
        </svg>
    )
}
export { CenterAlignSvg };

const RightAlignSvg = ({ fill }) => {
    return (
        <svg width="21" height="15" xmlns="http://www.w3.org/2000/svg" fill="none">

            <g>
                <title>Right</title>
                <path id="svg_1" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m4.7168,1.29199l15.2984,0" />
                <path id="svg_2" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m0.31055,7.73407l19.70515,0" />
                <path id="svg_3" stroke-miterlimit="10" stroke-width="1.2789" stroke={fill} d="m8.07812,14.1762l11.93678,0" />
            </g>
        </svg>
    )
}
export { RightAlignSvg };