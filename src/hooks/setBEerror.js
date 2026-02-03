import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function SetBackEndErrorsAPi(data, setFieldError, type = 0) {
  const errors = data.errors ?? null;
  const errormessage = data.errormessage ?? null;
  if (errors) {
    const fields = Object.keys(errors);
    Object.keys(errors).forEach(function (key) {
      const errorArray = errors[key] ?? [];
      const errorMsg = errorArray.length > 0 ? errorArray[0] : 'Invalid data';

      if (fields.includes(key)) {
        setFieldError?.setFieldError(key, errorMsg);
      }
    });
    // toast.error('Invalid details.');
  } else if (errormessage) {
    toast.error(data.errormessage);
  }
}
