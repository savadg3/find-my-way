import React, { useEffect, useState } from 'react';
import RichTextEditor from 'react-rte';
import "react-toastify/dist/ReactToastify.css";

const TextEditor = ({
  name, value, setFieldValue, setMaxContentLimit,
  setSelBeaconDtls,setIsDirty
}) => {

  const [editorValue, setEditorValue] = useState(
    RichTextEditor.createValueFromString(value || '', 'html')
  );

  useEffect(() => {
    if (value && !editorValue.toString('html')) {
      setEditorValue(RichTextEditor.createValueFromString(value, 'html'));
    }
  }, [value, editorValue]);

  const countVisibleTextLength = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const visibleText = doc.body.textContent || "";

    return visibleText;
  };

  // const handleEditorChange = (newValue) => {
  //   let newValueString = newValue.toString('html');
  //   newValueString = newValueString.replace(/<\/?p>/g, '');
  //   const content = countVisibleTextLength(newValueString);
  //   if (content?.length <= 674) {
  //     console.log(content.length)
  //     setEditorValue(newValue);
  //     setMaxContentLimit(false)
  //     if (newValue.toString('html') !== value) {
  //       setFieldValue(name, newValueString);
  //       setIsDirty(true)
  //       setSelBeaconDtls(prev => ({ ...prev, [name]: newValueString }))

  //     }
  //   } else {
  //     const truncatedValue = truncateText(content, 674);
  //     setEditorValue(RichTextEditor.createValueFromString(truncatedValue, 'html'));
  //     const truncatedHtml = convertTextToHtml(truncatedValue);
  //     setEditorValue(newValue);
  //     setMaxContentLimit(true)
  //     // if (content?.length >= 674 && content?.length == 675)
  //       // toast.warning('Max character limit exceed')
  //   }
  // };


  const handleEditorChange = (newValue) => {
    let newValueString = newValue.toString('html');
    newValueString = newValueString.replace(/<\/?p>/g, '');
  
    setEditorValue(newValue);
    setMaxContentLimit(false); // You can keep or remove this depending on whether you still show a warning somewhere
  
    if (newValue.toString('html') !== value) {
      setFieldValue(name, newValueString);
      setIsDirty(true);
      setSelBeaconDtls(prev => ({ ...prev, [name]: newValueString }));
    }
  };

  const truncateText = (text, maxLength) => {
    return text.slice(0, maxLength);
  };

  const convertTextToHtml = (text) => {
    return `<p>${text}</p>`;
  };

  const toolbarConfig = {
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
      { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
      { label: 'Italic', style: 'ITALIC' },
      { label: 'Underline', style: 'UNDERLINE' },
    ],
    BLOCK_TYPE_BUTTONS: [
      { label: 'UL', style: 'unordered-list-item' },
      { label: 'OL', style: 'ordered-list-item' },
    ],
  };

  const editorStyle = {
    fontSize: '0.875rem',
    color: '#6a6d73',
    border: '1px solid #F5F6F7'

  };

  return (
    <RichTextEditor
      name={name}
      value={editorValue}
      onChange={handleEditorChange}
      toolbarConfig={toolbarConfig}
      editorStyle={editorStyle}

    />
  );
};

export default TextEditor;