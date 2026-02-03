
import Hashids from 'hashids';
import axios from 'axios';

const hashids = new Hashids('', 10);

export const getDateWithFormat = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; // January is 0!

  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${dd}.${mm}.${yyyy}`;
};

export const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}`;
};

export const getCurrentUser = () => {
  let user = null;
  try {
    user =
      localStorage.getItem('current_user') != null
        ? JSON.parse(localStorage.getItem('current_user'))
        : null;
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js  : getCurrentUser -> error', error);
    user = null;
  }
  return user;
};

export const setCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js : setCurrentUser -> error', error);
  }
};

export const encode = (encid) => {
  const id = encid ? Number(+encid) : 0;
  const encodedId = id ? hashids.encode(id) : 0;
  return encodedId;
}
export const decode = (decid) => {
  const id = decid ?? '';
  const decodeId = id ? +hashids.decode(id) : 0;
  return decodeId;
}


export const getIP = async () => {
  try {
    const response = await axios.get('https://geolocation-db.com/json/');
    const ip = response.data.IPv4 || response.data.ip;  
    return ip;  
  } catch (error) {
    console.error('Failed to fetch IP:', error);
    return null;  
  }
};

const getMonthsBetweenDates = (startDate, endDate, type) => {
  const months = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
      const month = currentDate.toLocaleString('en-US', { month: 'short' });
      const year = currentDate.getFullYear();
      months.push(`${month}-${year}`);
      currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return months;
};



