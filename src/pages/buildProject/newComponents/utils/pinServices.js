import { useFormikContext } from 'formik';
import { useEffect, useRef } from 'react';
 
const useInitializeForm = (pinData, setValues) => {
    const hasInitialized = useRef(false);

    useEffect(() => { 
        if (hasInitialized.current || !pinData?.enc_id) return;

        setValues((prev) => ({
            ...prev, 
            ...pinData, 
        }));

        hasInitialized.current = true;
    }, [pinData]);
}; 

export const FormInitializer = ({ currentPinData }) => {
    const { setValues } = useFormikContext();
    useInitializeForm(currentPinData, setValues);
    return null;
};
 
export const safeJsonParse = (value, fallback = null) => {
    if (!value) return fallback;

    try {
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
};

export const ensureArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

export const sanitizeTags = (tags) => {
  if (!tags) return []; 
  if (Array.isArray(tags)) return tags;
 
  if (typeof tags === "string") {
    try { 

      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { 
        
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }

  return [];
};

export const convertToObject = (array) => { 
    return array.map((obj) => {
        if (obj.value) {
            return obj
        } else {
            return {
                label: typeof(obj) == "string" ? obj :'',
                value:typeof(obj) == "string" ? obj :''
            }
        }
    })
}

export const useDebouncedAutoSave = (callback, delay = 800) => {
    const timeoutRef = useRef(null);

    const debouncedFn = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback();
        }, delay);
    };

    return debouncedFn;
};

export const dateFormatYYYYMMDD = (inputDateString) => {
    if (inputDateString) {
        const inputDate = new Date(inputDateString);
 
        const day = String(inputDate.getDate()).padStart(2, '0');
        const month = String(inputDate.getMonth() + 1).padStart(2, '0'); 
        const year = inputDate.getFullYear();
 
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    } else {
        return ''
    }

}