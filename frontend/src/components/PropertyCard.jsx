import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  GitCompareArrows,
  Heart,
  Star,
  CheckCircle2,
  X,
} from 'lucide-react';

const PropertyCard = ({ property, onSaveToggle }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { user, updateSavedProperties } = useAuth();
  const [savingId, setSavingId] = useState(null);
  const [imageError, setImageError] = useState(false);

  const inCompare = isInCompare(property._id);
  const isSaved = user?.savedProperties?.some(s => 
    (typeof s === 'object' ? s._id : s) === property._id
  ) || false;

  const handleCompare = () => {
    if (inCompare) {
      removeFromCompare(property._id);
    } else {
      addToCompare(property);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to save properties');
      return;
    }
    setSavingId(property._id);
    try {
      let updatedSaved = user.savedProperties || [];
      if (isSaved) {
        await api.delete(`/saved/${property._id}`);
        updatedSaved = updatedSaved.filter(s => (typeof s === 'object' ? s._id : s) !== property._id);
        toast.success('Removed from saved');
      } else {
        await api.post(`/saved/${property._id}`);
        updatedSaved = [...updatedSaved, property._id];
        toast.success('Property saved!');
      }
      updateSavedProperties(updatedSaved);
      if (onSaveToggle) onSaveToggle(property._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSavingId(null);
    }
  };

  const fallbackImage = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format`;

  const formatPrice = (price, priceLabel) => {
    if (priceLabel) return priceLabel;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imageError ? fallbackImage : (property.images?.[0] || fallbackImage)}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`badge ${property.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
            {property.status}
          </span>
          {property.isFeatured && (
            <span className="badge badge-featured">
              <Star size={10} className="mr-1" /> Featured
            </span>
          )}
        </div>
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={savingId === property._id}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg ${
              isSaved
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <Heart size={16} className={isSaved ? 'fill-white' : ''} />
          </button>
          <button
            onClick={handleCompare}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg ${
              inCompare
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            {inCompare ? <X size={15} /> : <GitCompareArrows size={15} />}
          </button>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-xl font-bold text-white">
            {formatPrice(property.price, property.priceLabel)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">
            {property.title}
          </h3>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md whitespace-nowrap">
            {property.type}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <MapPin size={12} className="text-blue-400 shrink-0" />
          <span className="truncate">{property.location}, {property.city}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-slate-300 text-xs mb-4">
          <span className="flex items-center gap-1">
            <BedDouble size={13} className="text-violet-400" />
            {property.bedrooms} Bed
          </span>
          <span className="flex items-center gap-1">
            <Bath size={13} className="text-cyan-400" />
            {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={13} className="text-emerald-400" />
            {property.area?.toLocaleString()} sqft
          </span>
        </div>

        {/* Amenities preview */}
        {property.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {property.amenities.slice(0, 3).map((a) => (
              <span key={a} className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={9} className="text-green-400" /> {a}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto">
          <Link
            to={`/properties/${property._id}`}
            className="btn-primary flex-1 justify-center text-xs py-2"
          >
            View Details
          </Link>
          <button
            onClick={handleCompare}
            className={`btn-secondary text-xs py-2 px-3 ${inCompare ? 'border-blue-500/60 text-blue-400' : ''}`}
          >
            <GitCompareArrows size={14} />
            {inCompare ? 'Comparing' : 'Compare'}
          </button>
        </div>

        {/* Listed by */}
        <p className="text-xs text-slate-600 mt-3 text-center truncate">{property.listedBy}</p>
      </div>
    </div>
  );
};

export default PropertyCard;
