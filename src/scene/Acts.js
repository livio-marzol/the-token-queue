import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/examples/jsm/lines/WireframeGeometry2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json';

export class ActsManager {
  constructor(world) {
    this.world = world;
    this.scene = world.scene;

    // Grupos de cada ato
    this.act1Group = new THREE.Group();
    this.act2Group = new THREE.Group();
    this.act3Group = new THREE.Group();
    this.act4Group = new THREE.Group();
    this.act5Group = new THREE.Group();

    // Grupo global de Cubos Interativos (interactive / cubes)
    this.interactiveCubesGroup = new THREE.Group();
    this.scene.add(this.interactiveCubesGroup);

    this.scene.add(this.act1Group);
    this.scene.add(this.act2Group);
    this.scene.add(this.act3Group);
    this.scene.add(this.act4Group);
    this.scene.add(this.act5Group);

    this.initTextStroke3D(); // geometry / text / stroke
    this.initAct1();         // lines / fat / wireframe
    this.initAct2();         // instancing / dynamic
    this.initAct3();         // lights / rectarealight
    this.initAct4();
    this.initAct5();
    this.initInteractiveCubes(); // interactive / cubes

    this.applyInitialStates();
    this.bindEvents();
  }

  bindEvents() {
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    if (this.fatLineMaterial) {
      this.fatLineMaterial.resolution.set(width, height);
    }
    if (this.textGroup) {
      if (isMobile) {
        this.textGroup.scale.set(0.38, 0.38, 0.38);
        this.textGroup.position.set(0, 3.4, -2.5);
      } else {
        this.textGroup.scale.set(1, 1, 1);
        this.textGroup.position.set(0, 2.3, -1);
      }
    }
    if (this.act1Mesh) {
      if (isMobile) {
        this.act1Mesh.scale.set(0.72, 0.72, 0.72);
        this.act1Mesh.position.set(0, -0.2, -1.0);
      } else {
        this.act1Mesh.scale.set(1, 1, 1);
        this.act1Mesh.position.set(0, 0, 0);
      }
    }
  }

  // ==========================================
  // TÉCNICA 1: geometry / text / stroke
  // Letreiro 3D tipográfico com contorno stroke de luz e chanfro físico
  // ==========================================
  initTextStroke3D() {
    this.textGroup = new THREE.Group();
    const loader = new FontLoader();
    const font = loader.parse(helvetikerBold);

    const textGeometry = new TextGeometry('THE TOKEN QUEUE', {
      font: font,
      size: 0.42,
      depth: 0.12,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.015,
      bevelOffset: 0,
      bevelSegments: 4
    });

    textGeometry.center();

    // Material de corpo do texto
    const textMat = new THREE.MeshPhysicalMaterial({
      color: 0x121520,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0
    });
    this.textMesh = new THREE.Mesh(textGeometry, textMat);
    this.textGroup.add(this.textMesh);

    // Contorno (Stroke) luminoso das arestas da tipografia
    const edges = new THREE.EdgesGeometry(textGeometry, 25);
    const strokeMat = new THREE.LineBasicMaterial({
      color: 0xe6be8a,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    this.textStrokeMesh = new THREE.LineSegments(edges, strokeMat);
    this.textGroup.add(this.textStrokeMesh);

    // Posicionamento acima do centro na abertura, com escala adaptativa para mobile
    const isMobile = this.world.isMobile || window.innerWidth < 768;
    if (isMobile) {
      this.textGroup.scale.set(0.38, 0.38, 0.38);
      this.textGroup.position.set(0, 3.4, -2.5);
    } else {
      this.textGroup.scale.set(1, 1, 1);
      this.textGroup.position.set(0, 2.3, -1);
    }
    this.act1Group.add(this.textGroup);
  }

  // ==========================================
  // ATO 1 + TÉCNICA: lines / fat / wireframe
  // Dodecaedro instável renderizado com linhas fat wireframe em pixels reais
  // ==========================================
  initAct1() {
    this.act1Group.position.set(0, 0, 0);

    const dodecaGeo = new THREE.DodecahedronGeometry(1.6, 1);
    const wireGeo = new WireframeGeometry2(dodecaGeo);

    this.fatLineMaterial = new LineMaterial({
      color: 0xff334b,
      linewidth: 3.5, // Largura em pixels de tela
      dashed: false,
      transparent: true,
      opacity: 0.95
    });
    this.fatLineMaterial.resolution.set(window.innerWidth, window.innerHeight);

    this.act1Mesh = new Wireframe(wireGeo, this.fatLineMaterial);
    if (this.world.isMobile || window.innerWidth < 768) {
      this.act1Mesh.scale.set(0.72, 0.72, 0.72);
      this.act1Mesh.position.set(0, -0.2, -1.0);
    }
    this.act1Group.add(this.act1Mesh);

    // Ampulheta interior
    const coneTopGeo = new THREE.ConeGeometry(0.7, 0.9, 8, 1, true);
    const coneBottomGeo = new THREE.ConeGeometry(0.7, 0.9, 8, 1, true);
    coneTopGeo.rotateX(Math.PI);
    coneTopGeo.translate(0, 0.45, 0);
    coneBottomGeo.translate(0, -0.45, 0);

    const hourglassMat = new THREE.MeshBasicMaterial({
      color: 0x8892b0,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });

    this.hourglassTop = new THREE.Mesh(coneTopGeo, hourglassMat);
    this.hourglassBottom = new THREE.Mesh(coneBottomGeo, hourglassMat);
    
    this.act1HourglassGroup = new THREE.Group();
    this.act1HourglassGroup.add(this.hourglassTop);
    this.act1HourglassGroup.add(this.hourglassBottom);
    this.act1Group.add(this.act1HourglassGroup);

    // Partículas
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3.5;
      positions[i + 1] = (Math.random() - 0.5) * 3.5;
      positions[i + 2] = (Math.random() - 0.5) * 3.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xff334b,
      size: 0.045,
      transparent: true,
      opacity: 0.75
    });
    this.act1Particles = new THREE.Points(particleGeo, particleMat);
    this.act1Group.add(this.act1Particles);
  }

  // ==========================================
  // ATO 2 + TÉCNICA: instancing / dynamic
  // Malha dinâmica de 80 instâncias computadas em tempo real com DynamicDrawUsage
  // ==========================================
  initAct2() {
    this.act2Group.position.set(0, 0, 0);

    this.instancedCount = 75;
    const cardGeo = new THREE.BoxGeometry(1.2, 0.75, 0.05);

    const instancedMat = new THREE.MeshStandardMaterial({
      color: 0x161a26,
      roughness: 0.35,
      metalness: 0.8,
      emissive: 0x0a0d17,
      emissiveIntensity: 0.4
    });

    this.tabsMesh = new THREE.InstancedMesh(cardGeo, instancedMat, this.instancedCount);
    this.tabsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this.tabTransforms = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < this.instancedCount; i++) {
      const progress = i / this.instancedCount;
      const angle = progress * Math.PI * 6.5;
      const radius = 2.0 + progress * 1.6;
      const y = (progress - 0.5) * 6.5;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        Math.sin(i * 0.4) * 0.3,
        -angle + Math.PI / 2,
        Math.cos(i * 0.3) * 0.2
      );
      dummy.updateMatrix();

      this.tabsMesh.setMatrixAt(i, dummy.matrix);

      this.tabTransforms.push({
        baseAngle: angle,
        baseRadius: radius,
        baseY: y,
        speed: 0.5 + (i % 5) * 0.15,
        waveFreq: 2.0 + (i % 3) * 0.5
      });
    }

    this.tabsMesh.instanceMatrix.needsUpdate = true;
    this.act2Group.add(this.tabsMesh);

    // Contornos de aresta das instâncias
    const edgesGeo = new THREE.EdgesGeometry(cardGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3d4457, transparent: true, opacity: 0.6 });
    this.tabEdgesMesh = new THREE.InstancedMesh(edgesGeo, lineMat, this.instancedCount);
    for (let i = 0; i < this.instancedCount; i++) {
      this.tabsMesh.getMatrixAt(i, dummy.matrix);
      this.tabEdgesMesh.setMatrixAt(i, dummy.matrix);
    }
    this.tabEdgesMesh.instanceMatrix.needsUpdate = true;
    this.act2Group.add(this.tabEdgesMesh);
  }

  // ==========================================
  // ATO 3: A Transição para Infraestrutura Dedicada
  // Vidro físico com reflexos realistas das RectAreaLights
  // ==========================================
  initAct3() {
    this.act3Group.position.set(0, 0, 0);

    const width = 2.4;
    const height = 1.5;
    const radius = 0.12;

    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    const extrudeSettings = {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };

    const cardGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    cardGeometry.center();

    this.cardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      thickness: 1.2,
      specularIntensity: 1.0,
      specularColor: 0xffffff,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: 0xc99757,
      attenuationDistance: 1.8
    });

    this.cardMesh = new THREE.Mesh(cardGeometry, this.cardMaterial);
    this.cardMesh.castShadow = true;
    this.act3Group.add(this.cardMesh);

    // Chip de Ouro
    const chipGeo = new THREE.BoxGeometry(0.38, 0.3, 0.06);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x5a4110,
      emissiveIntensity: 0.2
    });
    this.chipMesh = new THREE.Mesh(chipGeo, chipMat);
    this.chipMesh.position.set(-0.6, 0.1, 0.035);
    this.act3Group.add(this.chipMesh);

    // Tarja magnética
    const magStripeGeo = new THREE.PlaneGeometry(width * 0.96, 0.24);
    const magStripeMat = new THREE.MeshStandardMaterial({
      color: 0x0e1118,
      metalness: 0.8,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    this.magStripe = new THREE.Mesh(magStripeGeo, magStripeMat);
    this.magStripe.position.set(0, 0.35, -0.04);
    this.act3Group.add(this.magStripe);

    // Anel orbital de transição
    const ringGeo = new THREE.TorusGeometry(1.9, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc99757,
      transparent: true,
      opacity: 0.85
    });
    this.breakthroughRing = new THREE.Mesh(ringGeo, ringMat);
    this.breakthroughRing.rotation.x = Math.PI / 3;
    this.act3Group.add(this.breakthroughRing);
  }

  // ==========================================
  // ATO 4: Orquestração Autônoma de Agentes
  // ==========================================
  initAct4() {
    this.act4Group.position.set(0, 0, 0);

    const coreGeo = new THREE.IcosahedronGeometry(1.2, 4);
    this.coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      metalness: 0.95,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: 0x004455,
      emissiveIntensity: 0.4
    });
    this.agentCoreMesh = new THREE.Mesh(coreGeo, this.coreMaterial);
    this.act4Group.add(this.agentCoreMesh);

    const coreAuraGeo = new THREE.IcosahedronGeometry(1.35, 2);
    const coreAuraMat = new THREE.MeshBasicMaterial({
      color: 0x00ff9d,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.coreAuraMesh = new THREE.Mesh(coreAuraGeo, coreAuraMat);
    this.act4Group.add(this.coreAuraMesh);

    // Sub-nós orbitais
    this.subNodeCount = 7;
    this.subNodes = [];
    const subNodeGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const subNodeMat = new THREE.MeshStandardMaterial({
      color: 0xc99757,
      emissive: 0x8c5e25,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });

    for (let i = 0; i < this.subNodeCount; i++) {
      const node = new THREE.Mesh(subNodeGeo, subNodeMat);
      const angle = (i / this.subNodeCount) * Math.PI * 2;
      const distance = 2.4 + (i % 2) * 0.7;
      const elevation = Math.sin(i * 1.5) * 1.1;

      node.userData = {
        baseAngle: angle,
        orbitRadius: distance,
        elevation: elevation,
        speed: 0.6 + (i % 3) * 0.25
      };

      this.act4Group.add(node);
      this.subNodes.push(node);
    }

    const beamPositions = new Float32Array(this.subNodeCount * 2 * 3);
    this.beamGeometry = new THREE.BufferGeometry();
    this.beamGeometry.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));

    const beamMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.beamLines = new THREE.LineSegments(this.beamGeometry, beamMaterial);
    this.act4Group.add(this.beamLines);
  }

  // ==========================================
  // ATO 5: O Simpósio da Automação (Atelier Neoclássico)
  // ==========================================
  initAct5() {
    this.act5Group.position.set(0, 0, 0);

    this.sovereigntyRings = [];
    const ringRadii = [3.0, 3.8, 4.6];
    const ringColors = [0xc99757, 0xdfb15b, 0xe6be8a];
    
    ringRadii.forEach((rad, index) => {
      const ringG = new THREE.TorusGeometry(rad, 0.022, 16, 140);
      const ringM = new THREE.MeshStandardMaterial({
        color: ringColors[index],
        metalness: 0.9,
        roughness: 0.2,
        emissive: ringColors[index],
        emissiveIntensity: 0.15
      });
      const ring = new THREE.Mesh(ringG, ringM);
      ring.rotation.x = (index + 1) * 0.35;
      ring.rotation.y = (index + 1) * 0.55;
      this.act5Group.add(ring);
      this.sovereigntyRings.push(ring);
    });

    // Partículas âmbar e bronze
    const dustCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 2.5 + Math.random() * 3.5;

      dustPositions[i] = dist * Math.sin(phi) * Math.cos(theta);
      dustPositions[i + 1] = dist * Math.sin(phi) * Math.sin(theta);
      dustPositions[i + 2] = dist * Math.cos(phi);
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffb366,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    this.act5Dust = new THREE.Points(dustGeo, dustMat);
    this.act5Group.add(this.act5Dust);
  }

  // ==========================================
  // TÉCNICA 5: interactive / cubes
  // Campo de 32 cubos físicos interativos que reagem ao mouse via Raycaster
  // ==========================================
  initInteractiveCubes() {
    this.interactiveCubes = [];
    const cubeGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);

    const positions = [
      [-3.2, 2.0, -1.0], [-2.5, 3.2, 0.5], [2.8, 2.8, -0.5], [3.5, 1.5, 0.8],
      [-3.8, -1.2, 0.2], [-2.8, -2.5, -0.8], [3.2, -1.8, -1.2], [2.4, -3.0, 0.4],
      [-4.2, 0.2, 1.2], [4.1, -0.2, 1.0], [-1.8, 3.6, -1.5], [1.6, 3.4, -1.2],
      [-1.5, -3.4, -0.5], [1.2, -3.6, -1.0], [-3.0, -0.5, 2.0], [3.0, 0.8, 2.2],
      [-4.0, 2.5, 0.0], [4.0, 2.2, 0.0], [-2.2, 1.5, 2.5], [2.2, 1.2, 2.4]
    ];

    positions.forEach((pos, idx) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x141824,
        metalness: 0.85,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x000000,
        emissiveIntensity: 0.0
      });

      const cube = new THREE.Mesh(cubeGeo, mat);
      cube.position.set(pos[0], pos[1], pos[2]);
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      cube.userData = {
        id: idx,
        origPos: cube.position.clone(),
        origRot: cube.rotation.clone(),
        targetScale: 1.0,
        currentScale: 1.0,
        targetEmissive: 0.0,
        targetColor: new THREE.Color(idx % 2 === 0 ? 0xc99757 : 0x00f0ff),
        rotSpeed: 0.5 + Math.random() * 0.8
      };

      this.interactiveCubesGroup.add(cube);
      this.interactiveCubes.push(cube);
    });
  }

  // Loop de Interação dos Cubos com Raycaster
  updateInteractiveCubes(raycaster, camera) {
    if (!raycaster || !camera) return;

    // Raycast contra os cubos interativos
    const intersects = raycaster.intersectObjects(this.interactiveCubes, false);
    const hitMap = new Set();

    intersects.forEach((hit) => {
      hitMap.add(hit.object);
      const u = hit.object.userData;
      u.targetScale = 1.6; // Ampliação no hover
      u.targetEmissive = 2.0; // Brilho emissivo acentuado
      hit.object.rotation.x += 0.05;
      hit.object.rotation.y += 0.05;
    });

    // Atualização com interpolação suave (lerp)
    this.interactiveCubes.forEach((cube) => {
      const u = cube.userData;
      if (!hitMap.has(cube)) {
        u.targetScale = 1.0;
        u.targetEmissive = 0.0;
      }

      u.currentScale += (u.targetScale - u.currentScale) * 0.12;
      cube.scale.set(u.currentScale, u.currentScale, u.currentScale);

      cube.material.emissive.copy(u.targetColor);
      cube.material.emissiveIntensity += (u.targetEmissive - cube.material.emissiveIntensity) * 0.15;

      // Rotação suave contínua em repouso
      cube.rotation.x += 0.005 * u.rotSpeed;
      cube.rotation.y += 0.008 * u.rotSpeed;
    });
  }

  applyInitialStates() {
    this.act1Group.scale.set(1, 1, 1);
    this.act1Group.visible = true;

    this.act2Group.scale.set(0.001, 0.001, 0.001);
    this.act2Group.visible = false;

    this.act3Group.scale.set(0.001, 0.001, 0.001);
    this.act3Group.position.set(0, 0, -2);
    this.act3Group.visible = false;

    this.act4Group.scale.set(0.001, 0.001, 0.001);
    this.act4Group.visible = false;

    this.act5Group.scale.set(0.001, 0.001, 0.001);
    this.act5Group.visible = false;
  }

  update(delta, elapsed) {
    // Animação da tipografia 3D stroke
    if (this.textGroup && this.act1Group.visible) {
      this.textGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.15;
      this.textGroup.position.y = 2.3 + Math.sin(elapsed * 1.5) * 0.08;
    }

    // Loop Ato 1: fat lines wireframe
    if (this.act1Group.visible) {
      const steppedTime = Math.floor(elapsed * 6) / 6;
      this.act1Mesh.rotation.x = steppedTime * 0.4 + Math.sin(elapsed * 1.5) * 0.1;
      this.act1Mesh.rotation.y = steppedTime * 0.6;

      const jitterX = (Math.random() - 0.5) * 0.02;
      const jitterY = (Math.random() - 0.5) * 0.02;
      this.act1HourglassGroup.position.set(jitterX, jitterY, 0);
      this.act1HourglassGroup.rotation.y = elapsed * 0.8;

      if (this.act1Particles) {
        this.act1Particles.rotation.y = elapsed * 0.15;
      }
    }

    // Loop Ato 2: instancing / dynamic
    if (this.act2Group.visible && this.tabsMesh) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.instancedCount; i++) {
        const item = this.tabTransforms[i];
        const currentAngle = item.baseAngle + elapsed * 0.15 * item.speed;
        const currentY = item.baseY + Math.sin(elapsed * item.waveFreq + i) * 0.22;

        dummy.position.set(
          Math.cos(currentAngle) * item.baseRadius,
          currentY,
          Math.sin(currentAngle) * item.baseRadius
        );
        dummy.rotation.set(
          Math.sin(elapsed * 0.8 + i) * 0.2,
          -currentAngle + Math.PI / 2,
          Math.cos(elapsed * 0.6 + i) * 0.15
        );
        dummy.updateMatrix();

        this.tabsMesh.setMatrixAt(i, dummy.matrix);
        if (this.tabEdgesMesh) {
          this.tabEdgesMesh.setMatrixAt(i, dummy.matrix);
        }
      }
      this.tabsMesh.instanceMatrix.needsUpdate = true;
      if (this.tabEdgesMesh) this.tabEdgesMesh.instanceMatrix.needsUpdate = true;
    }

    // Loop Ato 3: cartão e reflexos
    if (this.act3Group.visible) {
      this.cardMesh.rotation.y = Math.sin(elapsed * 0.8) * 0.45;
      this.cardMesh.rotation.x = Math.cos(elapsed * 0.6) * 0.25;
      this.cardMesh.position.y = Math.sin(elapsed * 1.5) * 0.15;

      this.chipMesh.rotation.copy(this.cardMesh.rotation);
      this.chipMesh.position.y = this.cardMesh.position.y + 0.1;

      this.magStripe.rotation.copy(this.cardMesh.rotation);
      this.magStripe.position.y = this.cardMesh.position.y + 0.35;

      this.breakthroughRing.rotation.z = elapsed * 0.5;
      this.breakthroughRing.rotation.x = Math.PI / 3 + Math.sin(elapsed) * 0.1;
    }

    // Loop Ato 4: orquestração
    if (this.act4Group.visible) {
      this.agentCoreMesh.rotation.y = elapsed * 0.5;
      this.agentCoreMesh.rotation.x = Math.sin(elapsed * 0.7) * 0.2;
      this.coreAuraMesh.rotation.y = -elapsed * 0.3;
      this.coreAuraMesh.rotation.z = elapsed * 0.2;

      const positions = this.beamGeometry.attributes.position.array;
      const corePos = this.agentCoreMesh.position;

      this.subNodes.forEach((node, index) => {
        const u = node.userData;
        const currentAngle = u.baseAngle + elapsed * u.speed;
        
        node.position.set(
          Math.cos(currentAngle) * u.orbitRadius,
          u.elevation + Math.sin(elapsed * 2.0 + index) * 0.3,
          Math.sin(currentAngle) * u.orbitRadius
        );

        const lineIndex = index * 6;
        positions[lineIndex] = corePos.x;
        positions[lineIndex + 1] = corePos.y;
        positions[lineIndex + 2] = corePos.z;

        positions[lineIndex + 3] = node.position.x;
        positions[lineIndex + 4] = node.position.y;
        positions[lineIndex + 5] = node.position.z;
      });

      this.beamGeometry.attributes.position.needsUpdate = true;
    }

    // Loop Ato 5: atelier
    if (this.act5Group.visible) {
      this.sovereigntyRings.forEach((ring, idx) => {
        ring.rotation.z = elapsed * (0.2 + idx * 0.1);
        ring.rotation.y = elapsed * (0.15 + idx * 0.08);
      });

      if (this.act5Dust) {
        this.act5Dust.rotation.y = elapsed * 0.08;
      }
    }
  }
}
