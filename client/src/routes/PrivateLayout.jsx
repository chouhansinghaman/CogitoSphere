import { Outlet } from "react-router-dom";

/* TEMP: allow everyone */
export function PrivateRoute() {
  return <Outlet />;
}

/* TEMP: allow everyone */
export function AdminRoute() {
  return <Outlet />;
}
