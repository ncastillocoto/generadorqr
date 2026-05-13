'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background with mesh gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #1a6b5f 0%, #289889 40%, #3db8a8 70%, #71C9CD 100%)',
        }}
      />
      {/* Decorative circles */}
      <div
        className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-20"
        style={{ background: '#71C9CD' }}
      />
      <div
        className="absolute -bottom-12 left-1/3 w-64 h-64 rounded-full opacity-10"
        style={{ background: '#97C94C' }}
      />
      <div
        className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: '#FBB634' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo + name */}
        <div className="flex items-center gap-4">
          <div className="w-36 h-12 relative flex-shrink-0 bg-white rounded-lg px-2 py-1 flex items-center justify-center shadow-lg">
            <Image
              src="/logo.svg"
              alt="Mentora Logo"
              width={120}
              height={38}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Center title */}
        <div className="text-center flex-1 px-4">
          <h1
            className="text-white font-black tracking-tight leading-none"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', letterSpacing: '-0.02em' }}
          >
            Sistema QR Institucional
          </h1>
          <p className="text-white/70 text-xs mt-1 font-medium tracking-widest uppercase">
            Generación Masiva de Códigos QR
          </p>
        </div>

        {/* Badge */}
        <div className="flex-shrink-0">
          <div
            className="px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg border border-white/20"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)' }}
          >
            v1.0 Edu
          </div>
        </div>
      </div>
    </header>
  );
}
