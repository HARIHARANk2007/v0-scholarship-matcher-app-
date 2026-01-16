import { PrismaClient } from "@prisma/client/default"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

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
    },
  })
  console.log("✅ Created user:", user.name)

  // Create scholarships
  const scholarships = await prisma.scholarship.createMany({
    data: [
      {
        name: "VidyaSamarth National Merit Scholarship",
        amount: 25000,
        description: "For meritorious students from rural backgrounds with strong academic performance.",
        eligibility: "Class 12 students with 80%+ marks from govt/aided schools",
        deadline: new Date("2025-03-10"),
        tags: ["Merit Based", "Rural"],
        minPercentage: 80,
        maxIncome: 300000,
        categories: ["OBC", "SC", "ST", "General"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided"],
      },
      {
        name: "Tata Udaan Grant",
        amount: 18000,
        description: "Supporting students from government schools to pursue higher education.",
        eligibility: "Students from govt schools with family income below 2.5 LPA",
        deadline: new Date("2025-03-18"),
        tags: ["Need Based", "Govt School"],
        minPercentage: 60,
        maxIncome: 250000,
        categories: ["OBC", "SC", "ST", "General"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided"],
      },
      {
        name: "Inspire Young Achievers Program",
        amount: 30000,
        description: "For students excelling in science subjects aiming for higher studies in STEM.",
        eligibility: "Science stream students with 85%+ in PCM subjects",
        deadline: new Date("2025-04-15"),
        tags: ["Science", "Merit"],
        minPercentage: 85,
        maxIncome: 500000,
        categories: ["OBC", "SC", "ST", "General"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided", "Private"],
      },
      {
        name: "HDFC Badhte Kadam",
        amount: 15000,
        description: "Financial assistance for students pursuing undergraduate education.",
        eligibility: "Class 12 passed students with 60%+ marks",
        deadline: new Date("2025-05-01"),
        tags: ["General", "Need Based"],
        minPercentage: 60,
        maxIncome: 400000,
        categories: ["General", "OBC"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided", "Private"],
      },
      {
        name: "Keep India Smiling Foundation",
        amount: 20000,
        description: "For students aspiring to pursue medical or dental education.",
        eligibility: "Students with 75%+ marks aspiring for medical/dental courses",
        deadline: new Date("2025-05-20"),
        tags: ["Medical", "Merit"],
        minPercentage: 75,
        maxIncome: 350000,
        categories: ["OBC", "SC", "ST", "General"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided", "Private"],
      },
      {
        name: "Digital India Girl Child Support",
        amount: 22000,
        description: "Empowering girl students to pursue education in technology.",
        eligibility: "Girl students with 70%+ marks interested in IT/CS",
        deadline: new Date("2025-03-30"),
        tags: ["Girls", "Technology"],
        minPercentage: 70,
        maxIncome: 300000,
        categories: ["OBC", "SC", "ST", "General"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided", "Private"],
      },
      {
        name: "NSP Pre-Matric Scholarship for SC",
        amount: 12000,
        description: "National Scholarship Portal scheme for SC students.",
        eligibility: "SC category students with 50%+ marks",
        deadline: new Date("2025-06-30"),
        tags: ["SC Category", "Government"],
        minPercentage: 50,
        maxIncome: 250000,
        categories: ["SC"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided", "Private"],
      },
      {
        name: "Reliance Foundation Scholarship",
        amount: 40000,
        description: "For students from economically weaker sections pursuing UG education.",
        eligibility: "Class 12 students with 80%+ marks, income below 3 LPA",
        deadline: new Date("2025-04-30"),
        tags: ["Merit", "Need Based"],
        minPercentage: 80,
        maxIncome: 300000,
        categories: ["OBC", "SC", "ST", "General"],
        states: [],
        schoolTypes: ["Govt", "Govt Aided", "Private"],
      },
    ],
  })
  console.log("✅ Created", scholarships.count, "scholarships")

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

  console.log("🎉 Seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
