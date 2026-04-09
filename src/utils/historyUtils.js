const HISTORY_KEY = 'skycast_search_history';
const MAX_HISTORY = 10;

export const getSearchHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error("Error reading search history:", error);
        return [];
    }
};

export const saveSearchHistory = (city) => {
    if (!city || typeof city !== 'string') return;
    
    try {
        let history = getSearchHistory();
        
        // Remove city if it already exists (to bring it to the top)
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        // Add to the beginning
        history.unshift(city);
        
        // Limit to MAX_HISTORY
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }
        
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Error saving search history:", error);
    }
};

export const clearSearchHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};
