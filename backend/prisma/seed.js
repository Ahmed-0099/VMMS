const prisma = require("../src/config/prisma");

async function main() {
  const roles = [
    { name: "ADMIN", description: "Fleet manager and system administrator" },
    { name: "TECHNICIAN", description: "Maintenance technician" },
    { name: "DRIVER", description: "Driver user" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
