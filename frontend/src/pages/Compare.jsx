import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import ComparisonTable from '../components/ComparisonTable';
import { GitCompareArrows, Trash2, Building2, ArrowRight } from 'lucide-react';

const Compare = () => {
  const { compareList, clearCompare } = useCompare();

  useEffect(() => {
    document.title = 'Compare Properties — PropConnect';
  }, []);

  return (
    <div className="page-container section">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <GitCompareArrows className="text-blue-400" size={30} />
            Property Comparison
          </h1>
          <p className="text-slate-400 text-sm">
            {compareList.length === 0
              ? 'Add up to 3 properties to compare side-by-side'
              : `Comparing ${compareList.length} propert${compareList.length === 1 ? 'y' : 'ies'} — select up to 3`}
          </p>
        </div>

        {compareList.length > 0 && (
          <div className="flex items-center gap-3">
            <Link to="/properties" className="btn-secondary gap-2 text-sm">
              <Building2 size={15} />
              Add More
            </Link>
            <button
              onClick={clearCompare}
              className="btn-secondary gap-2 text-sm border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={15} />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Slot indicators */}
      {compareList.length < 3 && compareList.length > 0 && (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {compareList.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-2 bg-blue-600/15 border border-blue-500/25 rounded-xl px-4 py-2"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-sm text-blue-300 font-medium truncate max-w-[180px]">
                {p.title}
              </span>
            </div>
          ))}
          {Array.from({ length: 3 - compareList.length }).map((_, i) => (
            <Link
              key={`empty-${i}`}
              to="/properties"
              className="flex items-center gap-2 border border-dashed border-white/15 rounded-xl px-4 py-2 text-slate-500 hover:border-blue-500/40 hover:text-blue-400 transition-all text-sm"
            >
              <div className="w-2 h-2 rounded-full border border-current" />
              Add property {compareList.length + i + 1}
              <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      )}

      {/* Comparison table / empty state */}
      <ComparisonTable properties={compareList} />

      {/* Hint */}
      {compareList.length > 0 && compareList.length < 3 && (
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            You can compare up to <strong className="text-slate-300">3 properties</strong> at once.{' '}
            <Link to="/properties" className="text-blue-400 hover:underline">
              Browse more properties →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Compare;
