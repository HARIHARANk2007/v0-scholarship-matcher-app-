import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"
import { ApplicationPreviewClient } from "./application-preview-client"

export const dynamic = "force-dynamic"

export default async function ApplicationPage() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.warn("⚠️ NextAuth session retrieval failed on application page.", err)
  }

  // Establish default User Profile
  let userProfile = {
    name: "Guest User",
    class: "12",
    percentage: 80,
    income: 200000,
    category: "General",
    state: "Tamil Nadu",
    schoolType: "Govt Aided"
  }

  let documents: string[] = ["Marksheet.pdf", "Income_Certificate.pdf"]

  if (session?.user?.id) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id }
    })
    if (dbUser) {
      userProfile = {
        name: dbUser.name || "Student",
        class: dbUser.class || "12",
        percentage: dbUser.percentage || 80,
        income: dbUser.income || 200000,
        category: dbUser.category || "General",
        state: dbUser.state || "Tamil Nadu",
        schoolType: dbUser.schoolType || "Govt Aided",
      }
    }

    // Fetch actual documents from the DB
    const dbDocs = await db.document.findMany({
      where: { userId: session.user.id }
    })
    if (dbDocs.length > 0) {
      documents = dbDocs.map((d: any) => d.fileName)
    }
  }

  return (
    <ApplicationPreviewClient 
      userProfile={userProfile} 
      initialDocuments={documents} 
      isLoggedIn={!!session?.user} 
    />
  )
}
