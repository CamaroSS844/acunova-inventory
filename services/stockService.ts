import { Component, StockLocation, StockMovement } from '../types';
import { getFromStorage, saveToStorage } from './apiService';
import { initialComponents, initialLocations } from '../data/initialData';

const COMPONENTS_KEY = 'acunova_components';
const LOCATIONS_KEY = 'acunova_locations';
const MOVEMENTS_KEY = 'acunova_movements';

// Components
export const getComponents = (): Promise<Component[]> => getFromStorage(COMPONENTS_KEY, initialComponents);
export const saveComponents = (components: Component[]): Promise<void> => saveToStorage(COMPONENTS_KEY, components);

// Locations
export const getLocations = (): Promise<Omit<StockLocation, 'quantity'>[]> => getFromStorage(LOCATIONS_KEY, initialLocations);
export const saveLocations = (locations: Omit<StockLocation, 'quantity'>[]): Promise<void> => saveToStorage(LOCATIONS_KEY, locations);

// Movements
export const getStockMovements = (): Promise<StockMovement[]> => getFromStorage(MOVEMENTS_KEY, []);
export const saveStockMovements = (movements: StockMovement[]): Promise<void> => saveToStorage(MOVEMENTS_KEY, movements);
