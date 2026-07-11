window.supabase = {
  createClient: function() {
    let _data = {
      properties: [],
      maintenance_requests: [],
      tenant_assignments: [],
      profiles: []
    };
    function createChain(table, initialData, initialError) {
      let chain = {
        select: () => chain,
        insert: () => { return Promise.resolve({ error: null, data: initialData || {} }); },
        upsert: () => { return Promise.resolve({ error: null, data: initialData || {} }); },
        update: () => chain,
        delete: () => chain,
        eq: () => chain,
        or: () => chain,
        in: () => chain,
        order: () => chain,
        single: () => Promise.resolve({ data: initialData || {}, error: initialError }),
        maybeSingle: () => Promise.resolve({ data: initialData || null, error: initialError }),
        then: (cb) => cb({ data: initialData || [], error: initialError })
      };
      // Overrides for specific queries
      if (table === 'properties' && !initialData) {
        chain.then = (cb) => cb({ data: JSON.parse(localStorage.getItem('rc_mock_props') || '[]'), error: null });
        chain.insert = (payload) => {
          let props = JSON.parse(localStorage.getItem('rc_mock_props') || '[]');
          payload.id = 'prop_' + Date.now();
          props.unshift(payload);
          localStorage.setItem('rc_mock_props', JSON.stringify(props));
          return Promise.resolve({ error: null });
        };
        chain.delete = () => {
          let props = JSON.parse(localStorage.getItem('rc_mock_props') || '[]');
          if(props.length) props.shift();
          localStorage.setItem('rc_mock_props', JSON.stringify(props));
          return chain;
        };
      }
      if (table === 'maintenance_requests') {
        chain.then = (cb) => cb({ data: JSON.parse(localStorage.getItem('rc_mock_reqs') || '[]'), error: null });
        chain.insert = (payload) => {
          let reqs = JSON.parse(localStorage.getItem('rc_mock_reqs') || '[]');
          payload.id = 'req_' + Date.now();
          payload.properties = { property_name: 'Mock Property' };
          reqs.unshift(payload);
          localStorage.setItem('rc_mock_reqs', JSON.stringify(reqs));
          return Promise.resolve({ error: null });
        };
        chain.update = (payload) => {
          let reqs = JSON.parse(localStorage.getItem('rc_mock_reqs') || '[]');
          if(reqs.length && payload.status) reqs[0].status = payload.status;
          localStorage.setItem('rc_mock_reqs', JSON.stringify(reqs));
          return chain;
        };
      }
      if (table === 'property_invitations') {
        chain.single = () => Promise.resolve({ data: { invite_code: 'RC' + Math.floor(Math.random()*10000) }, error: null });
      }
      if (table === 'tenant_assignments') {
        chain.then = (cb) => cb({ data: JSON.parse(localStorage.getItem('rc_mock_assignments') || '[]'), error: null });
      }
      if (table === 'profiles') {
        chain.maybeSingle = () => Promise.resolve({ data: null, error: null });
      }
      return chain;
    }

    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: { user: JSON.parse(localStorage.getItem('rentcan_user') || 'null') } } }),
        signInWithOAuth: () => Promise.resolve({ error: null }),
        signInWithOtp: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ error: null }),
        verifyOtp: (opts) => {
          return Promise.resolve({ data: { user: { id: 'mock_usr', email: opts.email || 'mock@email.com', user_metadata: {} } }, error: null });
        },
        updateUser: () => Promise.resolve({ data: { user: { id: 'mock_usr' } }, error: null }),
        resetPasswordForEmail: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve(),
        onAuthStateChange: (cb) => {
          // Fire signed in if we have a user
          if (localStorage.getItem('rentcan_user')) {
             cb('SIGNED_IN', { user: JSON.parse(localStorage.getItem('rentcan_user')) });
          }
        }
      },
      from: (table) => createChain(table, table === 'properties' ? [] : null, null),
      channel: () => ({ on: () => ({ subscribe: () => {} }) })
    };
  }
};
