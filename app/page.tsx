import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Boarding Place
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Sri Lanka&apos;s trusted platform for finding property, land, anexxes and rooms for rent
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/property-land"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
            >
              <span>🏠</span> Property and Land
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-600/50 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-300"
            >
              <span>📝</span> List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">BoardLanka</span>?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            We make finding your next home simple, safe, and stress-free
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Easy Search</h3>
              <p className="text-gray-400">
                Find property, land, anexxes and rooms across Sri Lanka with our powerful search filters
              </p>
            </div>
            <div className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verified Listings</h3>
              <p className="text-gray-400">
                All properties are verified to ensure you get genuine and safe options
              </p>
            </div>
            <div className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Direct Contact</h3>
              <p className="text-gray-400">
                Connect directly with property owners without any middlemen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            Popular <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Locations</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Explore properties in top cities across Sri Lanka
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Colombo", "Homagama", "Biyagama", "Katunayaka", "Galle", "Jaffna"].map(
              (location) => (
                <Link
                  key={location}
                  href={`/property-land?location=${location.toLowerCase()}`}
                  className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl text-center hover:transform hover:scale-105 transition-all duration-300 border border-gray-700/50 hover:border-emerald-500/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300"></div>
                  <span className="font-semibold text-white relative z-10">{location}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">1000+</div>
                <div className="text-gray-400">Active Listings</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-gray-400">Happy Tenants</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">50+</div>
                <div className="text-gray-400">Cities Covered</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-gray-400">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Perfect Place</span>?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of satisfied users who found their ideal boarding through BoardLanka
          </p>
          <Link
            href="/signup"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
