import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';
import Input from './Input';

/**
 * AddressAutocomplete component
 * Provides address search with autocomplete using Photon API
 * Searches for exact locations (streets, avenues, plazas, buildings, etc.)
 * @param {string} initialValue - Initial address value
 * @param {function} onAddressSelect - Callback when address is selected: ({location, latitude, longitude}) => void
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 */
const AddressAutocomplete = ({ 
    initialValue = '', 
    onAddressSelect, 
    label = 'Dirección', 
    placeholder = 'Calle, Plaza, Avenida...'
}) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const searchTimeoutRef = useRef(null);

    // Update query when initialValue changes
    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    // Fetch address suggestions from Photon API
    const fetchAddressSuggestions = async (searchQuery) => {
        if (!searchQuery) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            const data = await response.json();
            
            // Return all results (streets, buildings, cities, etc.)
            setSuggestions(data.features);
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
            setSuggestions([]);
        }
    };

    // Handle search input with debounce
    const handleSearch = (text) => {
        setQuery(text);
        
        // Clear coordinates when user modifies text
        if (onAddressSelect) {
            onAddressSelect({ location: text, latitude: null, longitude: null });
        }
        
        // Cancel previous timeout if it exists
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // New timeout to fetch suggestions after user stops typing for 500ms
        searchTimeoutRef.current = setTimeout(() => {
            fetchAddressSuggestions(text);
        }, 500);
    };

    const buildShortAddress = (props = {}) => {
        const city = props.city || props.town || props.village || props.county || '';
        const street = [props.street, props.housenumber].filter(Boolean).join(' ').trim();

        const normalizedCity = city.toLowerCase();
        const normalizedStreet = street.toLowerCase();
        const normalizedName = (props.name || '').toLowerCase();

        const placeName = props.name &&
            normalizedName !== normalizedCity &&
            normalizedName !== normalizedStreet
            ? props.name
            : '';

        const parts = [placeName, street, city].filter(Boolean);
        return parts.join(', ');
    };

    // Handle selection of an address suggestion
    const handleSelectAddress = (item) => {
        // Build concise address: landmark/place, street and city/town.
        const props = item.properties;
        const addressName = buildShortAddress(props);
        setQuery(addressName);
        
        // Extract coordinates
        const [longitude, latitude] = item.geometry.coordinates;
        
        // Call callback with address data
        if (onAddressSelect) {
            onAddressSelect({ location: addressName, latitude, longitude });
        }
        
        // Clear suggestions after selection
        setSuggestions([]);
    };

    // Format suggestion text to display
    const formatSuggestion = (item) => {
        const props = item.properties;
        
        // Primary text: name or street with house number
        const primaryParts = [
            props.name,
            props.street,
            props.housenumber
        ].filter(Boolean);
        const primary = primaryParts.join(', ');

        // Secondary text: city, state, country
        const secondaryParts = [
            props.postcode,
            props.city || props.county,
            props.state,
            props.country
        ].filter(Boolean);
        const secondary = secondaryParts.join(', ');

        return { primary, secondary };
    };

    return (
        <View>
            <Input
                label={label}
                value={query}
                placeholder={placeholder}
                onChangeText={handleSearch}
            />
            <Text style={styles.helperText}>Selecciona una dirección de las sugerencias</Text>
            
            {query && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((item, index) => {
                        const { primary, secondary } = formatSuggestion(item);
                        return (
                            <Pressable
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() => handleSelectAddress(item)}
                            >
                                <Text style={styles.suggestionText}>{primary}</Text>
                                {secondary && (
                                    <Text style={styles.suggestionSubtext}>{secondary}</Text>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export default AddressAutocomplete;

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
