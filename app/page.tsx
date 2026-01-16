import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, Search, FileText, CheckCircle2, Star, Shield, Zap, Heart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Heart className="h-3 w-3 mr-2 text-blue-600" />
            Free & Simple for All Students
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Don't Miss Out On <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Money For Your Education.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Thousands of scholarships exist that you don't know about. Simply upload your marksheet and discover
            scholarships you're eligible for—completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg rounded-full border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all bg-transparent"
              >
                View Demo
              </Button>
            </Link>
          </div>

          {/* App Preview Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20"></div>
            <div className="relative rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200/50 bg-white/80">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="mx-auto text-xs font-medium text-slate-400">edubridge.app/dashboard</div>
              </div>
              <div className="p-2 bg-slate-50/50">
                <img
                  src="/dashboard-ui-mockup.jpg"
                  alt="App Dashboard"
                  className="rounded-lg shadow-sm w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
            Helping Students From All Backgrounds Access Education Funding
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos would go here, using placeholders for now */}
            {["IIT Bombay", "Delhi University", "NIT Trichy", "BITS Pilani", "Anna University"].map((name) => (
              <div key={name} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                <Shield className="h-6 w-6" /> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
              Discover scholarships you never knew existed.
            </h2>
            <p className="text-lg text-slate-600">
              Most students miss out on scholarships simply because they don't know about them. We help you find every
              opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Upload className="w-32 h-32 text-blue-600" />
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Simple Upload</h3>
              <p className="text-slate-600 leading-relaxed">
                Just take a photo of your marksheet with your phone. Our system reads it automatically—no typing needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-32 h-32 text-indigo-600" />
              </div>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-600/20">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Discover Hidden Opportunities</h3>
              <p className="text-slate-600 leading-relaxed">
                We search through 500+ scholarships and show you only the ones you qualify for—many you've never heard
                of before.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="w-32 h-32 text-purple-600" />
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-600/20">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Easy Applications</h3>
              <p className="text-slate-600 leading-relaxed">
                Apply to multiple scholarships without filling forms again and again. We remember your information and
                fill it for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-2 text-blue-400">₹1.2 Cr+</div>
              <div className="text-slate-400 font-medium">Scholarships Unlocked</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-2 text-indigo-400">12,000+</div>
              <div className="text-slate-400 font-medium">Students Helped</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-2 text-purple-400">98%</div>
              <div className="text-slate-400 font-medium">Application Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900">
            Real Students, Real Success
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Engineering Student, Small Town",
                text: "I never knew these scholarships existed. EduBridge found ₹50,000 for me that changed everything.",
                stars: 5,
              },
              {
                name: "Rahul Verma",
                role: "First Generation College Student",
                text: "My family couldn't afford my fees. This app found 3 scholarships I qualified for. I won two!",
                stars: 5,
              },
              {
                name: "Anjali Gupta",
                role: "Arts Student",
                text: "So easy to use. I just uploaded my marksheet and found scholarships I never would have known about.",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 text-lg">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Your education matters. Let us help.</h2>
              <p className="text-blue-100 text-xl mb-10">
                Join thousands of students who found scholarships they never knew existed—completely free to use.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 border-none">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg border-blue-400 text-white hover:bg-blue-700 hover:text-white bg-transparent"
                  >
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl text-slate-900 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span>EduBridge+</span>
              </div>
              <p className="text-slate-500 max-w-xs">
                Making education accessible for everyone through smart technology and AI.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-slate-500">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-500">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-slate-400 text-sm">
            © 2025 EduBridge+. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
