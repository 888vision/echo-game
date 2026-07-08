import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const THEME = {
  primary: '#e8a87c',
  secondary: '#f5f0e8',
  textDim: 'rgba(245, 240, 232, 0.5)',
  glow: 'rgba(232, 168, 124, 0.3)',
};

interface OpeningSceneProps {
  onComplete: () => void;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

export default function OpeningScene({ onComplete }: OpeningSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<'idle' | 'explode' | 'reveal'>('idle');
  const explodeStartTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    mountedRef.current = true;
    phaseRef.current = 'idle';

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 5;

    // Core star
    const coreGeo = new THREE.SphereGeometry(0.06, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(THEME.primary),
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Glow sprite
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const ctx = glowCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(232, 168, 124, 0.6)');
    gradient.addColorStop(0.4, 'rgba(232, 168, 124, 0.2)');
    gradient.addColorStop(1, 'rgba(232, 168, 124, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const glowSprite = new THREE.Sprite(glowMat);
    glowSprite.scale.set(1.5, 1.5, 1);
    core.add(glowSprite);

    // Background stars
    const bgStarsGeo = new THREE.BufferGeometry();
    const bgStarsCount = 500;
    const bgPositions = new Float32Array(bgStarsCount * 3);
    for (let i = 0; i < bgStarsCount * 3; i += 3) {
      bgPositions[i] = (Math.random() - 0.5) * 100;
      bgPositions[i + 1] = (Math.random() - 0.5) * 100;
      bgPositions[i + 2] = -Math.random() * 50 - 5;
    }
    bgStarsGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    const bgStarsMat = new THREE.PointsMaterial({
      color: 0xf5f0e8,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
    });
    const bgStars = new THREE.Points(bgStarsGeo, bgStarsMat);
    scene.add(bgStars);

    // Particles array
    const particles: Particle[] = [];

    // Click handler
    const handleClick = () => {
      if (phaseRef.current === 'idle') {
        phaseRef.current = 'explode';
        explodeStartTimeRef.current = performance.now() / 1000;

        const particleCount = 800;
        for (let i = 0; i < particleCount; i++) {
          const geo = new THREE.SphereGeometry(
            0.015 + Math.random() * 0.025,
            8,
            8
          );
          const hue = Math.random();
          const color = new THREE.Color().setHSL(
            0.08 + hue * 0.15,
            0.6 + Math.random() * 0.4,
            0.5 + Math.random() * 0.5
          );
          const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 1,
          });
          const mesh = new THREE.Mesh(geo, mat);
          scene.add(mesh);

          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = 0.02 + Math.random() * 0.08;
          particles.push({
            mesh,
            velocity: new THREE.Vector3(
              Math.sin(phi) * Math.cos(theta) * speed,
              Math.sin(phi) * Math.sin(theta) * speed,
              Math.cos(phi) * speed
            ),
            life: 0,
            maxLife: 3 + Math.random() * 4,
            size: 0.015 + Math.random() * 0.025,
          });
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.style.cursor = 'pointer';

    // Animation
    let lastTime = performance.now() / 1000;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now() / 1000;
      const dt = Math.min(now - lastTime, 0.1);
      lastTime = now;

      const phase = phaseRef.current;

      if (phase === 'idle') {
        const breathe = Math.sin(now * 1.5) * 0.3 + 1;
        core.scale.set(breathe, breathe, breathe);
        core.position.y = Math.sin(now * 0.8) * 0.05;
      }

      if (phase === 'explode') {
        const explodeTime = now - explodeStartTimeRef.current;

        // Fade out core
        const coreFade = Math.max(0, 1 - explodeTime * 0.8);
        core.material.opacity = coreFade;
        core.material.transparent = true;
        core.scale.setScalar(1 + explodeTime * 2);

        // Update particles
        for (const p of particles) {
          p.mesh.position.add(p.velocity.clone().multiplyScalar(dt * 60));
          p.velocity.multiplyScalar(0.995);
          p.life += dt;
          const lifeRatio = p.life / p.maxLife;
          p.mesh.material.opacity = Math.max(0, 1 - lifeRatio);
          p.mesh.scale.setScalar(1 + explodeTime * 0.5);
        }

        // Camera zooms out
        camera.position.z = 5 + explodeTime * 3;

        // After 4 seconds, transition to reveal
        if (explodeTime > 4) {
          phaseRef.current = 'reveal';
          explodeStartTimeRef.current = now; // Reset timer for reveal phase
        }
      }

      if (phase === 'reveal') {
        const revealTime = now - explodeStartTimeRef.current;

        // Fade out remaining particles
        for (const p of particles) {
          const fadeOut = Math.max(0, 1 - revealTime * 0.5);
          p.mesh.material.opacity = fadeOut * 0.6;
        }

        // After 3 seconds, animation complete
        if (revealTime > 3) {
          cancelAnimationFrame(animFrameRef.current);
          // Clean up
          mountedRef.current = false;
          canvas.removeEventListener('click', handleClick);
          ro.disconnect();
          try { renderer.dispose(); } catch {}
          // Transition to text phase
          onCompleteRef.current();
          return;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!mountedRef.current) return;
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    });
    ro.observe(canvas.parentElement!);

    // Cleanup for React StrictMode
    const cleanup = () => {
      cancelAnimationFrame(animFrameRef.current);
      mountedRef.current = false;
      ro.disconnect();
      try { canvas.removeEventListener('click', handleClick); } catch {}
      try { renderer.dispose(); } catch {}
    };

    return cleanup;
  }, []); // No dependencies — stable reference

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
