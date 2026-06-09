"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Mail, Lock, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Real-time validation
  const [validations, setValidations] = useState({
    emailValid: false,
    passwordEntered: false,
  })

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please sign in.")
    }
  }, [searchParams])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setValidations((prev) => ({ ...prev, emailValid: validateEmail(value) }))
    setError("")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setValidations((prev) => ({ ...prev, passwordEntered: value.length > 0 }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!validations.emailValid) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
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
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
          <p className="text-sm text-slate-500 mt-2">Sign in to your ScholarMatch account</p>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="arjun@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={`pl-10 ${
                    email && (validations.emailValid ? "border-green-500 focus:ring-green-500" : "border-red-300")
                  }`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                Password
                <ValidationIcon valid={validations.passwordEntered} />
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
              disabled={isLoading || !validations.emailValid || !validations.passwordEntered}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium h-11 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
