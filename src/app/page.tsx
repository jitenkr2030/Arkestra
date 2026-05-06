import Link from 'next/link'
import { Music, Calendar, Users, CreditCard, Bell, BookOpen, Building, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-violet-500" />
              <span className="text-xl font-bold text-white">Arkestra</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Orchestra Management
              <span className="block text-violet-500">Made Simple</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-300 mb-8">
              A comprehensive platform for managing orchestras, events, members, and bookings.
              Streamline your orchestra operations with powerful tools and intuitive design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 transition-colors"
              >
                Start Managing Your Orchestra
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg text-violet-300 border border-violet-500/50 hover:bg-violet-500/10 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to manage your orchestra efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Calendar}
              title="Event Management"
              description="Schedule and organize concerts, rehearsals, and performances with ease"
            />
            <FeatureCard
              icon={Users}
              title="Member Management"
              description="Track orchestra members, their instruments, and roles within the organization"
            />
            <FeatureCard
              icon={Clock}
              title="Availability Tracking"
              description="Members can manage their schedules and availability for events"
            />
            <FeatureCard
              icon={CreditCard}
              title="Payment Tracking"
              description="Monitor payments, invoices, and financial transactions"
            />
            <FeatureCard
              icon={Bell}
              title="Notifications"
              description="Stay updated with real-time notifications for bookings and events"
            />
            <FeatureCard
              icon={BookOpen}
              title="Repertoire Library"
              description="Maintain a comprehensive library of musical pieces and compositions"
            />
            <FeatureCard
              icon={Building}
              title="Client CRM"
              description="Manage clients with booking history and contact information"
            />
            <FeatureCard
              icon={Music}
              title="Orchestra Setup"
              description="Configure your orchestra details, contact info, and branding"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get started with Arkestra in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sign Up</h3>
              <p className="text-slate-400">
                Create your account and set up your orchestra profile
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Add Members</h3>
              <p className="text-slate-400">
                Import your orchestra members and their details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Managing</h3>
              <p className="text-slate-400">
                Create events, manage bookings, and track payments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Music className="h-6 w-6 text-violet-500" />
              <span className="text-lg font-bold text-white">Arkestra</span>
            </div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Arkestra. Built for orchestra management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-violet-500/50 transition-colors">
      <Icon className="h-10 w-10 text-violet-500 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  )
}