import { createContext, useContext, useState } from 'react';

const EventFormContext = createContext();

export const useEventForm = () => {
    const context = useContext(EventFormContext);
    if (!context) {
        throw new Error('useEventForm must be used within EventFormProvider');
    }
    return context;
};

export const EventFormProvider = ({ children }) => {
    const [eventFormData, setEventFormData] = useState({
        eventId: null, // Track which event this data belongs to
        eventType: 'performances',
        date: '',
        initialTime: '',
        endTime: '',
        name: '',
        type: '',
        location: '',
        latitude: null,
        longitude: null,
        comment: '',
        picture: null,
        instruments: [],
        delete_picture: false
    });

    const updateEventFormData = (data) => {
        setEventFormData(prev => ({ ...prev, ...data }));
    };

    const resetEventFormData = () => {
        setEventFormData({
            eventId: null,
            eventType: 'performances',
            date: '',
            initialTime: '',
            endTime: '',
            name: '',
            type: '',
            location: '',
            latitude: null,
            longitude: null,
            comment: '',
            picture: null,
            instruments: [],
            delete_picture: false
        });
    };

    return (
        <EventFormContext.Provider value={{ 
            eventFormData, 
            updateEventFormData, 
            resetEventFormData 
        }}>
            {children}
        </EventFormContext.Provider>
    );
};
