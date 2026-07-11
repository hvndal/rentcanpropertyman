
document.addEventListener('DOMContentLoaded', () => {

  // ---- ROLE SELECTOR UI (Signup) ----
  const roleBtns = document.querySelectorAll('.role-btn');
  let selectedRole = 'tenant';
  if (roleBtns.length > 0) {
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRole = btn.dataset.role;
      });
    });
  }

  // ---- AUTHENTICATION FLOW (MSG91) ----
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const primaryForm = signupForm || loginForm;
  const otpForm = document.getElementById('otpForm');
  let currentIdentifier = '';

  if (primaryForm && otpForm) {
    primaryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentIdentifier = document.getElementById('email').value;
      const btn = primaryForm.querySelector('button[type="submit"]');
      const originalText = btn.innerText;
      btn.innerText = 'Sending OTP...';
      btn.disabled = true;

      // Invoke MSG91 sendOtp
      if (typeof window.sendOtp === 'function') {
        window.sendOtp(
          currentIdentifier,
          (data) => {
            console.log('OTP sent successfully.', data);
            // Switch UI to Step 2
            primaryForm.style.display = 'none';
            otpForm.style.display = 'flex';
          },
          (error) => {
            console.log('Error sending OTP', error);
            btn.innerText = originalText;
            btn.disabled = false;
            alert('Failed to send OTP. Check console for details.');
          }
        );
      } else {
        alert('MSG91 SDK not loaded.');
        btn.innerText = originalText;
        btn.disabled = false;
      }
    });

    // Handle Verify OTP
    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const otpCode = document.getElementById('otpCode').value;
      const btn = otpForm.querySelector('button[type="submit"]');
      btn.innerText = 'Verifying...';
      btn.disabled = true;

      if (typeof window.verifyOtp === 'function') {
        window.verifyOtp(
          otpCode,
          (data) => {
            console.log('OTP verified from widget:', data);
            
            // Extract the JWT token from the widget response.
            // MSG91 typically returns the token in data.message
            const jwtToken = data.message || data.jwt || data.token;
            
            if (!jwtToken) {
               console.warn("No JWT token found in response, falling back to basic session.");
               localStorage.setItem('rc_session_identifier', currentIdentifier);
               localStorage.setItem('rc_session_role', selectedRole);
               window.location.href = selectedRole === 'landlord' ? 'landlord-dashboard.html' : 'tenant-dashboard.html';
               return;
            }

            // Verify the Access Token with MSG91
            fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
              },
              body: JSON.stringify({
                "authkey": "{YOUR_MSG91_AUTHKEY_HERE}",
                "access-token": jwtToken
              })
            })
            .then(response => response.json())
            .then(json => {
              console.log('Backend verification response:', json);
              if (json.type === 'success' || !json.error) {
                // Token is valid! Create the local session
                localStorage.setItem('rc_session_identifier', currentIdentifier);
                localStorage.setItem('rc_session_role', selectedRole);
                window.location.href = selectedRole === 'landlord' ? 'landlord-dashboard.html' : 'tenant-dashboard.html';
              } else {
                alert('Token verification failed: ' + (json.message || 'Unknown error'));
                btn.innerText = 'Verify OTP';
                btn.disabled = false;
              }
            })
            .catch(err => {
              console.error('Fetch error:', err);
              alert('Network error verifying token.');
              btn.innerText = 'Verify OTP';
              btn.disabled = false;
            });
          },,
          (error) => {
            console.log('OTP Verification failed:', error);
            btn.innerText = 'Verify OTP';
            btn.disabled = false;
            alert('Invalid OTP. Please try again.');
          }
        );
      }
    });

    // Handle Resend OTP
    const resendBtn = document.getElementById('resendOtpBtn');
    if (resendBtn) {
      resendBtn.addEventListener('click', () => {
        resendBtn.style.opacity = '0.5';
        resendBtn.innerText = 'Resending...';
        
        if (typeof window.retryOtp === 'function') {
          window.retryOtp(
            null, // Default channel
            (data) => {
              console.log('OTP resent:', data);
              resendBtn.innerText = 'Code Resent!';
              setTimeout(() => { resendBtn.innerText = "Didn't receive code? Resend."; resendBtn.style.opacity = '1'; }, 3000);
            },
            (error) => {
              console.log('Error resending OTP:', error);
              resendBtn.innerText = "Didn't receive code? Resend.";
              resendBtn.style.opacity = '1';
            }
          );
        }
      });
    }
  }

  // ---- ROUTE PROTECTION (Dashboards) ----
  const isDashboard = window.location.pathname.includes('dashboard');
  if (isDashboard) {
    const identifier = localStorage.getItem('rc_session_identifier');
    
    if (!identifier) {
      window.location.href = 'login.html'; // Redirect if no active session
      return;
    }

    // Display user
    const emailSpan = document.getElementById('userEmail');
    if (emailSpan) emailSpan.innerText = identifier;

    // Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('rc_session_identifier');
        localStorage.removeItem('rc_session_role');
        window.location.href = 'login.html';
      });
    }
  }
});
