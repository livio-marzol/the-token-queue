import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import Lenis from 'lenis';

import { World } from './src/scene/World.js';
import { ActsManager } from './src/scene/Acts.js';

// Registrar plugin GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.initLenis();
    this.initThree();
    this.initScrollAnimations();
    this.initPhilosophySymposium();
    this.initCalculator();
    this.initSatiricalTimer();
  }

  // ==========================================
  // 1. Lenis Smooth Scroll sincronizado com GSAP
  // ==========================================
  initLenis() {
    this.lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
      infinite: false
    });

    // Sincroniza Lenis com o ScrollTrigger
    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      this.updateProgressBar(e.progress);
    });

    // Adiciona o Lenis ao RAF ticker do GSAP
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  updateProgressBar(progress) {
    const fill = document.getElementById('progress-fill');
    if (fill) {
      fill.style.width = `${progress * 100}%`;
    }
  }

  // ==========================================
  // 2. Inicialização do Three.js & Loop Principal com Raycasting
  // ==========================================
  initThree() {
    this.world = new World(this.container);
    this.acts = new ActsManager(this.world);

    this.clock = new THREE.Clock();

    const tick = () => {
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Atualiza o Raycaster para a técnica interactive / cubes
      this.world.raycaster.setFromCamera(this.world.pointer, this.world.camera);
      this.acts.updateInteractiveCubes(this.world.raycaster, this.world.camera);

      this.acts.update(delta, elapsed);
      this.world.update(delta, elapsed);
      this.world.render();

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // ==========================================
  // 3. GSAP ScrollTrigger para as Seções (Sem Numeradores)
  // ==========================================
  initScrollAnimations() {
    const actTag = document.getElementById('current-act-tag');
    const quotaPill = document.getElementById('quota-status-pill');
    const quotaText = document.getElementById('quota-text');

    // Transição da Câmera pelo Espaço Tridimensional
    const cameraTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    cameraTimeline
      // Fila de Recursos -> Processamento Manual
      .to(this.world.camera.position, { x: 1.5, y: -0.5, z: 6.5, ease: 'none' }, 0.2)
      // Processamento Manual -> Transição Dedicada
      .to(this.world.camera.position, { x: 0, y: 0, z: 4.8, ease: 'none' }, 0.45)
      // Transição Dedicada -> Orquestração de Agentes
      .to(this.world.camera.position, { x: 0, y: 0.8, z: 7.2, ease: 'none' }, 0.7)
      // Orquestração de Agentes -> O Simpósio da Automação
      .to(this.world.camera.position, { x: 0, y: 0, z: 8.8, ease: 'none' }, 0.95);

    // ========================================
    // Seção 1: Fila de Espera por Recursos
    // ========================================
    ScrollTrigger.create({
      trigger: '#act-1',
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        if (actTag) actTag.innerText = 'FILA DE RECURSOS';
        if (quotaPill) {
          quotaPill.className = 'quota-pill status-danger';
          quotaText.innerText = 'RPM: 0/15 [EXCEDIDO]';
        }
      },
      onEnterBack: () => {
        if (actTag) actTag.innerText = 'FILA DE RECURSOS';
        if (quotaPill) {
          quotaPill.className = 'quota-pill status-danger';
          quotaText.innerText = 'RPM: 0/15 [EXCEDIDO]';
        }
      }
    });

    // Saída da Seção 1 e entrada da Seção 2
    gsap.timeline({
      scrollTrigger: {
        trigger: '#act-2',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1
      }
    })
    .to(this.acts.act1Group.scale, { x: 0.001, y: 0.001, z: 0.001, ease: 'power2.inOut' })
    .to(this.acts.act1Group.position, { y: 2, ease: 'power2.inOut' }, 0)
    .to(this.acts.act2Group.scale, {
      x: 1,
      y: 1,
      z: 1,
      ease: 'power2.out',
      onStart: () => { this.acts.act2Group.visible = true; }
    }, 0.2);

    // ========================================
    // Seção 2: O Processamento Manual de Contexto
    // ========================================
    ScrollTrigger.create({
      trigger: '#act-2',
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => {
        if (actTag) actTag.innerText = 'PROCESSAMENTO MANUAL';
      },
      onEnterBack: () => {
        if (actTag) actTag.innerText = 'PROCESSAMENTO MANUAL';
      }
    });

    // Transição Seção 2 -> Seção 3 com aberração cromática suave
    const act3Timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#act-3',
        start: 'top 75%',
        end: 'top 15%',
        scrub: 1,
        onEnter: () => {
          this.triggerMatrixShatter();
          if (actTag) actTag.innerText = 'TRANSIÇÃO DE RECURSOS';
          if (quotaPill) {
            quotaPill.className = 'quota-pill status-danger';
            quotaText.innerText = 'SISTEMA: ATIVANDO RECURSOS...';
          }
        },
        onLeaveBack: () => {
          if (actTag) actTag.innerText = 'PROCESSAMENTO MANUAL';
        }
      }
    });

    act3Timeline
      .to(this.acts.act2Group.scale, { x: 0.001, y: 0.001, z: 0.001, ease: 'power3.in' })
      .to(this.acts.act3Group.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: 'elastic.out(1, 0.75)',
        onStart: () => { this.acts.act3Group.visible = true; }
      }, 0.2)
      .to(this.world.errorPointLight, { intensity: 0.2, ease: 'power2.out' }, 0.2);

    // ========================================
    // Seção 3: A Transição para Infraestrutura Dedicada
    // ========================================
    ScrollTrigger.create({
      trigger: '#act-3',
      start: 'top 30%',
      end: 'bottom 30%',
      onEnter: () => {
        if (quotaPill) {
          quotaPill.className = 'quota-pill status-sovereign';
          quotaText.innerText = 'ACESSO ATIVO: DEDICADO';
        }
      }
    });

    // Transição Seção 3 -> Seção 4 (Orquestração Autônoma de Agentes)
    const act4Timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#act-4',
        start: 'top 75%',
        end: 'top 20%',
        scrub: 1,
        onEnter: () => {
          if (actTag) actTag.innerText = 'ORQUESTRAÇÃO DE AGENTES';
          if (quotaPill) {
            quotaPill.className = 'quota-pill status-sovereign';
            quotaText.innerText = 'PIPELINE: ONLINE (7 AGENTES)';
          }
        }
      }
    });

    act4Timeline
      .to(this.acts.act3Group.scale, { x: 0.001, y: 0.001, z: 0.001, ease: 'power2.in' })
      .to(this.acts.act3Group.position, { y: 3, ease: 'power2.in' }, 0)
      .to(this.acts.act4Group.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: 'power3.out',
        onStart: () => { this.acts.act4Group.visible = true; }
      }, 0.2)
      .to(this.world.agenticCoreLight, { intensity: 4.0, ease: 'power2.out' }, 0.2);

    // ========================================
    // Seção 4: Orquestração de Agentes
    // ========================================
    ScrollTrigger.create({
      trigger: '#act-4',
      start: 'top 40%',
      end: 'bottom 40%',
      onEnter: () => {
        if (actTag) actTag.innerText = 'ORQUESTRAÇÃO DE AGENTES';
      }
    });

    // Transição Seção 4 -> Seção 5 (O Simpósio da Automação)
    const act5Timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#act-5',
        start: 'top 80%',
        end: 'top 25%',
        scrub: 1,
        onEnter: () => {
          if (actTag) actTag.innerText = 'SIMPÓSIO DA AUTOMAÇÃO';
          if (quotaPill) {
            quotaPill.className = 'quota-pill status-sovereign';
            quotaText.innerText = 'STATUS: TEMPO RESGATADO';
          }
        }
      }
    });

    act5Timeline
      .to(this.acts.act4Group.position, { y: -0.6, z: -1.8, ease: 'power2.out' })
      .to(this.acts.act4Group.scale, { x: 0.75, y: 0.75, z: 0.75, ease: 'power2.out' }, 0)
      .to(this.acts.act5Group.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: 'power2.out',
        onStart: () => { this.acts.act5Group.visible = true; }
      }, 0.1)
      .to(this.world.symposiumLight, { intensity: 3.5, ease: 'power2.out' }, 0.2);
  }

  // ==========================================
  // Efeito Especial: Transição Cromática / Aberração Suave
  // ==========================================
  triggerMatrixShatter() {
    const params = { amount: 0.025, angle: Math.PI / 4, distortion: 0.6 };

    gsap.killTweensOf(params);
    gsap.timeline()
      .to(params, {
        amount: 0.035,
        distortion: 0.9,
        duration: 0.15,
        ease: 'power1.out',
        onUpdate: () => {
          this.world.setChromaticAberration(params.amount, params.angle, params.distortion);
        }
      })
      .to(params, {
        amount: 0.001,
        distortion: 0.0,
        angle: 0.0,
        duration: 0.7,
        ease: 'power3.out',
        onUpdate: () => {
          this.world.setChromaticAberration(params.amount, params.angle, params.distortion);
        }
      });
  }

  // ==========================================
  // 4. O Simpósio da Automação (Interação Filosófica)
  // ==========================================
  initPhilosophySymposium() {
    const tabs = document.querySelectorAll('.phil-tab');
    const articles = document.querySelectorAll('.phil-content');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = `phil-${tab.getAttribute('data-philosopher')}`;

        // Atualiza estado das abas
        tabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');

        // Transição suave entre os pensadores
        articles.forEach((art) => {
          if (art.id === targetId) {
            art.classList.add('is-active');
            gsap.fromTo(
              art,
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
            );
          } else {
            art.classList.remove('is-active');
          }
        });

        // Pulso harmônico na luz âmbar e nos anéis 3D ao mudar de tese
        if (this.world && this.world.symposiumLight) {
          gsap.timeline()
            .to(this.world.symposiumLight, { intensity: 5.0, duration: 0.15 })
            .to(this.world.symposiumLight, { intensity: 3.5, duration: 0.6 });
        }
      });
    });
  }

  // ==========================================
  // 5. Calculadora de Economia de Tempo Operacional
  // ==========================================
  initCalculator() {
    const slider = document.getElementById('hours-slider');
    const hoursDisplay = document.getElementById('hours-display');
    const freePrompts = document.getElementById('free-prompts-lost');
    const agenticCmds = document.getElementById('agentic-commands');

    if (!slider || !hoursDisplay) return;

    const updateCalculations = () => {
      const hours = parseInt(slider.value, 10);
      hoursDisplay.innerText = `${hours} h/semana`;

      const lostPrompts = hours * 48;
      if (freePrompts) {
        freePrompts.innerText = lostPrompts.toLocaleString('pt-BR');
      }

      if (agenticCmds) {
        agenticCmds.innerText = '1';
      }
    };

    slider.addEventListener('input', updateCalculations);
    updateCalculations();
  }

  // ==========================================
  // 6. Timer Técnico no Alerta 429
  // ==========================================
  initSatiricalTimer() {
    const timerElem = document.getElementById('countdown-timer');
    if (!timerElem) return;

    let totalSeconds = 4 * 3600 + 12 * 60 + 44;

    setInterval(() => {
      totalSeconds--;
      if (totalSeconds < 0) totalSeconds = 5 * 3600;

      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      timerElem.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
  }
}

// Inicializa a aplicação ao carregar o DOM
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
