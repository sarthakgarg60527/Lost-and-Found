import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateItem from "./pages/CreateItem";
import ItemDetails from "./pages/ItemDetails"; 
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminPanel";
import PostItem from "./components/PostItem";
import Onboarding from "./pages/Onboarding";
import Messages from "./pages/Messages";
import Inbox from "./pages/Inbox";
import Leaderboard from "./pages/Leaderboard"; 
import { LanguageProvider } from './context/LanguageContext';
import NearbyItems from "./pages/NearbyItems";
import Notification from "./components/Notification";
import HelpSupport from "./pages/HelpSupport";
import ForgotPassword from "./pages/ForgotPassword";
// 🔥 ADMIN IMPORTS
import AdminLogin from "./admin/AdminLogin";
import AdminRegister from "./admin/AdminRegister"; // 🔥 Naya add kiya
import AdminRoute from "./components/AdminRoute";

// 🔐 User Protected Route Logic
const ProtectedRoute = ({ children }) => {
  const token =
localStorage.getItem(
  "user_token"
);

const user = JSON.parse(
  localStorage.getItem(
    "user_data"
  ) || "null"
);

return token &&
user?.role === "user"
? children
: <Navigate replace to="/login" />;
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Public Routes (User) --- */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* --- 🔥 Admin Auth Routes (Public) --- */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} /> 
          
          {/* --- Private Routes (User Login Required) --- */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
          <Route path="/nearby" element={<ProtectedRoute><NearbyItems/></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notification/></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateItem /></ProtectedRoute>} />
          <Route path="/chat/:itemId/:receiverId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/item/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
          <Route path="/post-item" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* --- 🛡️ Restricted Admin Routes (Admin Login + Role Required) --- */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* --- Catch-all: Redirect to Landing --- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}