import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import {
  Building2,
  Search,
  GitCompareArrows,
  Heart,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ArrowRight,
  Star,
} from 'lucide-react';

const stats = [
  { label: 'Properties Listed', value: '10+', icon: <Building2 className="text-blue-400" size={22} /> },
  { label: 'Premium Locations', value: '10', icon: <MapPin className="text-violet-400" size={22} /> },
  { label: 'Verified Listings', value: '100%', icon: <ShieldCheck className="text-emerald-400" size={22} /> },
  { label: 'Happy Clients', value: '500+', icon: <Star className="text-yellow-400" size={22} /> },
];

const features = [
  {
    icon: <Search size={28} className="text-blue-400" />,
    title: 'Smart Search & Filters',
    desc: 'Filter by location, budget, bedrooms, and furnishing. Find your perfect match in seconds.',
  },
  {
    icon: <GitCompareArrows size={28} className="text-violet-400" />,
    title: 'Side-by-Side Comparison',
    desc: 'Compare up to 3 properties simultaneously with a detailed feature breakdown.',
  },
  {
    icon: <Heart size={28} className="text-red-400" />,
    title: 'Save & Shortlist',
    desc: 'Shortlist your favourite properties and revisit them anytime from your profile.',
  },
  {
    icon: <TrendingUp size={28} className="text-emerald-400" />,
    title: 'Top Hyderabad Localities',
    desc: 'Discover premium properties in Gachibowli, Jubilee Hills, Hitech City, and more.',
  },
];

const Home = () => {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'PropConnect — Find Your Dream Home in Hyderabad';
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/properties?limit=4');
        setFeatured(data.data.filter((p) => p.isFeatured).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg min-h-[80vh] flex items-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl" />
        </div>

        <div className="page-container w-full py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/25 rounded-full px-4 py-2 mb-6 text-sm text-blue-300 font-medium">
              <Building2 size={15} />
              Hyderabad's Premier Real Estate Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Find & Compare{' '}
              <span className="gradient-text">Dream Properties</span>{' '}
              in Hyderabad
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Browse premium listings across Gachibowli, Jubilee Hills, Hitech City and more.
              Compare properties side-by-side and shortlist your favourites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/properties" className="btn-primary text-base px-8 py-3.5">
                <Search size={18} />
                Explore Properties
              </Link>
              <Link to="/compare" className="btn-secondary text-base px-8 py-3.5">
                <GitCompareArrows size={18} />
                Compare Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/6 bg-surface-700/40">
        <div className="page-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <p className="text-3xl font-black gradient-text mb-1">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">Featured</p>
              <h2 className="text-3xl font-bold text-white">Top Picks This Week</h2>
            </div>
            <Link to="/properties" className="btn-secondary gap-2 hidden sm:flex">
              View All <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="property-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card h-96 animate-pulse">
                  <div className="h-52 bg-white/5 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="property-grid">
              {featured.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Building2 size={48} className="mx-auto mb-3 text-slate-700" />
              <p>No featured properties. <Link to="/properties" className="text-blue-400 hover:underline">Browse all</Link></p>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/properties" className="btn-secondary gap-2">
              View All Properties <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-surface-700/30 border-y border-white/5">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">Why PropConnect</p>
            <h2 className="text-3xl font-bold text-white">Everything You Need in One Place</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-6 flex flex-col justify-between items-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2 text-center">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed text-center">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 p-12 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-black text-white mb-4">
                {user ? `Ready to find your match, ${user.name.split(' ')[0]}?` : 'Ready to Find Your Home?'}
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                {user
                  ? 'Access your saved properties and pick up right where you left off.'
                  : 'Join thousands of buyers who found their dream properties through PropConnect.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link to="/saved" className="btn-primary text-base px-8 py-3.5">
                    View Your Shortlist
                  </Link>
                ) : (
                  <Link to="/register" className="btn-primary text-base px-8 py-3.5">
                    Get Started Free
                  </Link>
                )}
                <Link to="/properties" className="btn-secondary text-base px-8 py-3.5">
                  Browse Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8">
        <div className="page-container text-center text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-300">PropConnect</span>
          </div>
          <p>© {new Date().getFullYear()} PropConnect. Real Estate Platform for Hyderabad.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
