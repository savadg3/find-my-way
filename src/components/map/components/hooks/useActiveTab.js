import { useEffect } from 'react';  
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../../../store/slices/projectItemSlice';

export const useActiveTab = (activeTab= '', resetTab = 'all') => { 
  const dispatch = useDispatch();

  useEffect(() => { 
    dispatch(setActiveTab(activeTab));
    
    return () => { 
      dispatch(setActiveTab(resetTab));
    };
  }, [activeTab, resetTab, setActiveTab]);
};