import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ArtisanSearch } from './pages/ArtisanSearch';
import { ArtisanProfile } from './pages/ArtisanProfile';
import { ServiceRequests } from './pages/ServiceRequests';
import { ServiceRequestForm } from './pages/ServiceRequestForm';
import { ServiceRequestDetail } from './pages/ServiceRequestDetail';
import { ProfileEdit } from './pages/ProfileEdit';
import { CompleteProfilePage } from './pages/CompleteProfilePage';
import { Bookings } from './pages/Bookings';
import { BookArtisan } from './pages/BookArtisan';
import { BookingDetail } from './pages/BookingDetail';
import { DisputeDetail } from './pages/DisputeDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminArtisans } from './pages/AdminArtisans';
import { AdminDisputes } from './pages/AdminDisputes';
import { NotFound } from './pages/NotFound';

export const routes = [
  { path: '/', element: <Home />, protected: false },
  { path: '/login', element: <Login />, protected: false },
  { path: '/register', element: <Register />, protected: false },
  { path: '/artisans', element: <ArtisanSearch />, protected: false },
  { path: '/artisans/:uid', element: <ArtisanProfile />, protected: false },

  {
    path: '/dashboard',
    element: <Dashboard />,
    protected: true,
    allowedRoles: ['business', 'artisan', 'admin'],
    requiresCompleteProfile: true,
  },
  {
    path: '/service-requests',
    element: <ServiceRequests />,
    protected: true,
    allowedRoles: ['business', 'artisan', 'admin'],
    requiresCompleteProfile: true,
  },
  {
    path: '/service-requests/new',
    element: <ServiceRequestForm />,
    protected: true,
    allowedRoles: ['business'],
  },
  {
    path: '/service-requests/:id',
    element: <ServiceRequestDetail />,
    protected: true,
    allowedRoles: ['business', 'artisan', 'admin'],
    requiresCompleteProfile: true,
  },
  {
    path: '/complete-profile',
    element: <CompleteProfilePage />,
    protected: true,
    allowedRoles: ['artisan'],
  },
  {
    path: '/profile/edit',
    element: <ProfileEdit />,
    protected: true,
    allowedRoles: ['business', 'artisan', 'admin'],
    requiresCompleteProfile: true,
  },
  {
    path: '/bookings',
    element: <Bookings />,
    protected: true,
    allowedRoles: ['business', 'artisan', 'admin'],
    requiresCompleteProfile: true,
  },
  {
    path: '/bookings/new',
    element: <BookArtisan />,
    protected: true,
    allowedRoles: ['business'],
    requiresCompleteProfile: true,
  },
  {
    path: '/bookings/:id',
    element: <BookingDetail />,
    protected: true,
    allowedRoles: ['business', 'artisan', 'admin'],
    requiresCompleteProfile: true,
  },
  {
    path: '/disputes/:id',
    element: <DisputeDetail />,
    protected: true,
    allowedRoles: ['business', 'artisan', 'admin'],
    requiresCompleteProfile: true,
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
    protected: true,
    allowedRoles: ['admin'],
  },
  {
    path: '/admin/artisans',
    element: <AdminArtisans />,
    protected: true,
    allowedRoles: ['admin'],
  },
  {
    path: '/admin/disputes',
    element: <AdminDisputes />,
    protected: true,
    allowedRoles: ['admin'],
  },
  { path: '*', element: <NotFound />, protected: false },
];
