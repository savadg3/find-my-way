
import React, { useEffect } from "react";
import { useFormikContext } from "formik";

const AutosaveForm = ({ handleSubmit, setSavingTimer, savingTimer }) => {
  const formik = useFormikContext();

  useEffect(() => {

    const saveTimer = setTimeout(() => {
      if ((formik.dirty) || (formik.values?.enc_id === null && formik.values.position)) {
        console.log(formik.dirty, 'formik.dirty')
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

