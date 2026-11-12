# The Token Queue ⚡
> *Uma experiência web 3D imersiva e editorial no padrão Awwwards Site of the Day, retratando o contraste entre o gargalo da operação manual de chat e a eficiência técnica da orquestração autônoma de agentes.*

---

## 🚀 Como Executar

### 1. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173`) no seu navegador.

### 2. Gerar a build de produção
```bash
npm run build
```

---

## 🛠 Stack Tecnológica

- **Vite**: Bundler moderno e ultrarrápido com suporte a ES Modules nativos.
- **Three.js**: Renderização 3D WebGL de alta fidelidade com iluminação realista, sombras suaves e materiais físicos avançados (`MeshPhysicalMaterial`).
- **GSAP & ScrollTrigger**: Orquestração matemática e transições de cena sincronizadas ao scroll.
- **Lenis**: Smooth scrolling de alta precisão conectado diretamente ao RAF loop do GSAP e Three.js.
- **Post-Processing (GLSL Shader Pass)**: Shader customizado de aberração cromática e transição quântica.

---

## 🎭 A Narrativa dos 5 Atos

1. **Ato 1: A Fila de Espera por Recursos**
   - Objeto 3D: Dodecaedro e ampulheta geométrica em wireframe instável com rotação quantizada/truncada.
   - UI: Alerta flutuante com HTTP 429, cronômetro técnico de janela de cota e telemetria de taxa de requisições.

2. **Ato 2: O Processamento Manual de Contexto**
   - Objeto 3D: Vórtice espiral contendo 50 abas de chat flutuantes renderizadas em altíssima performance com `THREE.InstancedMesh`.
   - UI: Chips técnicos de comandos manuais repetitivos e métricas de tempo gasto em transferências.

3. **Ato 3: A Transição para Infraestrutura Dedicada**
   - Objeto 3D: Cartão com cantos chanfrados em `MeshPhysicalMaterial` (`transmission: 0.92`, `roughness: 0.1`, `ior: 1.5`), com chip de ouro e anel de transição.
   - Efeito: Disparo de aberração cromática suave (`RgbShiftShader`) simulando o desbloqueio de capacidade computacional dedicada.

4. **Ato 4: Orquestração Autônoma de Agentes**
   - Objeto 3D: Núcleo esférico de metal líquido com luz ciano pulsante, conectado por feixes luminosos (`THREE.LineSegments`) a múltiplos sub-nós orbitais que giram organicamente.
   - UI: Terminal minimalista com feed de execução do pipeline multi-agente em tempo real.

5. **Ato 5: O Balanço de Produtividade**
   - Objeto 3D: Três anéis concêntricos gravitacionais e partículas de convergência.
   - UI: Balança comparativa (Operação Manual vs. Fluxo Agêntico Integrado), simulador de horas economizadas e botão magnético "RECUPERAR SEU TEMPO DE VIDA".
