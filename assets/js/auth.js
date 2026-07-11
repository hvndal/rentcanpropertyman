document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient();

  // Role selector UI in signup
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

  // Handle Signup Form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const btn = signupForm.querySelector('button');
      const originalText = btn.innerText;
      btn.innerText = 'Sending Magic Link...';
      btn.disabled = true;

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { data: { role: selectedRole } }
      });

      if (!error) {
        // Mock verification step
        await supabase.auth.verifyOtp({ email });
        window.location.href = selectedRole === 'landlord' ? 'landlord-dashboard.html' : 'tenant-dashboard.html';
      }
    });
  }

  // Handle Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const btn = loginForm.querySelector('button');
      btn.innerText = 'Signing In...';
      btn.disabled = true;

      // Mock OTP verify directly for login
      const { data, error } = await supabase.auth.verifyOtp({ email });
      if (data && data.user) {
        const role = data.user.user_metadata.role || 'tenant';
        window.location.href = role === 'landlord' ? 'landlord-dashboard.html' : 'tenant-dashboard.html';
      }
    });
  }

  // Route Protection & User Display on Dashboards
  const isDashboard = window.location.pathname.includes('dashboard');
  if (isDashboard) {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (!user) {
      window.location.href = 'login.html'; // Redirect to login if not authenticated
      return;
    }

    // Display user email
    const emailSpan = document.getElementById('userEmail');
    if (emailSpan) emailSpan.innerText = user.email;

    // Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('rc_mock_user');
        localStorage.removeItem('rc_mock_email');
        localStorage.removeItem('rc_mock_role');
        window.location.href = 'login.html';
      });
    }
  }
});
