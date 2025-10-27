/**
 * Simulates an API call with a short delay to mimic network latency.
 * @param data The data to be returned.
 * @returns A promise that resolves with the data.
 */
const simulateApiCall = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 250));
};

/**
 * Fetches data from localStorage. If not found, it seeds localStorage with initial data.
 * This function is generic and can be used for any data type.
 * @param key The localStorage key.
 * @param initialData The initial data to seed if the key is not found.
 * @returns A promise that resolves to the fetched or seeded data.
 */
export const getFromStorage = async <T,>(key: string, initialData: T): Promise<T> => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return simulateApiCall(JSON.parse(storedData));
        } else {
            localStorage.setItem(key, JSON.stringify(initialData));
            return simulateApiCall(initialData);
        }
    } catch (error) {
        console.error(`Error fetching from storage for key: ${key}`, error);
        return Promise.reject(error);
    }
};

/**
 * Saves data to localStorage.
 * This function is generic and can be used for any data type.
 * @param key The localStorage key.
 * @param data The data to be saved.
 * @returns A promise that resolves when the data is saved.
 */
export const saveToStorage = async <T,>(key: string, data: T): Promise<void> => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return simulateApiCall(undefined);
    } catch (error) {
        console.error(`Error saving to storage for key: ${key}`, error);
        return Promise.reject(error);
    }
};
