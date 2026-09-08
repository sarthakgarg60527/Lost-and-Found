import { Navigate } from "react-router-dom";

export default function AdminRoute({
  children,
}) {

  const token =
    localStorage.getItem(
      "admin_token"
    );

  const admin = JSON.parse(
    localStorage.getItem(
      "admin_data"
    ) || "null"
  );

  if (
    !token ||
    admin?.role !== "admin"
  ) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}