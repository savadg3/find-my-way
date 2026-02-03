// ProtectedRoute.js

// import React from 'react';
// import { Route, Navigate  } from 'react-router-dom';
// import { isAuthGuardActive } from '../constant/defaultValues'
// const ProtectedRoute = ({ component: Component, isAuthenticated, ...rest }) => {
//   // Add your authentication and authorization logic here
//   const isUserAuthenticated = isAuthenticated(); // Replace with your authentication check
//     if (isAuthGuardActive) {
//         return (
//             <Route
//               {...rest}
//               render={(props) =>
//                 isUserAuthenticated ? <Component {...props} /> : <Navigate  to="/login" />
//               }
//             />
//           );
// }
  
// };

// export default ProtectedRoute;


import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { isAuthGuardActive } from '../constant/defaultValues'

import { getCurrentUser } from './utils';



const ProtectedRoute = ({
  component: Component,
  roles = undefined,
  ...rest
}) => {
   

   

  const setComponent =  (props) => {
   

    if (isAuthGuardActive) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        
        return <Component {...props} />;
      }
        return (
            <>
            
          {console.log('comehere')}
        <Navigate
          to={{
            pathname: '/',
            // state: { from: props.location },
          }}
                />
                </>
      );
    }
    return <Component {...props} />;
  };

  return <Route {...rest} render={setComponent} />;
};

export { ProtectedRoute };
