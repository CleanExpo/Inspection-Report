import Link from 'next/link';
import JobSourceTracker from '../../components/JobSourceTracker';
import WorkflowAssistant from '../../components/WorkflowAssistant';

export default function DashboardPage() {
  const serviceCards = [
    {
      title: 'Water Damage',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 2l4 4-10 10H8v-4L18 2z" />
        </svg>
      ),
      description: 'Document and manage water damage restoration projects with automated moisture mapping.',
      href: '/services/water-damage'
    },
    {
      title: 'Fire & Smoke',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      description: 'Comprehensive fire and smoke damage assessment with detailed photo documentation.',
      href: '/services/fire-smoke'
    },
    {
      title: 'Mould Remediation',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Track mould assessment and remediation with environmental monitoring.',
      href: '/services/mould'
    }
  ];

  const quickActions = [
    {
      title: 'New Inspection',
      description: 'Start a new property inspection',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: '/inspection/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Voice Notes',
      description: 'Record voice notes for documentation',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      href: '/voice-notes',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Photo Upload',
      description: 'Upload and organize site photos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/photos',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Streamline your restoration projects with our comprehensive tools.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={`${action.color} text-white rounded-lg p-6 transition-transform duration-200 transform hover:scale-105`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">{action.icon}</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">{action.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Service Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Restoration Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceCards.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-blue-600">{service.icon}</div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{service.title}</h3>
                <p className="mt-2 text-gray-600">{service.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Job Source & Documentation */}
        <div className="mt-12">
          <JobSourceTracker />
        </div>

        {/* Workflow Assistant */}
        <div className="mt-8">
          <WorkflowAssistant />
        </div>

        {/* Integration Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">AI-Powered Documentation</h3>
              <p className="mt-2 text-sm text-gray-600">
                Utilize LLMs for automated report generation and data processing.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">LiDAR Integration</h3>
              <p className="mt-2 text-sm text-gray-600">
                Accurate spatial mapping and measurements for detailed reporting.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Real-time Collaboration</h3>
              <p className="mt-2 text-sm text-gray-600">
                Seamless communication between field technicians and office staff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
