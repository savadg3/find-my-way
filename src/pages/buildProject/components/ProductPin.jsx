import React from 'react'
import { useDrag } from 'react-dnd'
import { ProductSvg } from "../CustomSvg";
const ProductPin = ({ active, product, mapDivSize }) => {

  return (
    <div className='location-pin' style={{ left: mapDivSize.width / product?.position?.x, top: mapDivSize?.height / product?.position?.y ,zIndex:100}} >
      <ProductSvg color={active ? "#26a3db" : product.product_color ?? "#6A6D73"} />
    </div>
  )
}

export default ProductPin;