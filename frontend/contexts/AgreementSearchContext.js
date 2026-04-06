import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AgreementSearchContext = createContext();

export const useAgreementSearch = () => {
    const context = useContext(AgreementSearchContext);
    if (!context) {
        throw new Error('useAgreementSearch must be used within AgreementSearchProvider');
    }
    return context;
};

export const AgreementSearchProvider = ({ children, debounceMs = 400 }) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, debounceMs);

        return () => clearTimeout(timeout);
    }, [search, debounceMs]);

    const clearSearch = () => {
        setSearch('');
        setDebouncedSearch('');
    };

    const clearAll = () => {
        setSearch('');
        setDebouncedSearch('');
        setStartDate(null);
        setEndDate(null);
    };

    const value = useMemo(() => ({
        search,
        setSearch,
        debouncedSearch,
        clearSearch,
        clearAll,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
    }), [search, debouncedSearch, startDate, endDate]);

    return (
        <AgreementSearchContext.Provider value={value}>
            {children}
        </AgreementSearchContext.Provider>
    );
};
