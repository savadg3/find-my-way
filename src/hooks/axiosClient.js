import axios from 'axios';
import { environmentaldatas } from '../constant/defaultValues';
import { getCurrentUser, setCurrentUser } from '../helpers/utils';
import { NavLink, useNavigate } from "react-router-dom";

const { baseURL } = environmentaldatas;
// const token = JSON.parse(sessionStorage.getItem('data'));
const axiosClient = axios.create();
axiosClient.defaults.baseURL = baseURL;
axiosClient.defaults.headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  // 'Content-Type': 'multipart/form-data',
  // Accept: 'application/json',
  Authorization: `Bearer ${getCurrentUser()?.access_token}`,
};

axiosClient.interceptors.request.use((config) => {
  const token = getCurrentUser()?.access_token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// axiosClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     const errorMsg = error?.response?.data;
//     if (errorMsg?.message === 'You do not have permission to access this resource.') {
//       // navigate(-1);
//       window.location.href = "/*";
//     }
//     return Promise.reject(error);
//   }
// );

axiosClient.interceptors.response.use(
  (response) => {
    return response; // Return the response if successful
  },
  async (error) => {
    const errorMsg = error?.response?.data;
    const originalRequest = error.config;

    // Redirect if the user doesn't have permission
    if (errorMsg?.message === 'You do not have permission to access this resource.') {
      window.location.href = "/";
    }

    if (errorMsg?.message === "Unauthenticated." && !originalRequest._retry) {
      originalRequest._retry = true;
      window.location.href = "/";
      return

      try {
        // Refresh the token
        const response = await refreshTokenApi();
        const newToken = response?.access_token;
        // console.log(response,'refreshTokenApi')
        if (newToken) {
          axiosClient.defaults.headers["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          setCurrentUser(response);

          return axiosClient(originalRequest); // Retry the same request
        }
      } catch (refreshError) {
        // If refreshing the token fails, reject the promise
        return Promise.reject(refreshError);
      }
    }

    // If not related to authentication, reject the error
    return Promise.reject(error);
  }
);


// export default interceptorSetup;
// axiosClient.defaults.timeout = 2000;
// axiosClient.defaults.withCredentials = true;

export function getRequest(URL) {

  axiosClient.defaults.responseType = undefined;
  axiosClient.defaults.headers.Authorization = `Bearer ${getCurrentUser()?.access_token}`;

  return axiosClient.get(`/${URL}`)
    .then((response) => response)
}

export function getRequestForFile(URL, responseType = 'blob') {
  axiosClient.defaults.responseType = undefined;  // Reset the response type
  axiosClient.defaults.headers.Authorization = `Bearer ${getCurrentUser()?.access_token}`;

  // Set the response type based on the parameter (default to 'json')
  return axiosClient.get(`/${URL}`, { responseType })
    .then((response) => response)
    .catch((error) => {
      console.error('Error in getRequest:', error);
      throw error;
    });
}

export function getRequestForDownload(URL) {

  const headers = { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
  const config = { method: 'GET', url: URL, responseType: 'arraybuffer', headers };
  return axiosClient(config)
    .then((response) => response)
    // .catch((error) => {
    //   console.log(error)
    //   const errors = error?.response?.data?.errors;
    //   const errormessage = error?.response?.data?.message;
    //   return { type: 2, errors, errormessage };
    // });
    ;
}

export function postRequestForDownload(URL, data) {
  const headers = {
    'Content-Type': 'application/json',

    // 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  const config = {
    method: 'POST',
    url: URL,
    responseType: 'arraybuffer',
    headers: headers,
    data: data, // Include your request data here
  };

  return axiosClient(config).then((response) => response);
}

export function postRequest(URL, payload, isData) {
  /* isData if the data is Formdata this parameter */
  const headers = { ...axiosClient.defaults.headers };
  if (isData) {
    headers['Content-Type'] = 'multipart/form-data';
  }

  axiosClient.defaults.responseType = undefined;
  return axiosClient
    .post(`/${URL}`, payload, { headers })
    .then((response) => {
      return { type: 1, response };
    })
    .catch((error) => {
      const errors = error?.response?.data?.errors;
      const errormessage = error?.response?.data?.message;
      return { type: 2, errors, errormessage };
    });
}

export function putRequest(URL, payload) {
  axiosClient.defaults.headers.Authorization = `Bearer ${getCurrentUser()?.access_token}`;
  axiosClient.defaults.responseType = undefined;
  return axiosClient
    .put(`/${URL}`, payload)
    .then((response) => {
      return { type: 1, response };
    })
    .catch((error) => {
      const errors = error?.response?.data?.errors;
      const errormessage = error?.response?.data?.message;
      return { type: 2, errors, errormessage };
    });
}

export function patchRequest(URL, payload) {
  axiosClient.defaults.headers.Authorization = `Bearer ${getCurrentUser()?.access_token}`;
  axiosClient.defaults.responseType = undefined;
  return axiosClient.patch(`/${URL}`, payload).then((response) => response);
}

export function deleteRequest(URL) {
  axiosClient.defaults.headers.Authorization = `Bearer ${getCurrentUser()?.access_token}`;
  axiosClient.defaults.responseType = undefined;
  return axiosClient
    .delete(`/${URL}`)
    .then((response) => response)
    .catch((error) => {
      const errors = error?.response?.data?.errors;
      const errormessage = error?.response?.data?.message;
      return { type: 2, errors, errormessage };
    });
}

export function postRequestMultiform(URL, payload) {
  axiosClient.defaults.headers.Authorization = `Bearer ${getCurrentUser()?.access_token}`;
  // axiosClient.defaults.headers['Content-Type'] =
  //   'application/x-www-form-urlencoded';
  axiosClient.defaults.responseType = 'blob';
  return axiosClient
    .post(`/${URL}`, payload)
    .then((response) => {
      return { type: 1, response };
    })
    .catch((error) => {
      const errors = error?.response?.data?.errors;
      const errormessage = error?.response?.data?.message;
      return { type: 2, errors, errormessage };
    });
}

const refreshTokenApi = async () => {
  try {
    const data = {
      refresh_token: getCurrentUser()?.refresh_token,
    }
    const response = await axiosClient.post('/refresh-token', data);
    // console.log(response, 'response')
    const { access_token } = response.data;


    return response?.data ?? null; // Return the new access token
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error; // If refresh fails, reject the promise
  }
};
