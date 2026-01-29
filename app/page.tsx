export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect
            <span className="block text-yellow-300">Boarding Place</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Sri Lanka&apos;s trusted platform for finding rooms, annexes, apartments & houses for rent
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-emerald-700 transition-all duration-300 shadow-lg">
              🏠 Find a Place
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300">
              📝 List Your Property
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose BoardLanka?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Search</h3>
              <p className="text-gray-600">
                Find rooms and properties across Sri Lanka with our powerful search filters
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Verified Listings</h3>
              <p className="text-gray-600">
                All properties are verified to ensure you get genuine and safe options
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Direct Contact</h3>
              <p className="text-gray-600">
                Connect directly with property owners without any middlemen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Popular Locations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Colombo", "Homagama", "Biyagama", "Katunayaka", "Galle", "Jaffna"].map(
              (location) => (
                <div
                  key={location}
                  className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-6 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer shadow-md"
                >
                  <span className="text-2xl mb-2 block">📍</span>
                  <span className="font-semibold">{location}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
