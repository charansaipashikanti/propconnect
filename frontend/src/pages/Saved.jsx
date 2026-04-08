import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Heart, Loader2, Building2 } from 'lucide-react';

const Saved = () => {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    document.title = 'Saved Properties — PropConnect';
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/saved');
      setSavedProperties(data.data);
      setSavedIds(data.data.map((p) => p._id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = (propertyId) => {
    // Optimistically remove from saved list when unsaved
    setSavedProperties((prev) => prev.filter((p) => p._id !== propertyId));
    setSavedIds((prev) => prev.filter((id) => id !== propertyId));
  };

  return (
    <div className="page-container section">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <Heart className="text-red-400" size={28} />
          Saved Properties
        </h1>
        <p className="text-slate-400 text-sm">
          {loading
            ? 'Loading...'
            : `${savedProperties.length} saved propert${savedProperties.length !== 1 ? 'ies' : 'y'} in your shortlist`}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-400">Loading your saved properties...</p>
        </div>
      ) : savedProperties.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <Heart size={36} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-300 mb-2">No saved properties yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            Browse properties and click the{' '}
            <Heart size={13} className="inline text-red-400" /> heart icon to shortlist your
            favourites — they'll appear here.
          </p>
          <Link to="/properties" className="btn-primary gap-2">
            <Building2 size={16} />
            Browse Properties
          </Link>
        </div>
      ) : (
        <>
          {/* Info banner */}
          {/* <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-red-300">
            <Heart size={15} className="shrink-0 text-red-400" />
            Click the heart icon on any card to remove it from your shortlist.
          </div> */}

          <div className="property-grid">
            {savedProperties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                savedIds={savedIds}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Saved;
