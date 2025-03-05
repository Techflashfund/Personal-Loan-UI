const API_BASE_URL = 'https://pl.pr.flashfund.in/api/auth';

export const signup = async (email, phone, password) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, phone, password }),
  });

  if (!response.ok) {
    throw new Error(response.status === 409 
      ? 'Email or phone already registered' 
      : 'Signup failed. Please try again'
    );
  }

  return response.json();
};

export const verifyEmail = async (email, otp) => {
  const response = await fetch(`${API_BASE_URL}/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    throw new Error(response.status === 400 
      ? 'Invalid OTP. Please try again' 
      : response.status === 404 
        ? 'Email not found or OTP expired' 
        : 'Verification failed'
    );
  }

  return response.json();
};

export const resendOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/resend-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to resend OTP');
  }

  return response.json();
};