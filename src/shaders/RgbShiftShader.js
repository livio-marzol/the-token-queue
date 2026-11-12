/**
 * RgbShiftShader
 * Custom Post-Processing Shader para Aberração Cromática e Distorção Quântica
 * Usado para a transição "Quebra da Matrix" no Ato 3 (A Transmutação do Cartão de Crédito)
 */

export const RgbShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAmount: { value: 0.0 },
    uAngle: { value: 0.0 },
    uDistortion: { value: 0.0 },
    uTime: { value: 0.0 }
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    uniform float uAngle;
    uniform float uDistortion;
    uniform float uTime;

    varying vec2 vUv;

    // Função de ruído procedural simples
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;

      // Efeito de glitch horizontal reativo à distorção
      if (uDistortion > 0.001) {
        float noiseBar = step(0.92, sin(uv.y * 30.0 + uTime * 20.0));
        float glitchOffset = (hash(vec2(floor(uv.y * 20.0), floor(uTime * 15.0))) - 0.5) * 0.04 * uDistortion;
        uv.x += glitchOffset * noiseBar;
      }

      // Cálculo do offset da aberração cromática
      vec2 offset = uAmount * vec2(cos(uAngle), sin(uAngle));
      
      // Distorção radial sutil na borda
      vec2 centerOffset = uv - 0.5;
      float distFromCenter = dot(centerOffset, centerOffset);
      vec2 radialOffset = centerOffset * distFromCenter * (uAmount * 1.5);

      vec2 uvR = uv + offset + radialOffset;
      vec2 uvG = uv;
      vec2 uvB = uv - offset - radialOffset;

      float r = texture2D(tDiffuse, uvR).r;
      float g = texture2D(tDiffuse, uvG).g;
      float b = texture2D(tDiffuse, uvB).b;
      float a = texture2D(tDiffuse, uv).a;

      // Scanline sutil nas partes afetadas
      float scanline = sin(uv.y * 800.0) * 0.03 * uDistortion;
      vec3 color = vec3(r, g, b) - scanline;

      gl_FragColor = vec4(color, a);
    }
  `
};
