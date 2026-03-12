import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';
import Input from './Input';

/**
 * LocationAutocomplete component
 * Provides location search with autocomplete using Photon API
 * @param {string} initialValue - Initial location value
 * @param {function} onLocationSelect - Callback when location is selected: ({location, latitude, longitude}) => void
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 */
const LocationAutocomplete = ({ 
    initialValue = '', 
    onLocationSelect, 
    label = 'Ubicación', 
    placeholder = 'Ciudad, Localidad, Pueblo...' 
}) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Update query when initialValue changes
    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    // Fetch location suggestions from Photon API
    const fetchLocationSuggestions = async (searchQuery) => {
        if (!searchQuery) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            const data = await response.json();
            
            // Filter only city results
            const cityResults = data.features.filter(item => item.properties.type === 'city');
            
            setSuggestions(cityResults);
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            setSuggestions([]);
        }
    };

    // Handle search input with debounce
    const handleSearch = (text) => {
        setQuery(text);
        setHasSelectedLocation(false);
        
        // Clear coordinates when user modifies text
        if (onLocationSelect) {
            onLocationSelect({ location: text, latitude: null, longitude: null });
        }
        
        // Cancel previous timeout if it exists
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // New timeout to fetch suggestions after user stops typing for 500ms
        searchTimeoutRef.current = setTimeout(() => {
            fetchLocationSuggestions(text);
        }, 500);
    };

    // Handle selection of a location suggestion
    const handleSelectLocation = (item) => {
        // Build location name with available properties
        const parts = [
            item.properties.name,
            item.properties.county,
            item.properties.country,
        ].filter(Boolean); // Remove undefined/null values
        
        const locationName = parts.join(', ');
        setQuery(locationName);
        setHasSelectedLocation(true);
        
        // Extract coordinates
        const [longitude, latitude] = item.geometry.coordinates;
        
        // Call callback with location data
        if (onLocationSelect) {
            onLocationSelect({ location: locationName, latitude, longitude });
        }
        
        // Clear suggestions after selection
        setSuggestions([]);
    };

    return (
        <View>
            <Input
                label={label}
                value={query}
                placeholder={placeholder}
                onChangeText={handleSearch}
            />
            <Text style={styles.helperText}>Selecciona una ubicación de las sugerencias</Text>
            
            {query && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((item, index) => (
                        <Pressable
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSelectLocation(item)}
                        >
                            <Text style={styles.suggestionText}>{item.properties.name}</Text>
                            <Text style={styles.suggestionSubtext}>
                                {[
                                    item.properties.county,
                                    item.properties.state,
                                    item.properties.country
                                ].filter(Boolean).join(', ')}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
};

export default LocationAutocomplete;

const styles = StyleSheet.create({
    helperText: {
        color: GlobalStyle.darkGray,
        fontFamily: 'Oswald_400',
        fontSize: 12,
        marginTop: 4,
    },
    suggestionsContainer: {
        backgroundColor: GlobalStyle.white,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: GlobalStyle.gray,
        marginTop: 8,
        paddingInline: 5,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionText: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
    },
    suggestionSubtext: {
        fontSize: 12,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        marginTop: 2,
    },
});
