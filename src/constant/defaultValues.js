export const environmentaldatas = {
  //  phoneRegExp : /^(?:\+61|0)?(?:\s?\d{4}\s?\d{3}\s?\d{2,3}|\d{3}\s?\d{3}\s?\d{3}|\d{2}\s?\d{4}\s?\d{4})$/,
  phoneRegExp: /^0?[2-478](?:[ -]?\d){8}$/,

  /* Change stripe in index.js too */

  /* devop 1*/
  baseURL: 'https://demo.fmw.app/api/',
  appurl: 'https://demo.fmw.app/',
  image_url: 'https://demo.fmw.app/uploads/',
  // image_url: 'https://au.fmw.app/uploads/',
  stripe_link: 'pk_test_51NfzpSEm0mCpznqQw3lNNjH4pTo27YbciL0lCsv1UWzcZmIVmK8hHoLURk8ILxMDYdCHq1nl2KPyklPsWo6J36NO00qxYsHUpL',

  /*Live new*/
  // baseURL: 'https://au.fmw.app/api',
  // appurl: 'https://au.fmw.app/',
  // image_url: 'https://au.fmw.app/uploads/',
  // stripe_link: 'pk_live_51OdhWmFhAySQ56kxodp3bOjvuiFWTdvlNWOU9t1NKFQ1ES1MquIG0YncgH1MT2D5c24zOt7sJH6aOKCx4dj9PtAq00VZHSwnwo',

};

export const isAuthGuardActive = true;
