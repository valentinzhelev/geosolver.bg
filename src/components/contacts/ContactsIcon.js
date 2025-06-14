import React from 'react';

const ContactsIcon = ({ className = '' }) => (
  <div
    className={`w-24 h-24 ${className}`}
    style={{
      WebkitMaskImage: 'url(/icons/contacts_vector.svg)',
      maskImage: 'url(/icons/contacts_vector.svg)',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      backgroundImage: 'url(/images/gradient_wallpaper.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'inline-block',
    }}
  />
);

export default ContactsIcon; 