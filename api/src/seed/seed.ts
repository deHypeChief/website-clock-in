import connectDB from "../configs/db.config";
import { SessionClient } from "../components/auth/_model";
import { Admin } from "../components/admin/_model";
import { Employee } from "../components/employees/_model";

async function run() {
  await connectDB();

  const adminEmail = Bun.env.SEED_ADMIN_EMAIL || "superadmin@example.com";
  const adminPassword = Bun.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const adminFullName = Bun.env.SEED_ADMIN_FULLNAME || "Super Admin";

  let adminClient = await SessionClient.findOne({ email: adminEmail });
  if (!adminClient) {
    adminClient = await SessionClient.create({
      email: adminEmail,
      password: adminPassword,
      fullName: adminFullName,
      role: ["admin"],
      isEmailVerified: true
    });
  }

  let superAdmin = await Admin.findOne({ sessionClientId: adminClient._id });
  if (!superAdmin) {
    superAdmin = await Admin.create({
      sessionClientId: adminClient._id,
      adminTitle: "SUPER ADMIN",
      permissions: ["all"],
      isSuperAmdin: true
    });
  }

  const employeeSeeds = [
    { email: "employee1@example.com", fullName: "Employee One", employeeId: "E001", department: "Engineering", title: "Developer" },
    { email: "employee2@example.com", fullName: "Employee Two", employeeId: "E002", department: "Operations", title: "Analyst" }
  ];

  for (const e of employeeSeeds) {
    let sc = await SessionClient.findOne({ email: e.email });
    if (!sc) {
      sc = await SessionClient.create({ email: e.email, password: "Password123!", fullName: e.fullName, role: ["employee"], isEmailVerified: true });
    }
    const exists = await Employee.findOne({ sessionClientId: sc._id });
    if (!exists) {
      await Employee.create({ sessionClientId: sc._id, employeeId: e.employeeId, department: e.department, title: e.title });
    }
  }

  console.log("Seed complete");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
