import React from 'react';
import { useDrag } from 'react-dnd';
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { ProductSvg } from '../../../../CustomSvg';
import UndraggedDiv from '../../../../Helpers/modal/UndraggedDiv';

const ProductItem = ({ product, index, onEdit, onRemove }) => {
    const canDrag = !product?.positions || product?.positions === null;

    const [{ isDragging }, drag] = useDrag({
        type: 'productpin',
        item: () => ({ index, id: product.enc_id, product }),
        canDrag: () => canDrag,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    return (
        <div className="drag-wrpr mxx-3">
            <div className={`drag-item ${canDrag && 'can-drag'}`}>
                <div className="magical-words" ref={drag}>
                    <ProductSvg color={product.product_color ?? '#6A6D73'} />
                    <p>
                        {product.product_name}
                        {product?.floor_plan && ` (${product.floor_plan})`}
                    </p>
                </div>

                <div className="flex-grow-1" />

                {canDrag && <UndraggedDiv pinName="product" />}

                <div
                    className="edit-square magical-words"
                    onClick={() => onEdit(product)}
                >
                    <BiSolidPencil fontSize={15} />
                </div>
            </div>

            <div
                className="ml-2 rounded-circle"
                onClick={() => onRemove(product, canDrag)}
                style={{
                    backgroundColor: '#E5E5E5',
                    cursor: 'pointer',
                    marginBottom: 8,
                    padding: 4,
                }}
            >
                <IoMdClose fontSize={10} />
            </div>
        </div>
    );
};

export default ProductItem; 