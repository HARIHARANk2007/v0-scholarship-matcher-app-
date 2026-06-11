import { scholarshipsData } from "./scholarships-data"

// ==========================================
// 🔌 Prisma Client - Database Connection
// ==========================================

const hasDbUrl = !!process.env.DATABASE_URL;

let dbInstance: any;

if (hasDbUrl) {
  const pg = require("pg")
  const { PrismaPg } = require("@prisma/adapter-pg")
  const { PrismaClient } = require("@prisma/client")

  const globalForPrisma = globalThis as unknown as {
    prisma: any
    pool: any
  }

  const pool = globalForPrisma.pool ?? new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)

  dbInstance = globalForPrisma.prisma ?? new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = dbInstance
    globalForPrisma.pool = pool
  }
} else {
  // Fallback in-memory database mock for local development without Postgres
  console.warn("⚠️ No DATABASE_URL found. Running with in-memory mock database.");

  const inMemoryUsers: any[] = [
    {
      id: "demo-user-id",
      name: "Arjun Kumar",
      email: "arjun.kumar@example.com",
      password: "$2b$10$q4PA0FsH0J9NGJGdGa0sCuVC5kHB0YfsbiD6IpibX1DcrG7oeOdhe", // bcrypt hash for 'password123'
      phone: "9876543210",
      class: "12",
      percentage: 87.0,
      income: 150000,
      category: "OBC",
      state: "Tamil Nadu",
      schoolType: "Govt Aided",
    }
  ];

  // Map shared scholarships to have s1, s2, etc. string IDs
  const inMemoryScholarships = scholarshipsData.map((s, index) => ({
    id: `s${index + 1}`,
    ...s
  }));

  const inMemoryApplications: any[] = [];
  const inMemoryDocuments: any[] = [];

  dbInstance = {
    user: {
      findUnique: async (args: any) => {
        const { email, id } = args.where;
        return inMemoryUsers.find(u => (email && u.email === email) || (id && u.id === id)) || null;
      },
      findMany: async (args?: any) => {
        return inMemoryUsers;
      },
      create: async (args: any) => {
        const newUser = {
          id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.data,
        };
        inMemoryUsers.push(newUser);
        return newUser;
      },
      update: async (args: any) => {
        const { id } = args.where;
        const userIndex = inMemoryUsers.findIndex(u => u.id === id);
        if (userIndex !== -1) {
          inMemoryUsers[userIndex] = {
            ...inMemoryUsers[userIndex],
            ...args.data,
            updatedAt: new Date(),
          };
          return inMemoryUsers[userIndex];
        }
        throw new Error("User not found");
      },
      count: async () => inMemoryUsers.length,
    },
    scholarship: {
      findMany: async (args?: any) => {
        return inMemoryScholarships;
      },
      findUnique: async (args: any) => {
        return inMemoryScholarships.find(s => s.id === args.where.id) || null;
      },
      create: async (args: any) => {
        const newScholarship = {
          id: `s${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.data,
        };
        inMemoryScholarships.push(newScholarship);
        return newScholarship;
      },
      update: async (args: any) => {
        const idx = inMemoryScholarships.findIndex(s => s.id === args.where.id);
        if (idx === -1) throw new Error("Scholarship not found");
        inMemoryScholarships[idx] = {
          ...inMemoryScholarships[idx],
          ...args.data,
          updatedAt: new Date(),
        };
        return inMemoryScholarships[idx];
      },
      delete: async (args: any) => {
        const idx = inMemoryScholarships.findIndex(s => s.id === args.where.id);
        if (idx === -1) throw new Error("Scholarship not found");
        const deleted = inMemoryScholarships[idx];
        inMemoryScholarships.splice(idx, 1);
        return deleted;
      },
      count: async () => inMemoryScholarships.length,
    },
    application: {
      findMany: async (args: any) => {
        const { userId } = args.where || {};
        if (userId) {
          return inMemoryApplications.filter(a => a.userId === userId);
        }
        return inMemoryApplications;
      },
      count: async (args?: any) => {
        const { userId } = args?.where || {};
        if (userId) {
          return inMemoryApplications.filter(a => a.userId === userId).length;
        }
        return inMemoryApplications.length;
      },
      create: async (args: any) => {
        const newApp = {
          id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.data,
        };
        inMemoryApplications.push(newApp);
        return newApp;
      }
    },
    document: {
      findMany: async (args?: any) => {
        const { userId } = args?.where || {};
        if (userId) {
          return inMemoryDocuments.filter(d => d.userId === userId);
        }
        return inMemoryDocuments;
      },
      count: async (args?: any) => {
        const { userId } = args?.where || {};
        if (userId) {
          return inMemoryDocuments.filter(d => d.userId === userId).length;
        }
        return inMemoryDocuments.length;
      },
      create: async (args: any) => {
        const newDoc = {
          id: Math.random().toString(36).substring(7),
          uploadedAt: new Date(),
          ...args.data,
        };
        inMemoryDocuments.push(newDoc);
        return newDoc;
      }
    }
  };
}

export const db = dbInstance;
export default db;
