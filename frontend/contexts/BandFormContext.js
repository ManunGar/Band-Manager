import { createContext, useContext, useState } from 'react';

const BandFormContext = createContext();

export const useBandForm = () => {
    const context = useContext(BandFormContext);
    if (!context) {
        throw new Error('useBandForm must be used within BandFormProvider');
    }
    return context;
};

export const BandFormProvider = ({ children }) => {
    const [bandFormData, setBandFormData] = useState({
        name: null,
        location: null,
        phone: null,
        type: null,
        instruments: {},
        profile_picture: null,
        delete_profile_picture: false
    });

    const updateBandFormData = (data) => {
        setBandFormData(prev => ({ ...prev, ...data }));
    };

    const resetBandFormData = () => {
        setBandFormData({
            name: null,
            location: null,
            phone: null,
            type: null,
            instruments: {},
            profile_picture: null,
            delete_profile_picture: false
        });
    };

    return (
        <BandFormContext.Provider value={{ 
            bandFormData, 
            updateBandFormData, 
            resetBandFormData 
        }}>
            {children}
        </BandFormContext.Provider>
    );
};
