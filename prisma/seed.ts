import { PrismaClient } from "@prisma/client/default"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import { scholarshipsData } from "../lib/scholarships-data"

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database with real Indian scholarships...")

  // Clear existing data
  await prisma.application.deleteMany()
  await prisma.document.deleteMany()
  await prisma.scholarship.deleteMany()
  await prisma.user.deleteMany()

  // Hash password for demo user
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create sample user with hashed password
  const user = await prisma.user.create({
    data: {
      name: "Arjun Kumar",
      email: "arjun.kumar@example.com",
      password: hashedPassword,
      phone: "9876543210",
      class: "12",
      percentage: 87.0,
      income: 150000,
      category: "OBC",
      state: "Tamil Nadu",
      schoolType: "Govt Aided",
      role: "student",
    },
  })
  console.log("✅ Created user:", user.name)

  // Create sample admin user with hashed password
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@edubridge.com",
      password: hashedPassword,
      phone: "9999999999",
      role: "admin",
      category: "General",
      state: "Tamil Nadu",
      schoolType: "Govt",
    },
  })
  console.log("✅ Created admin user:", adminUser.name)

  // Create scholarships from shared data
  const scholarships = await prisma.scholarship.createMany({
    data: scholarshipsData,
  })
  console.log("✅ Created", scholarships.count, "real Indian scholarships")

  // Create sample applications
  const allScholarships = await prisma.scholarship.findMany({ take: 3 })
  
  for (const scholarship of allScholarships) {
    await prisma.application.create({
      data: {
        userId: user.id,
        scholarshipId: scholarship.id,
        status: "PENDING",
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
      },
    })
  }
  console.log("✅ Created sample applications")

  // Create sample document
  await prisma.document.create({
    data: {
      userId: user.id,
      type: "MARKSHEET",
      fileName: "Marksheet_Class12.pdf",
      fileUrl: "/uploads/sample-marksheet.pdf",
      extractedData: {
        name: "Arjun Kumar",
        class: "12",
        percentage: 87.0,
        subjects: [
          { name: "Math", marks: 88 },
          { name: "Physics", marks: 91 },
          { name: "Chemistry", marks: 84 },
          { name: "English", marks: 78 },
          { name: "Computer Science", marks: 94 },
        ],
      },
    },
  })
  console.log("✅ Created sample document")

  console.log("🎉 Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
