export const getItem = async (key: string) => {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const value = localStorage.getItem(key);
        return value;
    } catch (error) {
        console.warn('Failed to get item from localStorage:', error);
        return null;
    }
};

export const setItem = async (key: string, value: string) => {
    if (typeof window === 'undefined') {
        return value;
    }
    try {
        localStorage.setItem(key, value);
        return value;
    } catch (error) {
        console.warn('Failed to set item in localStorage:', error);
        return value;
    }
};

export const removeItem = async (key: string) => {
    if (typeof window === 'undefined') {
        return true;
    }
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn('Failed to remove item from localStorage:', error);
        return true;
    }
}