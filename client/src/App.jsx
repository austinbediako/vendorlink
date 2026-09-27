import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './components/AppRoutes';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
