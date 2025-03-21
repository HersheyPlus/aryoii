<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  // Container reference
  let container: HTMLDivElement;
  
  // Three.js variables
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let overnightOatsGroup: THREE.Group;
  let frameId: number;

  // Responsive variables
  let windowWidth = 0;
  let isSmallScreen = false;
  let isMobileDevice = false;

  // Initialize Three.js scene and components
  function initThree(): void {
    // Check device capabilities and screen size
    checkDeviceCapabilities();

    // Create scene with transparent background
    scene = new THREE.Scene();
    // No background color for transparency

    // Camera setup
    camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    
    // Initial camera position (side view)
    setCameraSideView();

    // Renderer with alpha (transparency) enabled
    renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobileDevice,
      alpha: true 
    });
    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );
    renderer.shadowMap.enabled = !isMobileDevice; // Disable shadows on mobile for performance
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio); // Limit pixel ratio for performance
    container.appendChild(renderer.domElement);

    // Lighting
    setupLighting();
    
    // Create a group for all oats jars
    overnightOatsGroup = new THREE.Group();
    scene.add(overnightOatsGroup);
    
    // Create jars based on screen size
    createResponsiveJars();
    
    // Add a surface below
    createSurface();
  }
  
  function checkDeviceCapabilities(): void {
    // Detect if we're on a mobile device
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Get window width
    windowWidth = window.innerWidth;
    
    // Determine if we're on a small screen
    isSmallScreen = windowWidth < 768;
  }
  
  function createResponsiveJars(): void {
    // Clear any existing jars
    while(overnightOatsGroup.children.length > 0) { 
      overnightOatsGroup.remove(overnightOatsGroup.children[0]); 
    }
    
    if (isSmallScreen) {
      // On small screens, show only one jar in the center
      createMediumJar(0, 0);
    } else if (windowWidth < 1024) {
      // On medium screens, show two jars
      createSmallJar(-2.5, 0);
      createLargeJar(2.5, 0);
    } else {
      // On large screens, show all three jars
      createSmallJar(-4, 0);
      createMediumJar(0, 0);
      createLargeJar(4, 0);
    }
  }
  
  function setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Main directional light (like sunlight)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7);
    
    // Only use shadow casting on desktop
    if (!isMobileDevice) {
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
    }
    
    scene.add(mainLight);

    // Fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 8, -5);
    scene.add(fillLight);
    
    // Soft light from below (reflection)
    const bounceLight = new THREE.DirectionalLight(0xffffff, 0.2);
    bounceLight.position.set(0, -2, 5);
    scene.add(bounceLight);
  }
  
  function createSurface(): void {
    // Removing the surface for transparent background
    // We don't need to create a surface anymore
  }
  
  function createJar(radius: number, height: number, posX: number, posY: number): THREE.Group {
    const jar = new THREE.Group();
    
    // Adjust complexity based on device capability
    const segments = isMobileDevice ? 16 : 32;
    
    // Create glass jar
    const jarGeometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.95,
    });
    const jarMesh = new THREE.Mesh(jarGeometry, glassMaterial);
    
    if (!isMobileDevice) {
      jarMesh.castShadow = true;
      jarMesh.receiveShadow = true;
    }
    
    jar.add(jarMesh);
    
    // Create the cap ring
    const capRingGeometry = new THREE.TorusGeometry(radius * 1.05, radius * 0.1, 8, segments);
    const metalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xaaaaaa,
      roughness: 0.4,
      metalness: 0.8
    });
    const capRing = new THREE.Mesh(capRingGeometry, metalMaterial);
    capRing.position.y = height / 2;
    capRing.rotation.x = Math.PI / 2;
    jar.add(capRing);
    
    // Create the oats content
    createOatsContent(jar, radius, height);
    
    // Position the jar
    jar.position.set(posX, posY, 0);
    
    return jar;
  }
  
  function createOatsContent(jar: THREE.Group, radius: number, height: number): void {
    // Adjust geometry detail based on device
    const segments = isMobileDevice ? 16 : 32;
    
    // Base oats mixture
    const oatsGeometry = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, height * 0.9, segments);
    const oatsMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5e6c9, 
      roughness: 0.8,
      metalness: 0,
    });
    const oats = new THREE.Mesh(oatsGeometry, oatsMaterial);
    oats.position.y = -height * 0.05;
    jar.add(oats);
    
    // Create the berry layer on top
    const berryLayerGeometry = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, height * 0.1, segments);
    const berryLayerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe64d77, 
      roughness: 0.7,
      metalness: 0,
    });
    const berryLayer = new THREE.Mesh(berryLayerGeometry, berryLayerMaterial);
    berryLayer.position.y = height * 0.4;
    jar.add(berryLayer);
    
    // Add visible oat flakes and chia seeds (reduce count on mobile)
    const detailMultiplier = isMobileDevice ? 0.5 : 1;
    
    // Add oat flakes with reduced count on mobile
    addOatFlakes(jar, radius, height, Math.floor(50 * detailMultiplier));
    
    // Add chia seeds with reduced count on mobile
    addChiaSeeds(jar, radius, height, Math.floor(100 * detailMultiplier));
  }
  
  function addOatFlakes(jar: THREE.Group, radius: number, height: number, count: number): void {
    const flakeGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.15);
    const flakeMaterial = new THREE.MeshStandardMaterial({ color: 0xd9c097 });
    
    for (let i = 0; i < count; i++) {
      const flake = new THREE.Mesh(flakeGeometry, flakeMaterial);
      
      // Random position within the jar
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius * 0.85);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.random() * height * 0.8 - height * 0.4;
      
      flake.position.set(x, y, z);
      flake.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      jar.add(flake);
    }
  }
  
  function addChiaSeeds(jar: THREE.Group, radius: number, height: number, count: number): void {
    // Use lower poly geometry on mobile
    const seedGeometry = new THREE.SphereGeometry(0.03, isMobileDevice ? 4 : 8, isMobileDevice ? 4 : 8);
    const seedMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    for (let i = 0; i < count; i++) {
      const seed = new THREE.Mesh(seedGeometry, seedMaterial);
      
      // Random position within the jar
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius * 0.85);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.random() * height * 0.8 - height * 0.4;
      
      seed.position.set(x, y, z);
      jar.add(seed);
    }
  }
  
  function addToppings(jar: THREE.Group, radius: number, height: number, type: 'mixed' | 'blueberry' | 'strawberry'): void {
    const toppingsGroup = new THREE.Group();
    jar.add(toppingsGroup);
    
    // Reduce detail on mobile
    const detailMultiplier = isMobileDevice ? 0.7 : 1;
    
    // Add berries
    if (type === 'mixed' || type === 'blueberry') {
      addBlueberries(toppingsGroup, radius, height, detailMultiplier);
    }
    
    if (type === 'mixed' || type === 'strawberry') {
      addStrawberries(toppingsGroup, radius, height, detailMultiplier);
      addRaspberries(toppingsGroup, radius, height, detailMultiplier);
    }
    
    // Add banana slices
    addBananaSlices(toppingsGroup, radius, height, detailMultiplier);
    
    // Add peanut butter drizzle
    addPeanutButterDrizzle(toppingsGroup, radius, height, detailMultiplier);
  }
  
  function addBlueberries(group: THREE.Group, radius: number, height: number, detailMultiplier: number): void {
    const segments = isMobileDevice ? 8 : 16;
    const berryGeometry = new THREE.SphereGeometry(0.15, segments, segments);
    const berryMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a237e,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const count = Math.floor((Math.random() * 4 + 3) * detailMultiplier);
    for (let i = 0; i < count; i++) {
      const berry = new THREE.Mesh(berryGeometry, berryMaterial);
      
      // Position on top
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius * 0.7);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = height / 2 + 0.15;
      
      berry.position.set(x, y, z);
      berry.scale.set(
        0.9 + Math.random() * 0.2,
        0.9 + Math.random() * 0.2,
        0.9 + Math.random() * 0.2
      );
      
      group.add(berry);
    }
  }
  
  function addStrawberries(group: THREE.Group, radius: number, height: number, detailMultiplier: number): void {
    // Create strawberry halves
    const count = Math.max(1, Math.floor((Math.random() * 2 + 1) * detailMultiplier));
    const segments = isMobileDevice ? 8 : 16;
    
    for (let i = 0; i < count; i++) {
      // Strawberry group
      const strawberry = new THREE.Group();
      
      // Strawberry body (hemisphere)
      const bodyGeometry = new THREE.SphereGeometry(0.3, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc62828,
        roughness: 0.8,
        metalness: 0
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      strawberry.add(body);
      
      // Add seeds (fewer on mobile)
      const seedCount = isMobileDevice ? 10 : 20;
      const seedGeometry = new THREE.SphereGeometry(0.02, 4, 4);
      const seedMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e68c });
      
      for (let s = 0; s < seedCount; s++) {
        const seed = new THREE.Mesh(seedGeometry, seedMaterial);
        const phi = Math.random() * Math.PI / 2;
        const theta = Math.random() * Math.PI * 2;
        seed.position.x = 0.3 * Math.sin(phi) * Math.cos(theta);
        seed.position.y = 0.3 * Math.cos(phi);
        seed.position.z = 0.3 * Math.sin(phi) * Math.sin(theta);
        strawberry.add(seed);
      }
      
      // Position on top
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius * 0.6);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = height / 2 + 0.15;
      
      strawberry.position.set(x, y, z);
      strawberry.rotation.set(
        Math.PI / 2 + Math.random() * 0.3,
        Math.random() * Math.PI * 2,
        0
      );
      
      group.add(strawberry);
    }
  }
  
  function addRaspberries(group: THREE.Group, radius: number, height: number, detailMultiplier: number): void {
    const count = Math.max(1, Math.floor((Math.random() * 3 + 2) * detailMultiplier));
    const segments = isMobileDevice ? 8 : 16;
    
    for (let i = 0; i < count; i++) {
      // Raspberry group
      const raspberry = new THREE.Group();
      
      // Raspberry body
      const bodyGeometry = new THREE.SphereGeometry(0.2, segments, segments);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc2185b,
        roughness: 0.9,
        metalness: 0
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      raspberry.add(body);
      
      // Add texture bumps (fewer on mobile)
      const bumpCount = isMobileDevice ? 8 : 15;
      const bumpGeometry = new THREE.SphereGeometry(0.05, 4, 4);
      const bumpMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xad1457,
        roughness: 0.9
      });
      
      for (let b = 0; b < bumpCount; b++) {
        const bump = new THREE.Mesh(bumpGeometry, bumpMaterial);
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        bump.position.x = 0.17 * Math.sin(phi) * Math.cos(theta);
        bump.position.y = 0.17 * Math.cos(phi);
        bump.position.z = 0.17 * Math.sin(phi) * Math.sin(theta);
        raspberry.add(bump);
      }
      
      // Position on top
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius * 0.7);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = height / 2 + 0.15;
      
      raspberry.position.set(x, y, z);
      
      group.add(raspberry);
    }
  }
  
  function addBananaSlices(group: THREE.Group, radius: number, height: number, detailMultiplier: number): void {
    const segments = isMobileDevice ? 16 : 32;
    const sliceGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, segments);
    const sliceMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffeb3b,
      roughness: 0.7,
      metalness: 0
    });
    
    const count = Math.max(1, Math.floor((Math.random() * 3 + 1) * detailMultiplier));
    for (let i = 0; i < count; i++) {
      const slice = new THREE.Mesh(sliceGeometry, sliceMaterial);
      
      // Position on top
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius * 0.6);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = height / 2 + 0.06;
      
      slice.position.set(x, y, z);
      slice.rotation.set(
        Math.random() * 0.5,
        Math.random() * Math.PI * 2,
        Math.random() * 0.5
      );
      
      group.add(slice);
    }
  }
  
  function addPeanutButterDrizzle(group: THREE.Group, radius: number, height: number, detailMultiplier: number): void {
    const drizzleGroup = new THREE.Group();
    
    // Add peanut butter drizzle
    const pbMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd2691e,
      roughness: 0.6,
      metalness: 0.1
    });
    
    // Create drizzle paths (fewer on mobile)
    const drizzleCount = Math.max(3, Math.floor(6 * detailMultiplier));
    const tubularSegments = isMobileDevice ? 8 : 20;
    const radialSegments = isMobileDevice ? 4 : 8;
    
    for (let i = 0; i < drizzleCount; i++) {
      const points = [];
      
      // Start point
      const startAngle = Math.random() * Math.PI * 2;
      const startR = Math.random() * (radius * 0.8);
      const startX = Math.cos(startAngle) * startR;
      const startZ = Math.sin(startAngle) * startR;
      
      points.push(new THREE.Vector3(startX, height / 2 + 0.3, startZ));
      
      // Control points
      const midX = startX + (Math.random() * 0.5 - 0.25);
      const midZ = startZ + (Math.random() * 0.5 - 0.25);
      points.push(new THREE.Vector3(midX, height / 2 + 0.25, midZ));
      
      // End point
      const endX = midX + (Math.random() * 0.5 - 0.25);
      const endZ = midZ + (Math.random() * 0.5 - 0.25);
      points.push(new THREE.Vector3(endX, height / 2 + 0.05, endZ));
      
      // Create curve
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, tubularSegments, 0.05, radialSegments, false);
      const tubeMesh = new THREE.Mesh(tubeGeometry, pbMaterial);
      
      drizzleGroup.add(tubeMesh);
    }
    
    group.add(drizzleGroup);
  }
  
  function createSmallJar(posX: number, posY: number): void {
    const jar = createJar(1.2, 3, posX, posY);
    addToppings(jar, 1.2, 3, 'mixed');
    overnightOatsGroup.add(jar);
  }
  
  function createMediumJar(posX: number, posY: number): void {
    const jar = createJar(1.4, 3.5, posX, posY);
    addToppings(jar, 1.4, 3.5, 'mixed');
    overnightOatsGroup.add(jar);
  }
  
  function createLargeJar(posX: number, posY: number): void {
    const jar = createJar(1.4, 3.5, posX, posY);
    addToppings(jar, 1.4, 3.5, 'blueberry');
    overnightOatsGroup.add(jar);
  }

  // Animation variables
  let animationTime = 0;
  let viewMode = 0; // 0: side view, 1: transitioning to top, 2: top view, 3: transitioning to side
  let transitionProgress = 0;
  const transitionDuration = 3; // in seconds
  const viewDuration = 5; // seconds to stay at each view
  
  function animate(): void {
    frameId = requestAnimationFrame(animate);
    
    // Update time
    const deltaTime = 0.016; // Approximately 60fps
    animationTime += deltaTime;
    
    // Rotate the entire group continuously
    if (overnightOatsGroup) {
      overnightOatsGroup.rotation.y += rotationSpeed;
    }
    
    // Handle view transitions
    if (enableViewTransition) {
      updateCameraPosition(deltaTime);
    }
    
    renderer.render(scene, camera);
  }
  
  function updateCameraPosition(deltaTime: number): void {
    // Calculate time in the current mode
    const modeTime = animationTime % ((viewDuration + transitionDuration) * 2);
    
    // Determine which mode we're in
    if (modeTime < viewDuration) {
      // Side view
      viewMode = 0;
      transitionProgress = 0;
      setCameraSideView();
    } 
    else if (modeTime < viewDuration + transitionDuration) {
      // Transitioning to top view
      viewMode = 1;
      transitionProgress = (modeTime - viewDuration) / transitionDuration;
      interpolateCamera(transitionProgress, 'toTop');
    }
    else if (modeTime < viewDuration * 2 + transitionDuration) {
      // Top view
      viewMode = 2;
      transitionProgress = 0;
      setCameraTopView();
    }
    else {
      // Transitioning back to side view
      viewMode = 3;
      transitionProgress = (modeTime - (viewDuration * 2 + transitionDuration)) / transitionDuration;
      interpolateCamera(transitionProgress, 'toSide');
    }
  }
  
  function setCameraSideView(): void {
    // Adjust camera position based on screen size
    if (isSmallScreen) {
      // Move camera closer on small screens
      camera.position.set(0, 1.5, 8);
    } else {
      camera.position.set(0, 2, 12);
    }
    camera.lookAt(0, 0, 0);
  }
  
  function setCameraTopView(): void {
    if (isSmallScreen) {
      // Position top view closer on small screens
      camera.position.set(0, 8, 0.1);
    } else {
      camera.position.set(0, 12, 0.1);
    }
    camera.lookAt(0, 0, 0);
  }
  
  function interpolateCamera(progress: number, direction: 'toTop' | 'toSide'): void {
    // Smooth easing function
    const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    
    // Different positions based on screen size
    const sideViewY = isSmallScreen ? 1.5 : 2;
    const sideViewZ = isSmallScreen ? 8 : 12;
    const topViewY = isSmallScreen ? 8 : 12;
    
    if (direction === 'toTop') {
      // Interpolate from side to top
      const x = 0;
      const y = sideViewY + easedProgress * (topViewY - sideViewY);
      const z = sideViewZ * (1 - easedProgress) + 0.1 * easedProgress;
      camera.position.set(x, y, z);
    } else {
      // Interpolate from top to side
      const x = 0;
      const y = topViewY - easedProgress * (topViewY - sideViewY);
      const z = 0.1 + easedProgress * (sideViewZ - 0.1);
      camera.position.set(x, y, z);
    }
    
    camera.lookAt(0, 0, 0);
  }

  function onWindowResize(): void {
    // Update window width
    windowWidth = window.innerWidth;
    isSmallScreen = windowWidth < 768;
    
    // Update jars based on new screen size
    createResponsiveJars();
    
    // Update camera position based on screen size
    if (viewMode === 0 || viewMode === 3) {
      setCameraSideView();
    } else if (viewMode === 2) {
      setCameraTopView();
    }
    
    // Update renderer and camera
    if (camera && renderer && container) {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
    }
  }

  // Svelte lifecycle hooks
  onMount(() => {
    if (container) {
      initThree();
      animate();
      window.addEventListener('resize', onWindowResize);
    }
    
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  });

  // Props for customization
  export let rotationSpeed: number = 0.008;
  export let enableViewTransition: boolean = true;
</script>

<div class="three-container " bind:this={container}></div>

<style>
  .three-container {
    width: 100%;
    min-height: 375px;
  }

  @media (max-width: 768px) {
    .three-container {
      min-height: 180px;
    }
  }
</style>