import { useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { TrendingUp } from "lucide-react";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  
  // Check for reset token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");
  
  // If there's a reset token, show reset password form
  if (resetToken && authMode !== "reset-password") {
    console.log("Reset token found:", resetToken);
    setAuthMode("reset-password");
  }

  const handleAuthSuccess = () => {
    // Refresh the page to trigger auth state update
    window.location.href = "/";
  };

  const renderAuthForm = () => {
    switch (authMode) {
      case "register":
        return (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setAuthMode("login")}
          />
        );
      case "reset-password":
        return resetToken ? (
          <ResetPasswordForm
            token={resetToken}
            onSuccess={() => setAuthMode("login")}
          />
        ) : (
          <div className="text-center text-red-600">
            Invalid or missing reset token. Please request a new password reset.
          </div>
        );
      default:
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthMode("register")}
            onSwitchToForgotPassword={() => setAuthMode("forgot-password")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Stockit</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Professional Salon Stock Management
          </p>
        </div>

        {/* Auth Form */}
        {renderAuthForm()}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Stockit. All rights reserved.</p>
          <p className="mt-1">Secure salon stock management for professionals</p>
        </div>
      </div>
    </div>
  );
}