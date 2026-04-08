import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import {
  Trash2,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Building,
  Calendar,
  Car,
  Sofa,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';

const formatPrice = (price, priceLabel) => {
  if (priceLabel) return priceLabel;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const ComparisonTable = ({ properties }) => {
  const { removeFromCompare } = useCompare();

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-20">
        <Building size={64} className="mx-auto text-slate-700 mb-4" />
        <p className="text-slate-400 text-lg font-medium">No properties to compare</p>
        <p className="text-slate-600 text-sm mt-2">
          Browse properties and click <strong className="text-blue-400">Compare</strong> to add them here.
        </p>
        <Link to="/properties" className="btn-primary mt-6 inline-flex">
          Browse Properties
        </Link>
      </div>
    );
  }

  const rows = [
    {
      label: 'Price',
      icon: <span className="text-green-400 font-bold text-base">₹</span>,
      render: (p) => (
        <span className="text-green-400 font-bold text-sm">{formatPrice(p.price, p.priceLabel)}</span>
      ),
    },
    {
      label: 'Location',
      icon: <MapPin size={14} className="text-blue-400" />,
      render: (p) => `${p.location}, ${p.city}`,
    },
    {
      label: 'Type',
      icon: <Building size={14} className="text-violet-400" />,
      render: (p) => p.type,
    },
    {
      label: 'Status',
      icon: <CheckCircle2 size={14} className="text-emerald-400" />,
      render: (p) => (
        <span className={`badge text-xs ${p.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
          {p.status}
        </span>
      ),
    },
    {
      label: 'Bedrooms',
      icon: <BedDouble size={14} className="text-violet-400" />,
      render: (p) => `${p.bedrooms} BHK`,
    },
    {
      label: 'Bathrooms',
      icon: <Bath size={14} className="text-cyan-400" />,
      render: (p) => p.bathrooms,
    },
    {
      label: 'Area',
      icon: <Maximize2 size={14} className="text-emerald-400" />,
      render: (p) => `${p.area?.toLocaleString()} sqft`,
    },
    {
      label: 'Floor',
      icon: <Layers size={14} className="text-orange-400" />,
      render: (p) => `${p.floor} / ${p.totalFloors}`,
    },
    {
      label: 'Furnished',
      icon: <Sofa size={14} className="text-pink-400" />,
      render: (p) => p.furnished,
    },
    {
      label: 'Parking',
      icon: <Car size={14} className="text-yellow-400" />,
      render: (p) => (
        <span className={p.parking ? 'text-green-400' : 'text-red-400'}>
          {p.parking ? '✓ Available' : '✗ Not Available'}
        </span>
      ),
    },
    {
      label: 'Year Built',
      icon: <Calendar size={14} className="text-slate-400" />,
      render: (p) => p.yearBuilt,
    },
    {
      label: 'Amenities',
      icon: <CheckCircle2 size={14} className="text-green-400" />,
      render: (p) => (
        <ul className="space-y-1">
          {p.amenities?.map((a) => (
            <li key={a} className="flex items-center gap-1 text-xs text-slate-300">
              <CheckCircle2 size={10} className="text-green-400 shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: 'Listed By',
      icon: null,
      render: (p) => <span className="text-slate-500 text-xs">{p.listedBy}</span>,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="compare-table">
        <thead>
          <tr>
            <th className="w-36 md:w-44">Feature</th>
            {properties.map((p) => (
              <th key={p._id} className="min-w-[200px]">
                <div className="flex flex-col gap-2">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
                    alt={p.title}
                    className="w-full h-28 object-cover rounded-lg"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'; }}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white leading-snug text-left">
                      {p.title}
                    </p>
                    <button
                      onClick={() => removeFromCompare(p._id)}
                      className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                      title="Remove from comparison"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="font-medium text-slate-300 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {row.icon}
                  {row.label}
                </div>
              </td>
              {properties.map((p) => (
                <td key={`${p._id}-${row.label}`}>
                  {typeof row.render(p) === 'object' ? row.render(p) : (
                    <span className="text-sm">{row.render(p)}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td></td>
            {properties.map((p) => (
              <td key={`${p._id}-action`}>
                <Link
                  to={`/properties/${p._id}`}
                  className="btn-primary text-xs py-2 w-full justify-center"
                >
                  View Details
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
