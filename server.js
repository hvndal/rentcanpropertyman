require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Bypass (Mocking)
app.get('/api/auth/session', (req, res) => {
    res.json({ owner_id: 'user-1' });
});

// API Routes
app.get('/api/dashboard-stats', (req, res) => {
    const owner_id = 'user-1'; // Mocked

    const stats = {
        totalProperties: 0,
        occupancyRate: 0,
        monthlyRevenue: 0,
        activeRequests: 0
    };

    db.get("SELECT COUNT(*) as total, SUM(CASE WHEN status='occupied' THEN 1 ELSE 0 END) as occupied FROM properties WHERE owner_id=?", [owner_id], (err, propRow) => {
        if (err) return res.status(500).json({error: err.message});

        stats.totalProperties = propRow.total || 0;
        stats.occupancyRate = propRow.total ? ((propRow.occupied / propRow.total) * 100).toFixed(1) : 0;

        db.get(`
            SELECT SUM(p.amount) as revenue
            FROM payments p
            JOIN properties pr ON p.property_id = pr.id
            WHERE pr.owner_id=? AND p.status='paid'
        `, [owner_id], (err, payRow) => {
            if (err) return res.status(500).json({error: err.message});
            stats.monthlyRevenue = payRow.revenue || 0;

            db.get(`
                SELECT COUNT(*) as active_requests
                FROM maintenance_requests mr
                JOIN properties pr ON mr.property_id = pr.id
                WHERE pr.owner_id=? AND mr.status != 'resolved'
            `, [owner_id], (err, mrRow) => {
                if (err) return res.status(500).json({error: err.message});
                stats.activeRequests = mrRow.active_requests || 0;

                res.json(stats);
            });
        });
    });
});

app.get('/api/properties', (req, res) => {
    const owner_id = 'user-1'; // Mocked
    db.all("SELECT * FROM properties WHERE owner_id=?", [owner_id], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.get('/api/activity', (req, res) => {
    const owner_id = 'user-1'; // Mocked

    // Combine payments and maintenance requests for a simple activity feed
    const query = `
        SELECT * FROM (
            SELECT 'payment' as type, p.id, p.created_at, p.amount, p.status as payment_status, pr.name as property_name, null as title
            FROM payments p JOIN properties pr ON p.property_id = pr.id WHERE pr.owner_id = ?
            UNION ALL
            SELECT 'maintenance' as type, m.id, m.created_at, null as amount, m.status as payment_status, pr.name as property_name, m.title
            FROM maintenance_requests m JOIN properties pr ON m.property_id = pr.id WHERE pr.owner_id = ?
        )
        ORDER BY created_at DESC LIMIT 10
    `;

    db.all(query, [owner_id, owner_id], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.get('/api/payments', (req, res) => {
    const owner_id = 'user-1'; // Mocked
    const query = `
        SELECT * FROM (
            SELECT 'payment' as type, p.id, p.created_at, p.amount, p.status as payment_status, pr.name as property_name, null as title
            FROM payments p JOIN properties pr ON p.property_id = pr.id WHERE pr.owner_id = ?
            UNION ALL
            SELECT 'maintenance' as type, m.id, m.created_at, null as amount, m.status as payment_status, pr.name as property_name, m.title
            FROM maintenance_requests m JOIN properties pr ON m.property_id = pr.id WHERE pr.owner_id = ?
        )
        ORDER BY created_at DESC LIMIT 10
    `;
    db.all(query, [owner_id], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});


// --- CRUD for Properties ---
app.post('/api/properties', (req, res) => {
    const { name, address, plan, rent_amount, beds, baths, sqft, status } = req.body;
    const id = 'prop-' + Date.now();
    const created_at = new Date().toISOString();
    const owner_id = 'user-1';

    db.run("INSERT INTO properties (id, created_at, owner_id, name, address, plan, rent_amount, beds, baths, sqft, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        [id, created_at, owner_id, name, address, plan, rent_amount, beds, baths, sqft, status],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ id, message: 'Property created' });
        }
    );
});

app.put('/api/properties/:id', (req, res) => {
    const { name, address, plan, rent_amount, beds, baths, sqft, status } = req.body;
    db.run("UPDATE properties SET name=?, address=?, plan=?, rent_amount=?, beds=?, baths=?, sqft=?, status=? WHERE id=? AND owner_id='user-1'",
        [name, address, plan, rent_amount, beds, baths, sqft, status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ message: 'Property updated' });
        }
    );
});

app.delete('/api/properties/:id', (req, res) => {
    db.run("DELETE FROM properties WHERE id=? AND owner_id='user-1'", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Property deleted' });
    });
});

// --- CRUD for Tenants ---
app.get('/api/tenants', (req, res) => {
    db.all("SELECT t.* FROM tenants t JOIN properties p ON t.property_id = p.id WHERE p.owner_id='user-1'", [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/tenants', (req, res) => {
    const { property_id, email, phone, rent_due_date, rent_amount } = req.body;
    const id = 'tenant-' + Date.now();
    const created_at = new Date().toISOString();

    db.run("INSERT INTO tenants (id, created_at, property_id, email, phone, rent_due_date, rent_amount) VALUES (?,?,?,?,?,?,?)",
        [id, created_at, property_id, email, phone, rent_due_date, rent_amount],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ id, message: 'Tenant created' });
        }
    );
});

app.put('/api/tenants/:id', (req, res) => {
    const { email, phone, rent_due_date, rent_amount } = req.body;
    db.run("UPDATE tenants SET email=?, phone=?, rent_due_date=?, rent_amount=? WHERE id=?",
        [email, phone, rent_due_date, rent_amount, req.params.id],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ message: 'Tenant updated' });
        }
    );
});

app.delete('/api/tenants/:id', (req, res) => {
    db.run("DELETE FROM tenants WHERE id=?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Tenant deleted' });
    });
});

// --- CRUD for Maintenance Requests ---
app.get('/api/maintenance', (req, res) => {
    db.all("SELECT m.*, p.name as property_name FROM maintenance_requests m JOIN properties p ON m.property_id = p.id WHERE p.owner_id='user-1'", [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/maintenance', (req, res) => {
    const { property_id, tenant_id, title, description, category, priority } = req.body;
    const id = 'mr-' + Date.now();
    const created_at = new Date().toISOString();

    db.run("INSERT INTO maintenance_requests (id, created_at, property_id, tenant_id, title, description, category, priority) VALUES (?,?,?,?,?,?,?,?)",
        [id, created_at, property_id, tenant_id, title, description, category, priority],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ id, message: 'Maintenance request created' });
        }
    );
});

app.put('/api/maintenance/:id', (req, res) => {
    const { status, priority, title, description } = req.body;
    db.run("UPDATE maintenance_requests SET status=?, priority=?, title=?, description=? WHERE id=?",
        [status, priority, title, description, req.params.id],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ message: 'Maintenance request updated' });
        }
    );
});

app.delete('/api/maintenance/:id', (req, res) => {
    db.run("DELETE FROM maintenance_requests WHERE id=?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Maintenance request deleted' });
    });
});

// --- CRUD for Payments (POST/PUT/DELETE) ---
app.post('/api/payments', (req, res) => {
    const { property_id, tenant_id, amount, due_date } = req.body;
    const id = 'pay-' + Date.now();
    const created_at = new Date().toISOString();

    db.run("INSERT INTO payments (id, created_at, property_id, tenant_id, amount, due_date) VALUES (?,?,?,?,?,?)",
        [id, created_at, property_id, tenant_id, amount, due_date],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ id, message: 'Payment created' });
        }
    );
});

app.put('/api/payments/:id', (req, res) => {
    const { status, paid_at } = req.body;
    db.run("UPDATE payments SET status=?, paid_at=? WHERE id=?",
        [status, paid_at, req.params.id],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ message: 'Payment updated' });
        }
    );
});

app.delete('/api/payments/:id', (req, res) => {
    db.run("DELETE FROM payments WHERE id=?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Payment deleted' });
    });
});


// Fallback to index.html for SPA routing if needed
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
