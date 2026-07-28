/**
 * RentCan demo portfolio — session sample data so a new login feels ready.
 * Used when the landlord has zero properties in Supabase.
 * Tricity-flavored (Mohali / Chandigarh / Aerocity).
 */
(function (global) {
  const DEMO_KEY = 'rentcan_demo_mode';

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  function formatINR(n) {
    return '₹' + Number(n || 0).toLocaleString('en-IN');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function getDemoPortfolio() {
    const props = [
      {
        id: 'demo-prop-1',
        name: 'Sector 79 Residence',
        address: 'House 214, Sector 79, Mohali, Punjab 140308',
        plan: 'residential',
        rent_amount: 28000,
        beds: 3,
        baths: 3,
        sqft: 1650,
        status: 'occupied',
        image: '/assets/stock/residential.jpg'
      },
      {
        id: 'demo-prop-2',
        name: 'Aerocity Studio',
        address: 'Tower B-1204, Aerocity, Mohali 140306',
        plan: 'residential',
        rent_amount: 18500,
        beds: 1,
        baths: 1,
        sqft: 620,
        status: 'occupied',
        image: '/assets/stock/airbnb.jpg'
      },
      {
        id: 'demo-prop-3',
        name: 'Sector 35 Commercial',
        address: 'SCO 48, Sector 35-C, Chandigarh 160036',
        plan: 'commercial',
        rent_amount: 55000,
        beds: 0,
        baths: 2,
        sqft: 2100,
        status: 'vacant',
        image: '/assets/stock/commercial.jpg'
      }
    ];

    const tenants = [
      {
        id: 'demo-ten-1',
        property_id: 'demo-prop-1',
        name: 'Simran Kaur',
        email: 'simran.kaur@example.com',
        phone: '+91 98765 43210',
        rent_amount: 28000,
        rent_due_date: 5
      },
      {
        id: 'demo-ten-2',
        property_id: 'demo-prop-2',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        phone: '+91 98140 11223',
        rent_amount: 18500,
        rent_due_date: 1
      }
    ];

    const payments = [
      {
        id: 'demo-pay-1',
        property_id: 'demo-prop-1',
        tenant_id: 'demo-ten-1',
        amount: 28000,
        status: 'paid',
        due_date: daysFromNow(-25),
        paid_at: daysAgo(22),
        created_at: daysAgo(22),
        properties: { name: 'Sector 79 Residence', owner_id: 'demo' },
        tenant_name: 'Simran Kaur'
      },
      {
        id: 'demo-pay-2',
        property_id: 'demo-prop-2',
        tenant_id: 'demo-ten-2',
        amount: 18500,
        status: 'paid',
        due_date: daysFromNow(-28),
        paid_at: daysAgo(27),
        created_at: daysAgo(27),
        properties: { name: 'Aerocity Studio', owner_id: 'demo' },
        tenant_name: 'Arjun Mehta'
      },
      {
        id: 'demo-pay-3',
        property_id: 'demo-prop-1',
        tenant_id: 'demo-ten-1',
        amount: 28000,
        status: 'pending',
        due_date: daysFromNow(5),
        paid_at: null,
        created_at: daysAgo(2),
        properties: { name: 'Sector 79 Residence', owner_id: 'demo' },
        tenant_name: 'Simran Kaur'
      },
      {
        id: 'demo-pay-4',
        property_id: 'demo-prop-2',
        tenant_id: 'demo-ten-2',
        amount: 18500,
        status: 'pending',
        due_date: daysFromNow(3),
        paid_at: null,
        created_at: daysAgo(1),
        properties: { name: 'Aerocity Studio', owner_id: 'demo' },
        tenant_name: 'Arjun Mehta'
      },
      {
        id: 'demo-pay-5',
        property_id: 'demo-prop-1',
        tenant_id: 'demo-ten-1',
        amount: 28000,
        status: 'paid',
        due_date: daysFromNow(-55),
        paid_at: daysAgo(52),
        created_at: daysAgo(52),
        properties: { name: 'Sector 79 Residence', owner_id: 'demo' },
        tenant_name: 'Simran Kaur'
      }
    ];

    const maintenance = [
      {
        id: 'demo-mnt-1',
        property_id: 'demo-prop-1',
        title: 'AC servicing — living room',
        description: 'Scheduled vendor visit for filter clean and gas top-up.',
        category: 'appliance',
        status: 'pending',
        priority: 'medium',
        created_at: daysAgo(3),
        scheduled_date: daysFromNow(2),
        properties: { name: 'Sector 79 Residence', owner_id: 'demo' }
      },
      {
        id: 'demo-mnt-2',
        property_id: 'demo-prop-2',
        title: 'Monthly inspection complete',
        description: 'Photos uploaded. Minor paint touch-up noted in kitchen.',
        category: 'inspection',
        status: 'resolved',
        priority: 'low',
        created_at: daysAgo(8),
        scheduled_date: daysFromNow(-8),
        properties: { name: 'Aerocity Studio', owner_id: 'demo' }
      },
      {
        id: 'demo-mnt-3',
        property_id: 'demo-prop-1',
        title: 'Plumbing — bathroom tap drip',
        description: 'Tenant reported slow drip. Vendor dispatched.',
        category: 'plumbing',
        status: 'in_progress',
        priority: 'high',
        created_at: daysAgo(1),
        scheduled_date: daysFromNow(0),
        properties: { name: 'Sector 79 Residence', owner_id: 'demo' }
      }
    ];

    const documents = [
      {
        id: 'demo-doc-1',
        property_id: 'demo-prop-1',
        name: 'Lease Agreement — Simran Kaur',
        type: 'lease',
        file_url: '#',
        created_at: daysAgo(90),
        property_name: 'Sector 79 Residence'
      },
      {
        id: 'demo-doc-2',
        property_id: 'demo-prop-1',
        name: 'June Inspection Report.pdf',
        type: 'inspection',
        file_url: '#',
        created_at: daysAgo(20),
        property_name: 'Sector 79 Residence'
      },
      {
        id: 'demo-doc-3',
        property_id: 'demo-prop-2',
        name: 'Tenant ID Proof — Arjun Mehta',
        type: 'id_proof',
        file_url: '#',
        created_at: daysAgo(60),
        property_name: 'Aerocity Studio'
      },
      {
        id: 'demo-doc-4',
        property_id: 'demo-prop-2',
        name: 'Electricity Bill — May 2026',
        type: 'utility',
        file_url: '#',
        created_at: daysAgo(35),
        property_name: 'Aerocity Studio'
      }
    ];

    const reports = [
      {
        id: 'demo-rep-1',
        title: 'July 2026 Technical Inspection',
        property: 'Sector 79 Residence',
        date: daysAgo(20),
        summary: 'Routine check — HVAC filters replaced, no structural issues.',
        value: 420,
        type: 'inspection'
      },
      {
        id: 'demo-rep-2',
        title: 'June 2026 Electrical Safety Audit',
        property: 'Aerocity Studio',
        date: daysAgo(45),
        summary: 'MCB and wiring inspection passed. Fire alarm synced.',
        value: 550,
        type: 'inspection'
      },
      {
        id: 'demo-rep-3',
        title: 'May 2026 Vacancy Prep Checklist',
        property: 'Sector 35 Commercial',
        date: daysAgo(70),
        summary: 'Deep clean + lock change completed ahead of listing.',
        value: 180,
        type: 'inspection'
      }
    ];

    const inspections = [
      {
        id: 'demo-insp-1',
        property_id: 'demo-prop-1',
        inspection_date: daysAgo(20).slice(0, 10),
        status: 'published',
        outcome: 'pass',
        summary: 'July 2026 Technical Inspection',
        notes: 'Routine check — HVAC filters replaced, no structural issues.',
        published_at: daysAgo(19),
        checklist: [],
        photo_urls: []
      },
      {
        id: 'demo-insp-2',
        property_id: 'demo-prop-2',
        inspection_date: daysAgo(45).slice(0, 10),
        status: 'published',
        outcome: 'pass',
        summary: 'June 2026 Electrical Safety Audit',
        notes: 'MCB and wiring inspection passed.',
        published_at: daysAgo(44),
        checklist: [],
        photo_urls: []
      },
      {
        id: 'demo-insp-3',
        property_id: 'demo-prop-1',
        inspection_date: daysFromNow(5),
        status: 'scheduled',
        outcome: null,
        summary: 'Upcoming monthly visit',
        notes: '',
        published_at: null,
        checklist: [],
        photo_urls: []
      }
    ];

    const occupied = props.filter((p) => p.status === 'occupied');
    const monthlyRevenue = occupied.reduce((s, p) => s + Number(p.rent_amount), 0);
    const paidTotal = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const pendingTotal = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

    return {
      isDemo: true,
      properties: props,
      tenants,
      payments,
      maintenance,
      documents,
      reports,
      inspections,
      stats: {
        totalProperties: props.length,
        occupied: occupied.length,
        occupancyRate: Math.round((occupied.length / props.length) * 100),
        monthlyRevenue,
        paidTotal,
        pendingTotal,
        activeRequests: maintenance.filter((m) => m.status === 'pending' || m.status === 'in_progress').length,
        documentsCount: documents.length
      }
    };
  }

  function isDemoForcedOff() {
    return sessionStorage.getItem(DEMO_KEY) === 'off';
  }

  function enableDemo() {
    sessionStorage.setItem(DEMO_KEY, 'on');
  }

  function disableDemo() {
    sessionStorage.setItem(DEMO_KEY, 'off');
  }

  function isDemoOn() {
    return sessionStorage.getItem(DEMO_KEY) === 'on';
  }

  /**
   * Load portfolio: real Supabase data if present, else demo sample.
   */
  async function loadPortfolio(client, userId, role) {
    role = role || sessionStorage.getItem('rentcan_role') || 'landlord';

    if (isDemoOn() && !isDemoForcedOff()) {
      return getDemoPortfolio();
    }

    let properties = [];
    let queryError = false;

    try {
      if (role === 'tenant') {
        const { data: tenancies, error } = await client
          .from('tenants')
          .select('*, properties(*)')
          .eq('user_id', userId);
        if (error) throw error;
        properties = (tenancies || []).map((t) => t.properties).filter(Boolean);
      } else {
        const { data, error } = await client
          .from('properties')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        properties = data || [];
      }
    } catch (e) {
      console.warn('Portfolio properties query failed:', e);
      queryError = true;
    }

    // Do not fake a healthy portfolio when the database failed
    if (queryError) {
      return {
        isDemo: false,
        error: true,
        properties: [],
        tenants: [],
        payments: [],
        maintenance: [],
        documents: [],
        reports: [],
        inspections: [],
        stats: {
          totalProperties: 0,
          occupied: 0,
          occupancyRate: 0,
          monthlyRevenue: 0,
          paidTotal: 0,
          pendingTotal: 0,
          activeRequests: 0,
          documentsCount: 0
        }
      };
    }

    if (!properties.length && !isDemoForcedOff()) {
      enableDemo();
      return getDemoPortfolio();
    }

    if (properties.length) {
      disableDemo();
    }

    let payments = [];
    let maintenance = [];
    let documents = [];
    try {
      const { data: pays } = await client
        .from('payments')
        .select('*, properties!inner(name, owner_id)')
        .eq('properties.owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      payments = pays || [];
    } catch (_) {}

    try {
      const { data: mnt } = await client
        .from('maintenance_requests')
        .select('*, properties!inner(name, owner_id)')
        .eq('properties.owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      maintenance = mnt || [];
    } catch (_) {}

    try {
      const { data: docs } = await client
        .from('documents')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      documents = docs || [];
    } catch (_) {}

    const occupied = properties.filter((p) => p.status === 'occupied');
    const monthlyRevenue = occupied.reduce((s, p) => s + Number(p.rent_amount || 0), 0);
    const paidTotal = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const pendingTotal = payments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0);

    return {
      isDemo: false,
      properties,
      tenants: [],
      payments,
      maintenance,
      documents,
      reports: maintenance.filter((m) => m.category === 'inspection').map((m) => ({
        id: m.id,
        title: m.title,
        property: m.properties?.name || 'Property',
        date: m.created_at,
        summary: m.description || '',
        value: 0,
        type: 'inspection'
      })),
      inspections: [],
      stats: {
        totalProperties: properties.length,
        occupied: occupied.length,
        occupancyRate: properties.length ? Math.round((occupied.length / properties.length) * 100) : 0,
        monthlyRevenue,
        paidTotal,
        pendingTotal,
        activeRequests: maintenance.filter((m) => m.status === 'pending' || m.status === 'in_progress').length,
        documentsCount: documents.length
      }
    };
  }

  function mountDemoBanner(isDemo) {
    const existing = document.getElementById('rc-demo-banner');
    if (!isDemo) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    const bar = document.createElement('div');
    bar.id = 'rc-demo-banner';
    bar.className = 'rc-demo-banner';
    bar.innerHTML = `
      <div class="rc-demo-banner-inner">
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        <span><strong>Sample portfolio</strong> — explore how RentCan looks with Mohali &amp; Aerocity properties.</span>
        <button type="button" class="rc-demo-banner-btn" id="rc-demo-dismiss">Use empty account</button>
      </div>`;
    document.body.prepend(bar);
    document.getElementById('rc-demo-dismiss')?.addEventListener('click', () => {
      disableDemo();
      window.location.reload();
    });
  }

  function initials(name) {
    return String(name || 'RC')
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function statusBadge(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'paid' || s === 'resolved' || s === 'occupied') {
      return `<span class="rc-status rc-status-ok">${s}</span>`;
    }
    if (s === 'pending' || s === 'in_progress' || s === 'vacant') {
      return `<span class="rc-status rc-status-pending">${s.replace('_', ' ')}</span>`;
    }
    if (s === 'overdue') {
      return `<span class="rc-status rc-status-warn">${s}</span>`;
    }
    return `<span class="rc-status">${s}</span>`;
  }

  global.RentCanDemo = {
    getDemoPortfolio,
    loadPortfolio,
    enableDemo,
    disableDemo,
    isDemoOn,
    mountDemoBanner,
    formatINR,
    formatDate,
    initials,
    statusBadge
  };
  global.loadPortfolio = loadPortfolio;
  global.formatINR = formatINR;
  global.formatDate = formatDate;
})(typeof window !== 'undefined' ? window : globalThis);
