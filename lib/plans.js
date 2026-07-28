/**
 * RentCan subscription / service plans (amounts in paise for Razorpay).
 */
const PLANS = {
  residential: {
    id: 'residential',
    name: 'Residential Property Management',
    description: 'Monthly on-ground management for 1 residential property (Mohali / Chandigarh / Tricity).',
    amountPaise: 149900,
    amountInr: 1499,
    interval: 'month',
    currency: 'INR'
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial Property Management',
    description: 'Monthly on-ground management for 1 commercial property.',
    amountPaise: 199900,
    amountInr: 1999,
    interval: 'month',
    currency: 'INR'
  },
  additional: {
    id: 'additional',
    name: 'Additional Property',
    description: 'Add-on for one extra property on an active plan.',
    amountPaise: 79900,
    amountInr: 799,
    interval: 'month',
    currency: 'INR'
  },
  sos: {
    id: 'sos',
    name: 'SOS Inspection Visit',
    description: 'One on-demand inspection visit (dispatched within working hours).',
    amountPaise: 50000,
    amountInr: 500,
    interval: 'one_time',
    currency: 'INR'
  }
};

function getPlan(planId) {
  const id = String(planId || '').trim().toLowerCase();
  return PLANS[id] || null;
}

function listPlans() {
  return Object.values(PLANS);
}

module.exports = { PLANS, getPlan, listPlans };
