
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export function ResetPassword() {
  return (
    <AuthLayout 
      title="Set New Password"
      subtitle="Create a new password for your account"
      showBackButton={false}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default ResetPassword;
