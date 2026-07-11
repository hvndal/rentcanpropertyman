// Mock Supabase implementation for RentCan (No Backend)
window.supabase = {
  createClient: function() {
    return {
      auth: {
        getUser: function() {
          return new Promise(function(resolve) {
            var userStr = localStorage.getItem('rc_mock_user');
            if (userStr) {
              resolve({ data: { user: JSON.parse(userStr) } });
            } else {
              resolve({ data: { user: null } });
            }
          });
        },
        signInWithOtp: function(opts) {
          return new Promise(function(resolve) {
            setTimeout(function() {
              localStorage.setItem('rc_mock_email', opts.email);
              localStorage.setItem('rc_mock_role', opts.options.data.role);
              resolve({ data: {}, error: null });
            }, 800);
          });
        },
        verifyOtp: function(opts) {
          return new Promise(function(resolve) {
            setTimeout(function() {
              var email = localStorage.getItem('rc_mock_email') || opts.email;
              var role = localStorage.getItem('rc_mock_role') || 'tenant';
              var user = { id: 'mock-id-123', email: email, user_metadata: { role: role } };
              localStorage.setItem('rc_mock_user', JSON.stringify(user));
              resolve({ data: { user: user }, error: null });
            }, 800);
          });
        }
      },
      from: function(table) {
        return {
          insert: function(data) {
            return new Promise(function(resolve) {
              setTimeout(function() {
                resolve({ data: data, error: null });
              }, 500);
            });
          }
        };
      }
    };
  }
};
