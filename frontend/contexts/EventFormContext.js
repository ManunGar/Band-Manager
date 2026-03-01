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
        eventType: null,
        date: null,
        initialTime: null,
        endTime: null,
        name: null,
        type: null,
        place: null,
        comment: null,
        picture: null,
        instruments: null,
        delete_picture: false
    });

    const updateEventFormData = (data) => {
        setEventFormData(prev => ({ ...prev, ...data }));
    };

    const resetEventFormData = () => {
        setEventFormData({
            eventType: 'performances',
            date: '',
            initialTime: '',
            endTime: '',
            name: '',
            type: '',
            place: '',
            comment: null,
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
