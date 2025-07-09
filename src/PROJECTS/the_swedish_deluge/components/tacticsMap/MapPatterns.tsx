import React from 'react';

/**
 * Komponent zawierający tylko definicje wzorów (patterns) używanych na mapie
 */
export default function MapPatterns() {
  return (
    <>
      {/* Paper texture */}
      <pattern id="paperTexture" patternUnits="userSpaceOnUse" width="200" height="200">
        <rect width="200" height="200" fill="#e8d9c0" />
        <rect width="200" height="200" filter="url(#noise)" opacity="0.2" />
      </pattern>
      
      {/* Grid lines */}
      <pattern id="gridPattern" patternUnits="userSpaceOnUse" width="50" height="50">
        <rect width="50" height="50" fill="url(#paperTexture)" />
        <line x1="0" y1="0" x2="50" y2="0" stroke="#8d6e63" strokeWidth="0.3" strokeOpacity="0.3" />
        <line x1="0" y1="0" x2="0" y2="50" stroke="#8d6e63" strokeWidth="0.3" strokeOpacity="0.3" />
      </pattern>
      
      {/* Terrain textures */}
      <pattern id="provinceTexture1" patternUnits="userSpaceOnUse" width="50" height="50">
        <rect width="50" height="50" fill="#e1c699" fillOpacity="0.6" />
        <circle cx="25" cy="25" r="1" fill="#8d6e63" fillOpacity="0.3" />
      </pattern>
      
      <pattern id="provinceTexture2" patternUnits="userSpaceOnUse" width="50" height="50">
        <rect width="50" height="50" fill="#d1b995" fillOpacity="0.6" />
        <line x1="10" y1="10" x2="15" y2="15" stroke="#8d6e63" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="35" y1="35" x2="40" y2="40" stroke="#8d6e63" strokeWidth="0.5" strokeOpacity="0.3" />
      </pattern>
      
      <pattern id="provinceTexture3" patternUnits="userSpaceOnUse" width="50" height="50">
        <rect width="50" height="50" fill="#c5af8c" fillOpacity="0.6" />
        <path d="M10,10 Q15,5 20,10 T30,10" stroke="#8d6e63" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
      </pattern>
      
      <pattern id="provinceTexture4" patternUnits="userSpaceOnUse" width="50" height="50">
        <rect width="50" height="50" fill="#dec286" fillOpacity="0.6" />
        <path d="M10,20 Q20,10 30,20" stroke="#8d6e63" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
        <path d="M10,30 Q20,20 30,30" stroke="#8d6e63" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
      </pattern>
    </>
  );
}