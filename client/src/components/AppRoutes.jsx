import { Routes, Route } from 'react-router-dom';
import { routes } from '../routes';
import { ProtectedRoute } from './ProtectedRoute';
import { CompleteProfileGuard } from './CompleteProfileGuard';
import { RoleGuard } from './RoleGuard';

function RouteWrapper({ route }) {
  let element = route.element;

  if (route.requiresCompleteProfile) {
    element = <CompleteProfileGuard>{element}</CompleteProfileGuard>;
  }

  if (route.allowedRoles) {
    element = <RoleGuard allowedRoles={route.allowedRoles}>{element}</RoleGuard>;
  }

  if (route.protected) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  return element;
}

export function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteWrapper route={route} />}
        />
      ))}
    </Routes>
  );
}
