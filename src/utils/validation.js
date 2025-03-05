export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  
  export const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit phone number';
    return '';
  };
  
  export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return 'Password must include uppercase, lowercase, and number';
    }
    return '';
  };
  
  export const validateOtp = (otp) => {
    const otpRegex = /^\d{6}$/;
    if (!otp) return 'OTP is required';
    if (!otpRegex.test(otp)) return 'OTP must be 6 digits';
    return '';
  };