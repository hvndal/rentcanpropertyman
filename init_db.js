const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFile = './data/database.sqlite';

if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
}

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
    // 1. Create Profiles
    db.run(`
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            updated_at TEXT,
            full_name TEXT,
            avatar_url TEXT,
            phone_number TEXT,
            role TEXT DEFAULT 'landlord'
        )
    `);

    // 2. Create Properties
    db.run(`
        CREATE TABLE IF NOT EXISTS properties (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            name TEXT NOT NULL,
            address TEXT,
            plan TEXT DEFAULT 'residential',
            rent_amount REAL,
            beds INTEGER,
            baths INTEGER,
            sqft INTEGER,
            status TEXT DEFAULT 'vacant',
            FOREIGN KEY(owner_id) REFERENCES profiles(id) ON DELETE CASCADE
        )
    `);

    // 3. Create Tenants
    db.run(`
        CREATE TABLE IF NOT EXISTS tenants (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            property_id TEXT NOT NULL,
            user_id TEXT,
            email TEXT,
            phone TEXT,
            rent_due_date INTEGER,
            rent_amount REAL,
            FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES profiles(id) ON DELETE SET NULL
        )
    `);

    // 4. Create Payments
    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            property_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            due_date TEXT,
            paid_at TEXT,
            FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
            FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
        )
    `);

    // 5. Create Maintenance Requests
    db.run(`
        CREATE TABLE IF NOT EXISTS maintenance_requests (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            property_id TEXT NOT NULL,
            tenant_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
            FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
        )
    `);

    // Insert Mock Data
    const now = new Date().toISOString();

    db.run(`INSERT INTO profiles (id, full_name, role) VALUES ('user-1', 'Mock Landlord', 'landlord')`);

    // Properties
    db.run(`INSERT INTO properties (id, created_at, owner_id, name, address, rent_amount, beds, baths, sqft, status) VALUES
        ('prop-1', '${now}', 'user-1', 'The Heights #402', '123 Main St', 2450.00, 2, 2, 1100, 'occupied')`);
    db.run(`INSERT INTO properties (id, created_at, owner_id, name, address, rent_amount, beds, baths, sqft, status) VALUES
        ('prop-2', '${now}', 'user-1', 'Lakeside Apts #12', '456 Lake Rd', 3100.00, 3, 2, 1500, 'occupied')`);
    db.run(`INSERT INTO properties (id, created_at, owner_id, name, address, rent_amount, beds, baths, sqft, status) VALUES
        ('prop-3', '${now}', 'user-1', 'North Star Loft #2', '789 North St', 1950.00, 1, 1, 800, 'vacant')`);

    // Tenants
    db.run(`INSERT INTO tenants (id, created_at, property_id, email, phone, rent_due_date, rent_amount) VALUES
        ('tenant-1', '${now}', 'prop-1', 'sarah.jenkins@example.com', '555-0101', 1, 2450.00)`);
    db.run(`INSERT INTO tenants (id, created_at, property_id, email, phone, rent_due_date, rent_amount) VALUES
        ('tenant-2', '${now}', 'prop-2', 'david.chen@example.com', '555-0202', 5, 3100.00)`);

    // Payments
    db.run(`INSERT INTO payments (id, created_at, property_id, tenant_id, amount, status, due_date, paid_at) VALUES
        ('pay-1', '${now}', 'prop-1', 'tenant-1', 2450.00, 'paid', '2024-09-01', '2024-08-28')`);
    db.run(`INSERT INTO payments (id, created_at, property_id, tenant_id, amount, status, due_date) VALUES
        ('pay-2', '${now}', 'prop-2', 'tenant-2', 3100.00, 'pending', '2024-09-05')`);
    db.run(`INSERT INTO payments (id, created_at, property_id, tenant_id, amount, status, due_date, paid_at) VALUES
        ('pay-3', '${now}', 'prop-1', 'tenant-1', 2450.00, 'paid', '2024-08-01', '2024-07-28')`);

    // Maintenance
    db.run(`INSERT INTO maintenance_requests (id, created_at, property_id, tenant_id, title, description, category, status, priority) VALUES
        ('mr-1', '${now}', 'prop-1', 'tenant-1', 'Water Leak in Kitchen', 'The sink is leaking underneath.', 'plumbing', 'pending', 'high')`);
    db.run(`INSERT INTO maintenance_requests (id, created_at, property_id, tenant_id, title, description, category, status, priority) VALUES
        ('mr-2', '${now}', 'prop-2', 'tenant-2', 'Broken AC', 'AC is blowing warm air.', 'appliance', 'in_progress', 'high')`);

    console.log("Database initialized successfully with mock data.");
});

db.close();
