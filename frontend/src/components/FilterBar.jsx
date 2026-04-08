import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const LOCATIONS = [
  'Gachibowli', 'Hitech City', 'Banjara Hills', 'Jubilee Hills',
  'Madhapur', 'Kondapur', 'Manikonda', 'Kukatpally', 'Begumpet',
  'Secunderabad', 'Shamshabad', 'Miyapur', 'Nallagandla',
];

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'];
const FURNISHED_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

const FilterBar = ({ filters, onChange, onReset }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => v && v !== '').length;

  return (
    <div className="glass-card p-4 mb-6">
      {/* Search + toggle row */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search location, amenities, builder, type..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`btn-secondary gap-2 whitespace-nowrap ${expanded ? 'border-blue-500/50 text-blue-400' : ''}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={onReset} className="btn-secondary text-red-400 border-red-500/30 gap-1 px-3">
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-white/8">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Location</label>
            <select
              className="select-field"
              value={filters.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Property Type</label>
            <select
              className="select-field"
              value={filters.type || ''}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Status</label>
            <select
              className="select-field"
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="">Any Status</option>
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Min Price (₹ Lakhs)</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 40"
              value={filters.minPrice ? filters.minPrice / 100000 : ''}
              onChange={(e) => handleChange('minPrice', e.target.value ? e.target.value * 100000 : '')}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Max Price (₹ Lakhs)</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 200"
              value={filters.maxPrice ? filters.maxPrice / 100000 : ''}
              onChange={(e) => handleChange('maxPrice', e.target.value ? e.target.value * 100000 : '')}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Bedrooms</label>
            <select
              className="select-field"
              value={filters.bedrooms || ''}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} BHK</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Furnished</label>
            <select
              className="select-field"
              value={filters.furnished || ''}
              onChange={(e) => handleChange('furnished', e.target.value)}
            >
              <option value="">Any</option>
              {FURNISHED_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
