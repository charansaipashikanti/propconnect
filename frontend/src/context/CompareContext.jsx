import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CompareContext = createContext(null);

const MAX_COMPARE = 3;

export const CompareProvider = ({ children }) => {
  const { user, updateCompareProperties } = useAuth();
  const [compareList, setCompareList] = useState([]);

  // Hydrate from DB when auth changes
  useEffect(() => {
    if (user && user.compareProperties) {
      setCompareList(user.compareProperties);
    } else if (user === null) {
      // If user logs out, clear their persistent compare list
      setCompareList([]);
    }
  }, [user]);

  const addToCompare = async (property) => {
    if (compareList.find((p) => p._id === property._id)) {
      toast.error('Property already in comparison list');
      return;
    }
    if (compareList.length >= MAX_COMPARE) {
      toast.error(`You can compare at most ${MAX_COMPARE} properties. Remove one first.`);
      return;
    }

    const previousList = [...compareList];
    setCompareList([...compareList, property]); // Optimistic update

    if (user) {
      try {
        const { data } = await api.post(`/compare/${property._id}`);
        updateCompareProperties(data.data);
        toast.success(`"${property.title.substring(0, 30)}..." added to compare`);
      } catch (err) {
        setCompareList(previousList); // Rollback
        toast.error(err.response?.data?.message || 'Failed to sync to database');
      }
    } else {
      toast.success(`"${property.title.substring(0, 30)}..." added to compare (Guest)`);
    }
  };

  const removeFromCompare = async (propertyId) => {
    const previousList = [...compareList];
    setCompareList(compareList.filter((p) => p._id !== propertyId));

    if (user) {
      try {
        const { data } = await api.delete(`/compare/${propertyId}`);
        updateCompareProperties(data.data);
        toast.success('Removed from comparison');
      } catch (err) {
        setCompareList(previousList);
        toast.error('Failed to sync changes');
      }
    } else {
      toast.success('Removed from comparison');
    }
  };

  const clearCompare = async () => {
    const previousList = [...compareList];
    setCompareList([]);

    if (user) {
      try {
        const { data } = await api.delete('/compare/clear');
        updateCompareProperties(data.data);
      } catch (err) {
        setCompareList(previousList);
        toast.error('Failed to clear list');
      }
    }
  };

  const isInCompare = (propertyId) =>
    compareList.some((p) => p._id === propertyId);

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};
