import path from "node:path"
import { defineConfig } from "prisma/config"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },

  migrate: {
    async url() {
      return process.env.DIRECT_URL || process.env.DATABASE_URL!
    },
  },
})
