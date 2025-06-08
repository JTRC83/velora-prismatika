import React from 'react';

export default function CarouselAvatars({ avatars, onSelect }) {
  return (
    <div className="carousel-container">
      <div id="carousel">
        {avatars.map((a,i) => (
          <figure
            key={a.id}
            style={{
              transform: `rotateY(${360/avatars.length * i}deg) translateZ(330px)`
            }}
            onClick={() => onSelect(a.id)}
          >
            <img src={`/assets/avatars/${a.id}.png`} alt={a.id} />
          </figure>
        ))}
      </div>
    </div>
  );
}