import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';
import { Building2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const defaultFilters = {
  search: '',
  location: '',
  type: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  furnished: '',
};

const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    document.title = 'Properties — PropConnect';
  }, []);

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      Object.entries(appliedFilters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          params[k] = v;
        }
      });

      const { data } = await api.get('/properties', { params });
      setProperties(data.data);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchProperties(1);
  }, [fetchProperties]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Debounce the filters: wait 500ms after the user stops interacting before hitting the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  return (
    <div className="page-container section">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Browse Properties</h1>
        <p className="text-slate-400 text-sm">
          {loading ? 'Loading...' : `${pagination.total} properties found in Hyderabad`}
        </p>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-400">Fetching properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={64} className="mx-auto text-slate-700 mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No properties found</h3>
          <p className="text-slate-600 text-sm mb-6">Try adjusting your filters or search terms.</p>
          <button onClick={handleReset} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="property-grid">
            {properties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => fetchProperties(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn-secondary px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchProperties(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'btn-secondary !px-0'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => fetchProperties(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn-secondary px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Properties;
