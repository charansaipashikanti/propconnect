import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import toast from 'react-hot-toast';
import {
  MapPin, BedDouble, Bath, Maximize2, Building, Calendar, Car, Sofa,
  Layers, Phone, CheckCircle2, GitCompareArrows, Heart, ArrowLeft,
  Star, Loader2, X,
} from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateSavedProperties } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [contactForm, setContactForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data.data);
        document.title = `${data.data.title} — PropConnect`;
        if (user?.savedProperties) {
          setIsSaved(user.savedProperties.includes(id) || user.savedProperties.some(s => s._id === id || s === id));
        }
      } catch (err) {
        toast.error('Property not found');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleSave = async () => {
    if (!user) { toast.error('Please login to save properties'); return; }
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/saved/${id}`);
        toast.success('Removed from saved');
        setIsSaved(false);
      } else {
        await api.post(`/saved/${id}`);
        toast.success('Property saved!');
        setIsSaved(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const inCompare = property ? isInCompare(property._id) : false;
  const handleCompare = () => {
    if (!property) return;
    if (inCompare) { removeFromCompare(property._id); } else { addToCompare(property); }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact', {
        ...contactForm,
        propertyId: property._id,
        propertyTitle: property.title,
      });
      toast.success('Enquiry submitted! We\'ll get back to you shortly.');
      setContactForm({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
      </div>
    );
  }
  if (!property) return null;

  const formatPrice = (price, label) => {
    if (label) return label;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  const images = property.images?.length ? property.images : [fallback];

  return (
    <div className="page-container py-8">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6 gap-2">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="glass-card overflow-hidden">
            <div className="relative h-80 md:h-[420px]">
              <img
                src={images[activeImg]}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = fallback; }}
              />
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                <span className={`badge ${property.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
                  {property.status}
                </span>
                {property.isFeatured && (
                  <span className="badge badge-featured"><Star size={10} className="mr-1" /> Featured</span>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-blue-500' : 'border-white/10 hover:border-white/30'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = fallback; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & info */}
          <div className="glass-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white leading-snug mb-1">{property.title}</h1>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <MapPin size={14} className="text-blue-400" />
                  {property.location}, {property.city}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black gradient-text">{formatPrice(property.price, property.priceLabel)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{property.type}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: <BedDouble size={18} className="text-violet-400" />, label: 'Bedrooms', value: `${property.bedrooms} BHK` },
                { icon: <Bath size={18} className="text-cyan-400" />, label: 'Bathrooms', value: property.bathrooms },
                { icon: <Maximize2 size={18} className="text-emerald-400" />, label: 'Area', value: `${property.area?.toLocaleString()} sqft` },
                { icon: <Layers size={18} className="text-orange-400" />, label: 'Floor', value: `${property.floor} / ${property.totalFloors}` },
              ].map((item) => (
                <div key={item.label} className="bg-white/4 rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-1">{item.icon}</div>
                  <p className="text-white font-semibold text-sm">{item.value}</p>
                  <p className="text-slate-500 text-xs">{item.label}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{property.description}</p>
          </div>

          {/* More details */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              {[
                { icon: <Building size={14} className="text-blue-400" />, label: 'Type', value: property.type },
                { icon: <Sofa size={14} className="text-pink-400" />, label: 'Furnished', value: property.furnished },
                { icon: <Car size={14} className="text-yellow-400" />, label: 'Parking', value: property.parking ? 'Available' : 'N/A' },
                { icon: <Calendar size={14} className="text-slate-400" />, label: 'Year Built', value: property.yearBuilt },
                { icon: <CheckCircle2 size={14} className="text-emerald-400" />, label: 'Status', value: property.status },
                { icon: <Phone size={14} className="text-green-400" />, label: 'Contact', value: property.contactPhone },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                    {item.icon}
                    <span className="text-xs uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — sticky actions */}
        <div className="space-y-5">
          <div className="sticky top-20 space-y-5">
            {/* Action buttons */}
            <div className="glass-card p-5">
              <p className="text-2xl font-black gradient-text mb-4">
                {formatPrice(property.price, property.priceLabel)}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`btn-${isSaved ? 'secondary border-red-500/40 text-red-400' : 'secondary'} justify-center gap-2`}
                >
                  <Heart size={16} className={isSaved ? 'fill-red-400 text-red-400' : ''} />
                  {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save Property'}
                </button>
                <button
                  onClick={handleCompare}
                  className={`${inCompare ? 'btn-primary' : 'btn-secondary'} justify-center gap-2`}
                >
                  {inCompare ? <X size={15} /> : <GitCompareArrows size={15} />}
                  {inCompare ? 'Remove from Compare' : 'Add to Compare'}
                </button>
                {inCompare && (
                  <Link to="/compare" className="btn-primary justify-center gap-2 text-sm">
                    View Comparison
                  </Link>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/8 text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">{property.listedBy}</p>
                <div className="flex items-center gap-1">
                  <Phone size={12} className="text-green-400" />
                  <a href={`tel:${property.contactPhone}`} className="hover:text-green-400 transition-colors">
                    {property.contactPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-white mb-4 text-lg">Send Enquiry</h3>
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  className="input-field"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Phone (optional)"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  placeholder={`I'm interested in ${property.title}...`}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                />
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                  {submitting ? 'Sending...' : 'Send Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
