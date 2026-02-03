import React, { useRef, useState } from 'react'
import { IoMdClose } from 'react-icons/io'

const ProdSpecItem = ({ spec, index, setSpecifications, specifications, setFieldValue, name,setIsDirty }) => {

    const onChangeInput = (e, type) => {
        let tempSpec = [...specifications]
        tempSpec[index] = { ...tempSpec[index], [type]: e.target.value };
        setSpecifications([...tempSpec]);
        setFieldValue(name[index], tempSpec);
        setIsDirty(true);
    }

    const onDelete = () => {

        swal({
            title: "Are you sure you want to delete?",
            text: "This action is permanent and cannot be undone.",
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
                        setSpecifications(prevSpecs => prevSpecs.filter((_, i) => i !== index));
                        setTimeout(() => {
                            setFieldValue(name, specifications);
                        }, 500);
                        setIsDirty(true);

                        break;
                    default:
                        break;
                }
            });
        return
    }

    return (
        <div className='prod-spec-item' >
            <input className='form-control' placeholder="Please Type Name" value={spec.label || ''} onChange={(e) => onChangeInput(e, 'label')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); 
                    }
                }}
            />
            <input className='form-control' placeholder="Please Type Value" value={spec.value || ''} onChange={(e) => onChangeInput(e, 'value')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); 
                    }
                }}
            />
            <div className=' p-1 rounded-circle' onClick={() => { onDelete() }} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer' }} >
                <IoMdClose  fontSize={10} />
            </div>
        </div>
    )
}

export default ProdSpecItem



export const LocationWebListItem = ({
  spec,
  index,
  setSpecifications,
  specifications,
  setFieldValue,
  name,
  setIsDirty,
  setFieldError,
  error,  
}) => {

    // console.log({ spec, index, setSpecifications, specifications, setFieldValue, name, setIsDirty, setFieldError, error }, "sahdshfvhdvfdshvfhsdvf");

    const onBlurInput = (e, type) => {
        const inputValue = e.target.value.trim();
        const path = `${name}[${index}].${type}`;
        
        if (type === 'value') {
            // const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[\w\-./?%&=]*)?$/;
            const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

            if (!inputValue) {
                setFieldError(path, 'URL is required');
            } else if (inputValue && !urlRegex.test(inputValue)) {
                setFieldError(path, 'Enter a valid URL');
            } else {
                setFieldError(path, undefined);
            }
        }else {
            if (!inputValue) {
                setFieldError(path, 'Name is required');
            } else {
                setFieldError(path, undefined);
            }
        }
    };

    // const onChangeInput = (e, type) => {
    //     const inputValue = e.target.value;
    //     let tempSpec = [...specifications];
    //     tempSpec[index] = { ...tempSpec[index], [type]: inputValue };
    //     setSpecifications([...tempSpec]);
    //     setFieldValue(name[index], tempSpec);
    //     setIsDirty(true);
    // }

    const inputvalueRef = useRef(null); 
    const inputlabelRef = useRef(null);

    const onChangeInput = (e, type) => {
        const inputValue = e.target.value;

        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;

        let tempSpec = [...specifications];
        tempSpec[index] = { ...tempSpec[index], [type]: inputValue };

        setSpecifications([...tempSpec]);
        setFieldValue(name[index], tempSpec);
        setIsDirty(true);

        if (type == 'value') {
            setTimeout(() => {
                if (inputvalueRef.current) {
                    inputvalueRef.current.setSelectionRange(selectionStart, selectionEnd);
                }
            }, 0);
        } else {
            setTimeout(() => {
                if (inputlabelRef.current) {
                    inputlabelRef.current.setSelectionRange(selectionStart, selectionEnd);
                }
            }, 0);
        }
    };
    
    const onDelete = () => {

        swal({
            title: "Are you sure you want to delete?",
            text: "This action is permanent and cannot be undone.",
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
                    let array = []
                    setSpecifications(prevSpecs => {
                        let prevdata = prevSpecs.filter((_, i) => i !== index)
                        array = prevdata
                        return prevdata
                    });
                    setTimeout(() => {
                        setFieldValue(name, array);
                    }, 500);
                    setIsDirty(true);

                    break;
                default:
                    break;
            }
        });
        return
    }

    return (
        <>
            <div className='prod-spec-item' style={{
                marginBottom:"0px"
            }}>
                <input
                    className={`form-control ${error?.label ? "error" : ""}`}
                    placeholder="Enter platform name"
                    value={spec.label || ''}
                    onChange={(e) => {
                        const path = `${name}[${index}].label`;
                        setFieldError(path, undefined);
                        onChangeInput(e, 'label')
                    }}
                    onBlur={(e) => onBlurInput(e, 'label')}
                    ref={inputlabelRef}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); 
                        }
                    }}
                />
                
                <input
                    className={`form-control ${error?.value ? "error" : ""}`}
                    placeholder="Enter platform URL"
                    value={spec.value || ''}
                    onChange={(e) => {
                        const path = `${name}[${index}].value`;
                        setFieldError(path, undefined);
                        onChangeInput(e, 'value')
                    }}
                    onBlur={(e) => onBlurInput(e, 'value')}
                    ref={inputvalueRef}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); 
                        }
                    }}
                />
                    
                <div className=' p-1 rounded-circle' onClick={() => { onDelete() }} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer' }}>
                    <IoMdClose  fontSize={10} />
                </div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: "1fr 1fr calc(0.5rem + 10px)",
                gap: '10px',
                marginBottom:"5px"
            }} >
                
                    {/* {error?.label  ? ( */}
                        <div className="text-danger" style={{padding:"0 5px"}}>
                            {error?.label}
                        </div>
                    {/* ) : null} */}
                
                    {/* {error?.value  ? ( */}
                        <div className="text-danger" style={{padding:"0 5px"}}>
                            {error?.value}
                        </div>
                    {/* ) : null} */}
                <div>
                    {/* <IoMdClose  fontSize={10} /> */}
                </div>
            </div>

        </>
    )
}