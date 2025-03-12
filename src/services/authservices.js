const API_BASE_URL = 'https://pl.pr.flashfund.in/api/auth';

export const signup = async (email, phone, password, referrer) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, phone, password,referrer }),
  });

  if (!response.ok) {
    throw new Error(response.status === 400 
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

export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    if (!response.ok) {
      throw new Error(response.status === 400 
        ? 'Invalid email or password' 
        : response.status === 429 
          ? 'Too many attempts. Please try again later' 
          : 'Login failed. Please try again'
      );
    }
  
    return response.json();
  };

  export const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to send OTP. Please try again.');
    }
  
    return response.json();
  };
  
  export const resetPassword = async (email, otp, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to reset password. Please try again.');
    }
  
    return response.json();
  }

  const BASE_URL = 'https://pl.pr.flashfund.in/api/auth'

export const authService = {
  sendOtp: async (email) => {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send OTP')
    }
    
    return response.json()
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reset password')
    }
    
    return response.json()
  }
}