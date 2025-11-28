'use client';

import React from 'react';

const HeroImage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(139, 92, 246, 0.15))',
        }}
      >
        <defs>
          {/* Futuristic Gradients */}
          <linearGradient id="holographic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#3B82F6" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#22C55E" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#3B82F6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <linearGradient id="neonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="neonGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>

          <radialGradient id="glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Advanced Filters */}
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="softShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Animated Background Grid */}
        <g opacity="0.15">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8B5CF6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="url(#grid)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 40,40; 0,0"
              dur="20s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* Floating Holographic Orbs */}
        <ellipse cx="200" cy="150" rx="150" ry="100" fill="url(#holographic)" opacity="0.3">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 15,20; -10,15; 0,0"
            dur="12s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="8s" repeatCount="indefinite" />
        </ellipse>
        
        <ellipse cx="800" cy="350" rx="180" ry="120" fill="url(#holographic)" opacity="0.25">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -20,10; 15,-5; 0,0"
            dur="15s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0.25;0.4;0.25" dur="10s" repeatCount="indefinite" />
        </ellipse>

        {/* Central Futuristic Neural Network */}
        <g transform="translate(500, 250)">
          {/* Main Core Node */}
          <circle cx="0" cy="0" r="60" fill="url(#neonPurple)" filter="url(#strongGlow)" opacity="0.9">
            <animate attributeName="r" values="60;70;60" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="45" fill="url(#glow)" opacity="0.6" />
          <circle cx="0" cy="0" r="35" fill="white" opacity="0.95" />
          <text x="0" y="8" fontSize="24" fill="#8B5CF6" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">LLM</text>
          
          {/* Orbiting Nodes with Connections */}
          {[
            { angle: -90, color: '#3B82F6', label: '1', delay: '0s' },
            { angle: 0, color: '#22C55E', label: '2', delay: '0.5s' },
            { angle: 90, color: '#8B5CF6', label: '3', delay: '1s' },
            { angle: 180, color: '#F59E0B', label: '4', delay: '1.5s' },
            { angle: -45, color: '#EC4899', label: '5', delay: '0.25s' },
            { angle: 45, color: '#06B6D4', label: '6', delay: '0.75s' },
          ].map((node, idx) => {
            const radius = 140;
            const x = Math.cos((node.angle * Math.PI) / 180) * radius;
            const y = Math.sin((node.angle * Math.PI) / 180) * radius;
            
            return (
              <g key={idx}>
                {/* Connection Line */}
                <line
                  x1="0"
                  y1="0"
                  x2={x}
                  y2={y}
                  stroke="url(#holographic)"
                  strokeWidth="2"
                  opacity="0.5"
                  strokeDasharray="4,4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;20;0"
                    dur="2s"
                    begin={node.delay}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.8;0.5"
                    dur="2s"
                    begin={node.delay}
                    repeatCount="indefinite"
                  />
                </line>
                
                {/* Node */}
                <circle
                  cx={x}
                  cy={y}
                  r="28"
                  fill={node.color}
                  filter="url(#neonGlow)"
                  opacity="0.9"
                >
                  <animate
                    attributeName="r"
                    values="28;35;28"
                    dur="2.5s"
                    begin={node.delay}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;1;0.9"
                    dur="2.5s"
                    begin={node.delay}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={x} cy={y} r="20" fill="white" opacity="0.9" />
                <text
                  x={x}
                  y={y + 6}
                  fontSize="14"
                  fill={node.color}
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* Futuristic Ranking Display - Left */}
        <g transform="translate(150, 200)">
          {/* Holographic ranking bars */}
          {[
            { height: 120, color: '#22C55E', rank: '#1', delay: '0s' },
            { height: 100, color: '#3B82F6', rank: '#2', delay: '0.3s' },
            { height: 80, color: '#8B5CF6', rank: '#3', delay: '0.6s' },
            { height: 60, color: '#F59E0B', rank: '#4', delay: '0.9s' },
          ].map((bar, idx) => (
            <g key={idx} transform={`translate(${idx * 50}, 0)`}>
              <rect
                x="0"
                y={140 - bar.height}
                width="40"
                height={bar.height}
                rx="8"
                fill={bar.color}
                filter="url(#neonGlow)"
                opacity="0.85"
              >
                <animate
                  attributeName="height"
                  values={`${bar.height};${bar.height + 10};${bar.height}`}
                  dur="2s"
                  begin={bar.delay}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.85;1;0.85"
                  dur="2s"
                  begin={bar.delay}
                  repeatCount="indefinite"
                />
              </rect>
              <text
                x="20"
                y="160"
                fontSize="11"
                fill={bar.color}
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontWeight="600"
              >
                {bar.rank}
              </text>
            </g>
          ))}
        </g>

        {/* Futuristic Battle Arena Icon - Right */}
        <g transform="translate(850, 200)">
          {/* Hexagonal arena badge */}
          <path
            d="M 0 -50 L 43.3 -25 L 43.3 25 L 0 50 L -43.3 25 L -43.3 -25 Z"
            fill="url(#holographic)"
            filter="url(#strongGlow)"
            opacity="0.9"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0;360"
              dur="20s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 0 -35 L 30.3 -17.5 L 30.3 17.5 L 0 35 L -30.3 17.5 L -30.3 -17.5 Z"
            fill="white"
            opacity="0.95"
          />
          <text x="0" y="8" fontSize="36" fill="#8B5CF6" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">⚔</text>
          
          {/* Pulsing status indicator */}
          <circle cx="35" cy="-35" r="10" fill="#22C55E" filter="url(#neonGlow)">
            <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Particle System */}
        <g opacity="0.8">
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i * 360) / 20;
            const radius = 200 + (i % 3) * 50;
            const x = 500 + Math.cos((angle * Math.PI) / 180) * radius;
            const y = 250 + Math.sin((angle * Math.PI) / 180) * radius;
            const colors = ['#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B'];
            const color = colors[i % colors.length];
            const delay = (i * 0.1) % 2;
            
            return (
              <circle key={i} cx={x} cy={y} r="3" fill={color} filter="url(#neonGlow)">
                <animate
                  attributeName="cy"
                  values={`${y};${y - 30};${y}`}
                  dur={`${3 + (i % 2)}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;1;0.3;0.8"
                  dur={`${3 + (i % 2)}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="3;5;3"
                  dur={`${2 + (i % 2)}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
        </g>

        {/* Data Stream Lines */}
        <g transform="translate(100, 400)" opacity="0.6">
          <path
            d="M 0 0 Q 200 -30 400 0 Q 600 30 800 0"
            fill="none"
            stroke="url(#holographic)"
            strokeWidth="4"
            strokeDasharray="10,5"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;30;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          {/* Data packets */}
          {[0, 200, 400, 600, 800].map((x, i) => (
            <circle key={i} cx={x} cy="0" r="6" fill="#8B5CF6" filter="url(#neonGlow)">
              <animate
                attributeName="cy"
                values="0;-10;0"
                dur="2s"
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Scanning Lines Effect */}
        <g opacity="0.2">
          <line x1="0" y1="0" x2="1000" y2="0" stroke="url(#holographic)" strokeWidth="2">
            <animate
              attributeName="y1"
              values="0;500;0"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y2"
              values="0;500;0"
              dur="4s"
              repeatCount="indefinite"
            />
          </line>
        </g>
      </svg>
    </div>
  );
};

export default HeroImage;
