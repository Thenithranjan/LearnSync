const User = require('../models/User');

/**
 * Demo Data Seeder.
 * Ensures default demonstration accounts exist for Student, Faculty, and Admin.
 */
async function seedDemoData() {
  try {
    const demoAccounts = [
      {
        name: 'John Student',
        email: 'student@example.com',
        password: 'Password123!',
        role: 'STUDENT',
        department: 'Computer Science'
      },
      {
        name: 'Dr. Alan Faculty',
        email: 'faculty@example.com',
        password: 'Password123!',
        role: 'FACULTY',
        department: 'Computer Science'
      },
      {
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'ADMIN',
        department: 'Administration'
      }
    ];

    for (const acc of demoAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create(acc);
        console.log(`[Seed] Created demo account: ${acc.email} (${acc.role})`);
      }
    }
  } catch (err) {
    console.warn(`[Seed Warning] Could not seed default demo accounts: ${err.message}`);
  }
}

module.exports = seedDemoData;

