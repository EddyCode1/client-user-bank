import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  LoginPage, RegisterPage, ForgotPasswordPage, 
  ResetPasswordPage, VerifyEmailPage, ResendVerificationPage 
} from '../../features/auth';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Register" component={RegisterPage} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailPage} />
      <Stack.Screen name="ResendVerification" component={ResendVerificationPage} />
    </Stack.Navigator>
  );
}