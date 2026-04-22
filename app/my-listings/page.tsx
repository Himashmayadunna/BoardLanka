'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Property {
  id: string | number;
  title: string;
  location: string;
  area?: string;
  price: number;
  advancePayment?: number;
  bedrooms: number;
  bathrooms?: number;
  size?: number;
  type: string;
  images: string[];
  amenities: string[];
  description: string;
  seller: {
    id?: string;
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    verified: boolean;
  };
  available: boolean;
  createdAt?: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
}

interface User {
  id?: string;
  seller_id?: string;
  email?: string;
  name?: string;
}

function MyListingsContent() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/_/backend';

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        setError('Please log in to view your listings');
      }
    } catch (err) {
      console.error('Error reading user from localStorage:', err);
      setError('Failed to load user information');
    }
  }, []);

  useEffect(() => {
    if (!user?.seller_id && !user?.id) {
      setLoading(false);
      return;
    }

    const fetchSellerProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${apiUrl}/api/properties`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch properties: ${response.statusText}`);
        }

        const data = await response.json();

        let allProperties: Property[] = [];
        if (Array.isArray(data)) {
          allProperties = data;
        } else if (data && typeof data === 'object') {
          const propertiesList = data.properties || data.data || [];
          if (Array.isArray(propertiesList)) {
            allProperties = propertiesList;
          }
        }

        const sellerId = user.seller_id || user.id || '';
        const sellerProperties = allProperties.filter(
          (prop) =>
            (sellerId && prop.seller?.id === sellerId) ||
            (sellerId && prop.seller && typeof prop.seller === 'object' && Object.values(prop.seller).includes(sellerId))
        );

        setProperties(sellerProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your listings');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProperties();
  }, [user, apiUrl]);

  const handleDelete = async (propertyId: string | number) => {
    try {
      setDeleting(true);
      setDeleteError(null);

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete property: ${response.statusText}`);
      }

      setProperties(properties.filter((p) => p.id !== propertyId));
      setDeleteConfirm(null);
      setSelectedProperty(null);
    } catch (err) {
      console.error('Error deleting property:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete property');
    } finally {
      setDeleting(false);
    }
  };

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
  };

  const closePropertyDetails = () => {
    setSelectedProperty(null);
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  const nextImage = () => {
    if (selectedProperty && selectedProperty.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty && selectedProperty.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.available).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">{error || 'Please log in to view your listings'}</p>
          <Link
            href="/signin"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      <div className="relative py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">My Listings</h1>
          <p className="text-gray-400 text-center text-lg">Manage your property listings</p>
        </div>
      </div>

      {error && properties.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400/80 text-sm font-medium mb-1">Total Listings</p>
                <p className="text-emerald-400 text-4xl font-bold">{totalListings}</p>
              </div>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-2m-5-10L9 3m6 11l4 2m0-5V3m0 11V3"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500/20 to-teal-500/10 border border-teal-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-400/80 text-sm font-medium mb-1">Active Listings</p>
                <p className="text-teal-400 text-4xl font-bold">{activeListings}</p>
              </div>
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex justify-end">
          <Link
            href="/addproperty"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Property
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="relative h-48">
                  <Image
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {property.moderationStatus && (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          property.moderationStatus === 'approved'
                            ? 'bg-emerald-500 text-white'
                            : property.moderationStatus === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-gray-900'
                        }`}
                      >
                        {property.moderationStatus === 'approved' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {property.moderationStatus === 'rejected' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {property.moderationStatus === 'pending' && (
                          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {property.moderationStatus.charAt(0).toUpperCase() +
                          property.moderationStatus.slice(1)}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                    {property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}
                  </div>
                  {!property.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Unavailable</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{property.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {property.location}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Rs. {property.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openPropertyDetails(property)}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                    >
                      View Details
                    </button>
                    <Link
                      href={`/my-listings/${property.id}/edit`}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(String(property.id))}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🏠</span>
            <h3 className="text-xl font-semibold text-white mb-2">No listings yet</h3>
            <p className="text-gray-400 mb-6">Start by adding your first property to get started</p>
            <Link
              href="/addproperty"
              className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
            >
              Add Your First Property
            </Link>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0 5v1m7.08-6.081A9.001 9.001 0 1112.08 3M9 11h6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Property</h3>
              <p className="text-gray-400">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProperty && !deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={closePropertyDetails}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-64 md:h-96">
              <Image
                src={
                  selectedProperty.images?.[currentImageIndex] ||
                  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                }
                alt={selectedProperty.title}
                fill
                className="object-cover"
                unoptimized
              />

              {selectedProperty.images && selectedProperty.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {selectedProperty.images?.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute top-4 left-4 flex gap-2">
                {selectedProperty.moderationStatus && (
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      selectedProperty.moderationStatus === 'approved'
                        ? 'bg-emerald-500 text-white'
                        : selectedProperty.moderationStatus === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-gray-900'
                    }`}
                  >
                    {selectedProperty.moderationStatus === 'approved' && (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Approved
                      </>
                    )}
                    {selectedProperty.moderationStatus === 'rejected' && (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Rejected
                      </>
                    )}
                    {selectedProperty.moderationStatus === 'pending' && (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Pending Review
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedProperty.title}</h2>
              <p className="text-gray-400 flex items-center gap-1 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {selectedProperty.location}
              </p>

              {(selectedProperty.bedrooms || selectedProperty.bathrooms || selectedProperty.size) && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {selectedProperty.bedrooms && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                      <p className="text-emerald-400 font-semibold text-lg">{selectedProperty.bedrooms}</p>
                      <p className="text-gray-400 text-xs">
                        Bedroom{selectedProperty.bedrooms > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {selectedProperty.bathrooms && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                      <p className="text-emerald-400 font-semibold text-lg">{selectedProperty.bathrooms}</p>
                      <p className="text-gray-400 text-xs">
                        Bathroom{selectedProperty.bathrooms > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {selectedProperty.size && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                      <p className="text-emerald-400 font-semibold text-lg">{selectedProperty.size}</p>
                      <p className="text-gray-400 text-xs">Sq. Ft.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-sm text-emerald-400 font-medium mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    Rs. {selectedProperty.price.toLocaleString()}
                  </p>
                </div>
                {selectedProperty.advancePayment && (
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                    <p className="text-sm text-orange-400 font-medium mb-1">Advance Payment</p>
                    <p className="text-3xl font-bold text-orange-400">
                      Rs. {selectedProperty.advancePayment.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-400/70 mt-1">
                      ({(selectedProperty.advancePayment / selectedProperty.price).toFixed(1)} months advance)
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-400">{selectedProperty.description || 'No description available'}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities?.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-gray-700"
                    >
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6 flex gap-3">
                <Link
                  href={`/my-listings/${selectedProperty.id}/edit`}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-lg font-medium transition-all duration-300 text-center"
                >
                  Edit Property
                </Link>
                <button
                  onClick={() => {
                    setDeleteConfirm(String(selectedProperty.id));
                  }}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  Delete Property
                </button>
                <button
                  onClick={closePropertyDetails}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyListingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      <div className="relative py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="h-10 bg-gray-700/50 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-700/50 rounded-lg w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <Suspense fallback={<MyListingsLoading />}>
      <MyListingsContent />
    </Suspense>
  );
}