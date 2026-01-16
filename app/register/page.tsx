"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Mail, Lock, User, Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Real-time validation states
  const [validations, setValidations] = useState({
    nameValid: false,
    emailValid: false,
    passwordLength: false,
    passwordsMatch: false,
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Real-time validation
    if (name === "name") {
      setValidations((prev) => ({ ...prev, nameValid: value.length >= 2 }))
    }
    if (name === "email") {
      setValidations((prev) => ({ ...prev, emailValid: validateEmail(value) }))
    }
    if (name === "password") {
      setValidations((prev) => ({
        ...prev,
        passwordLength: value.length >= 6,
        passwordsMatch: value === formData.confirmPassword && value.length > 0,
      }))
    }
    if (name === "confirmPassword") {
      setValidations((prev) => ({
        ...prev,
        passwordsMatch: value === formData.password && value.length > 0,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Final validation
    if (!validations.nameValid) {
      setError("Name must be at least 2 characters")
      setIsLoading(false)
      return
    }
    if (!validations.emailValid) {
      setError("Please enter a valid email")
      setIsLoading(false)
      return
    }
    if (!validations.passwordLength) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }
    if (!validations.passwordsMatch) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setIsLoading(false)
        return
      }

      // Redirect to login on success
      router.push("/login?registered=true")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  const ValidationIcon = ({ valid }: { valid: boolean }) =>
    valid ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-slate-300" />
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-12">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
          <p className="text-sm text-slate-500 mt-2">Join ScholarMatch and find scholarships</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                Full Name
                <ValidationIcon valid={validations.nameValid} />
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Arjun Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 ${
                    formData.name && (validations.nameValid ? "border-green-500 focus:ring-green-500" : "border-red-300")
                  }`}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                Email Address
                <ValidationIcon valid={validations.emailValid} />
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="arjun@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${
                    formData.email && (validations.emailValid ? "border-green-500 focus:ring-green-500" : "border-red-300")
                  }`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                Password
                <ValidationIcon valid={validations.passwordLength} />
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 ${
                    formData.password && (validations.passwordLength ? "border-green-500 focus:ring-green-500" : "border-red-300")
                  }`}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                Confirm Password
                <ValidationIcon valid={validations.passwordsMatch} />
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 ${
                    formData.confirmPassword && (validations.passwordsMatch ? "border-green-500 focus:ring-green-500" : "border-red-300")
                  }`}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              disabled={isLoading || !validations.nameValid || !validations.emailValid || !validations.passwordLength || !validations.passwordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
