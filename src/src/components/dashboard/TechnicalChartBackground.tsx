import React from 'react';

/**
 * Technical Chart Background SVG.
 * Provides an atmospheric, data-driven background for the trade table.
 */
export function TechnicalChartBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden mix-blend-screen grayscale contrast-125">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 631.9 182.21"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lg-1" x1="59.25" y1="2.9" x2="59.25" y2="125.83" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-2" x1="496.9" y1="41.3" x2="496.9" y2="125.3" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-3" x1="625.64" y1="39.96" x2="625.64" y2="80.26" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-4" x1="8.15" y1="-.84" x2="8.15" y2="151.58" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-5" x1="31.88" y1="-10.7" x2="31.88" y2="108.23" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-6" x1="98.05" y1="10.63" x2="98.05" y2="178.15" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-7" x1="124.33" y1="27.43" x2="124.33" y2="96.24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-8" x1="151.1" y1="55.96" x2="151.1" y2="155.17" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-9" x1="166.88" y1="82.1" x2="166.88" y2="189.58" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-10" x1="185.48" y1="92.5" x2="185.48" y2="171.44" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-11" x1="208.72" y1="58.9" x2="208.72" y2="154.37" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-12" x1="231.63" y1="57.03" x2="231.63" y2="162.92" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-13" x1="262.39" y1="30.1" x2="262.39" y2="139.6" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-14" x1="288.65" y1="25.03" x2="288.65" y2="84.79" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-15" x1="346.48" y1="41.56" x2="346.48" y2="159.44" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-16" x1="366.01" y1="31.43" x2="366.01" y2="140.24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-17" x1="384.13" y1="69.83" x2="384.13" y2="169.05" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-18" x1="400.33" y1="126.9" x2="400.33" y2="191.97" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-19" x1="418.89" y1="139.96" x2="418.89" y2="195.27" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-20" x1="440.26" y1="72.76" x2="440.26" y2="175.47" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-21" x1="459.77" y1="69.3" x2="459.77" y2="168.8" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-22" x1="475.56" y1="65.83" x2="475.56" y2="136.23" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-23" x1="512.82" y1="53.31" x2="513.09" y2="154.91" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-24" x1="527.13" y1="113.56" x2="527.13" y2="185.04" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-25" x1="544.38" y1="120.23" x2="544.38" y2="158.85" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff0023"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-26" x1="561.22" y1="70.36" x2="561.22" y2="157.56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-27" x1="575.65" y1="27.16" x2="575.65" y2="117.57" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-28" x1="591.92" y1="25.83" x2="591.92" y2="100.23" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-29" x1="609.31" y1="21.56" x2="609.31" y2="111.43" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
          <linearGradient id="lg-30" x1="317.82" y1="6.36" x2="317.82" y2="91.17" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f8"/>
            <stop offset="1" stopColor="#000"/>
          </linearGradient>
        </defs>
        <g style={{ isolation: 'isolate' }}>
          <g>
            <g>
              <polygon fill="url(#lg-1)" points="50.54 69.01 58.55 69.14 58.55 106.9 60.03 106.89 60.03 69.16 67.95 69.29 67.95 14.27 50.54 13.4 50.54 69.01" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-2)" points="492.83 100.7 496.52 100.69 496.52 115.42 497.31 115.41 497.31 100.68 500.98 100.67 500.98 46.88 492.83 46.54 492.83 100.7" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-3)" points="631.9 53.83 625.99 53.6 625.99 40.93 625.35 40.9 625.35 53.57 619.37 53.34 619.37 64.97 625.35 65.14 625.35 73.49 625.99 73.51 625.99 65.16 631.9 65.33 631.9 53.83" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-4)" points="8.97 7.7 7.41 7.62 7.41 41.97 0 41.74 0 96.82 7.41 96.82 7.41 131.17 8.97 131.14 8.97 96.82 16.3 96.82 16.3 42.26 8.97 42.02 8.97 7.7" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-5)" points="32.76 .09 31.24 0 31.24 34.19 23.42 33.9 23.42 51.23 31.24 51.44 31.24 87.33 32.76 87.34 32.76 51.48 40.34 51.68 40.34 34.53 32.76 34.24 32.76 .09" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-6)" points="98.89 14.47 97.49 14.4 97.49 32.76 87.43 32.36 87.43 126.1 97.49 125.92 97.49 157.57 98.89 157.51 98.89 125.89 108.67 125.71 108.67 33.2 98.89 32.82 98.89 14.47" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-7)" points="125.03 33.26 123.67 33.2 123.67 44.95 118.61 44.79 118.61 65.71 123.67 65.81 123.67 80.79 125.03 80.81 125.03 65.84 130.05 65.93 130.05 45.16 125.03 45 125.03 33.26" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-8)" points="151.78 48.32 150.47 48.28 150.47 74.42 144.78 74.33 144.78 130.86 150.47 130.73 150.47 140.55 151.78 140.51 151.78 130.7 157.42 130.58 157.42 74.51 151.78 74.43 151.78 48.32" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-9)" points="167.54 88.08 166.25 88.08 166.25 116.95 161.85 117.01 161.85 161.45 166.25 161.26 166.25 169.13 167.54 169.07 167.54 161.21 171.91 161.03 171.91 116.88 167.54 116.93 167.54 88.08" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-10)" points="186.13 104.7 184.87 104.7 184.87 114.59 179.94 114.65 179.94 138.73 184.87 138.6 184.87 150.46 186.13 150.42 186.13 138.56 191.02 138.43 191.02 114.52 186.13 114.57 186.13 104.7" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-11)" points="209.42 60.94 208.2 60.91 208.2 94.56 202.19 94.56 202.19 124.02 208.2 123.91 208.2 148.67 209.42 148.62 209.42 123.89 215.25 123.78 215.25 94.57 209.42 94.57 209.42 60.94" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-12)" points="232.25 63.53 231.07 63.5 231.07 67.89 225.48 67.78 225.48 137.48 231.07 137.33 231.07 158.42 232.25 158.37 232.25 137.3 237.79 137.14 237.79 68.02 232.25 67.91 232.25 63.53" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-13)" points="263.08 29.24 261.94 29.18 261.94 39.24 253.02 38.89 253.02 103.26 261.94 103.22 261.94 114.75 263.08 114.74 263.08 103.21 271.76 103.18 271.76 39.63 263.08 39.29 263.08 29.24" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-14)" points="289.26 30.45 288.17 30.4 288.17 40.28 278.9 39.91 278.9 53.3 288.17 53.58 288.17 73.07 289.26 73.09 289.26 53.61 298.39 53.89 298.39 40.68 289.26 40.32 289.26 30.45" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-15)" points="347.01 45 346 44.96 346 61.13 340.73 61 340.73 119.86 346 119.77 346 143.91 347.01 143.87 347.01 119.75 352.23 119.66 352.23 61.3 347.01 61.16 347.01 45" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-16)" points="366.57 41.5 365.59 41.46 365.59 73.1 360.97 73.02 360.97 104.77 365.59 104.74 365.59 120.19 366.57 120.17 366.57 104.73 371.06 104.71 371.06 73.2 366.57 73.12 366.57 41.5" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-17)" points="384.63 74.41 383.68 74.4 383.68 87.67 378.89 87.64 378.89 156.58 383.68 156.37 383.68 170.38 384.63 170.33 384.63 156.33 389.38 156.11 389.38 87.71 384.63 87.68 384.63 74.41" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-18)" points="400.82 140.44 399.89 140.47 399.89 144.11 395.4 144.27 395.4 172.53 399.89 172.27 399.89 179.8 400.82 179.74 400.82 172.22 405.27 171.96 405.27 143.91 400.82 144.08 400.82 140.44" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-19)" points="419.43 143.4 418.52 143.44 418.52 146.91 412.16 147.15 412.16 157.62 418.52 157.32 418.52 182.21 419.43 182.15 419.43 157.28 425.63 156.99 425.63 146.63 419.43 146.87 419.43 143.4" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-20)" points="440.76 82.41 439.88 82.4 439.88 105.94 435.84 105.97 435.84 152.26 444.68 151.87 444.68 105.9 440.76 105.93 440.76 82.41" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-21)" points="460.21 74.75 459.36 74.73 459.36 89.45 455.02 89.43 455.02 125.6 459.36 125.5 459.36 147.41 460.21 147.37 460.21 125.48 464.52 125.38 464.52 89.48 460.21 89.46 460.21 74.75" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-22)" points="476.03 84.17 475.21 84.16 475.21 88.28 471.05 88.26 471.05 111.22 475.21 111.17 475.21 121.25 476.03 121.23 476.03 111.16 480.07 111.12 480.07 88.32 476.03 88.29 476.03 84.17" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-23)" points="513.39 61.92 512.61 61.89 512.61 87.31 508.31 87.28 508.31 137.74 512.61 137.6 512.61 148.47 513.39 148.44 513.39 137.57 517.65 137.42 517.65 87.35 513.39 87.32 513.39 61.92" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-24)" points="527.52 119.33 526.76 119.34 526.76 126.8 522.8 126.9 522.8 159.92 531.46 159.46 531.46 126.68 527.52 126.78 527.52 119.33" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-25)" points="544.81 124.51 544.07 124.53 544.07 134.79 538.88 134.96 538.88 144.19 544.07 143.98 544.07 159.55 544.81 159.51 544.81 143.95 549.87 143.75 549.87 134.61 544.81 134.77 544.81 124.51" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-26)" points="561.6 82.26 560.88 82.25 560.88 87.68 556.2 87.65 556.2 143.49 560.88 143.3 560.88 158.65 561.6 158.61 561.6 143.27 566.23 143.09 566.23 87.73 561.6 87.69 561.6 82.26" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-27)" points="576.03 35.64 575.33 35.61 575.33 62.23 569.92 62.06 569.92 95.05 575.33 95.06 575.33 112.1 576.03 112.09 576.03 95.06 581.38 95.06 581.38 62.41 576.03 62.25 576.03 35.64" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-28)" points="592.28 28.43 591.6 28.39 591.6 45.19 587.17 44.99 587.17 65.4 591.6 65.52 591.6 95.7 592.28 95.7 592.28 65.54 596.68 65.66 596.68 45.42 592.28 45.22 592.28 28.43" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-29)" points="609.66 23.56 609 23.52 609 41.29 604.43 41.06 604.43 88.02 609 88.05 609 106.03 609.66 106.02 609.66 88.06 614.18 88.09 614.18 41.55 609.66 41.32 609.66 23.56" style={{ mixBlendMode: 'screen' }} />
              <polygon fill="url(#lg-30)" points="318.42 14.27 317.36 14.21 317.36 20.14 313.04 19.91 313.04 69.47 317.36 69.55 317.36 90.45 318.42 90.46 318.42 69.57 322.6 69.65 322.6 20.43 318.42 20.2 318.42 14.27" style={{ mixBlendMode: 'screen' }} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
