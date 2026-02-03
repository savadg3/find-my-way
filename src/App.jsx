import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';  
import ContextProvider from './providers/ContextProvider.jsx';
import AppRoutes from './routes/AppRoutes';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
// import interceptorSetup from './hooks/axiosClient'

function App() { 
  return (
    <DndProvider backend={HTML5Backend}>
        <ContextProvider>
          <AppRoutes />
        </ContextProvider>
      <ToastContainer theme="colored"
        position="top-right" hideProgressBar="true" autoClose="2000" closeButton={false}
      />
    </DndProvider>
  );
}


export default App;
