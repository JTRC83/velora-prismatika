// src/components/Header.jsx
import React from 'react';

export default function Header() {
  return (
    <header className="bg-amber-100 h-16 flex items-center justify-center flex-shrink-0">
      <img
        src="/assets/header.png"
        alt="Velora Prismätika Banner"
        className="h-8 md:h-10 lg:h-12 object-contain"
      />
    </header>
  );
}