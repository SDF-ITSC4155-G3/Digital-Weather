declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// Temporary module declaration for Leaflet. For better types, install @types/leaflet.
declare module 'leaflet';
