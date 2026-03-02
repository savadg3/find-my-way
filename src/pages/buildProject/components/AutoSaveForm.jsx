
import React, { useEffect } from "react";
import { useFormikContext } from "formik";

const AutosaveForm = ({ handleSubmit }) => {
  const formik = useFormikContext();

  useEffect(() => {

    const saveTimer = setTimeout(() => {
      if ((formik.dirty) || (formik.values?.enc_id === null && formik.values.position)) { 
        handleSubmit('auto save')
      }
    }, 1000);

    return () => {
      clearTimeout(saveTimer);
    };
  }, [formik.values, formik.dirty]);

  return null;
};

export default AutosaveForm;

