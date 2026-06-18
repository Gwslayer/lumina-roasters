export function initSteam() {
  const canvas = document.getElementById('steam-canvas');
  // If we aren't on the home page, the canvas won't exist. Safely abort.
  if (!canvas) return; 

  // BATTERY & MOTION OPTIMIZATION: Abort 60FPS loop if reduced motion is preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  let isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  // 1. Map the canvas strictly to the Hero Image dimensions
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    // Ensure the canvas fits the container visually
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  // 2. Track cursor position specifically over the image
  const handleMouseMove = (e) => {
    if (isTouchDevice) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };
  canvas.parentElement.addEventListener('mousemove', handleMouseMove);

  const handleMouseLeave = () => {
    mouse.x = null;
    mouse.y = null;
  };
  canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

  // 3. Define the Physics for a single Steam Particle
  class Particle {
    constructor() {
      // Spawn near the bottom center of the image
      this.x = (canvas.width / 2) + (Math.random() * 140 - 70); 
      this.y = canvas.height + 40; 
      
      // Randomize size, upward speed, and horizontal drift
      this.size = Math.random() * 30 + 20;
      this.maxSize = this.size + Math.random() * 50 + 30; // Steam expands as it rises
      this.speedY = Math.random() * -0.8 - 0.4;
      this.speedX = Math.random() * 0.5 - 0.25;
      
      // Start completely invisible to prevent popping
      this.opacity = 0;
      this.maxOpacity = Math.random() * 0.15 + 0.05; 
      
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
      
      // Give each particle a unique sway profile for organic movement
      this.swayFreq = Math.random() * 0.015 + 0.005;
      this.swayPhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.life++;

      // Expand size smoothly
      if (this.size < this.maxSize) {
        this.size += 0.15;
      }

      // Procedural math: Add a unique, gentle sine-wave sway
      this.x += Math.sin(this.life * this.swayFreq + this.swayPhase) * 0.6;

      // INTERACTIVE PHYSICS: Cursor Wind Repulsion
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Inverse proportional force: pushes gently at edges, harder in the center
        if (distance < 150 && distance > 0) {
          let force = (150 - distance) / 150;
          this.x -= (dx / distance) * force * 1.5; 
          this.y -= (dy / distance) * force * 1.5;
        }
      }

      // Smooth fade IN and fade OUT
      if (this.life < 60) {
        this.opacity += this.maxOpacity / 60; // Fade in over 60 frames
      } else if (this.life > this.maxLife - 100) {
        this.opacity -= this.maxOpacity / 100; // Fade out over last 100 frames
      }
    }

    draw() {
      ctx.beginPath();
      // Draw a soft, blurry circle
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${Math.max(0, this.opacity)})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. The 60FPS Render Loop
  function animate() {
    // MEMORY LEAK FIX: If the router deleted the canvas from the page, kill this loop!
    if (!document.body.contains(canvas)) {
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
      return;
    }

    // Clear the previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stagger particle spawning so it looks organic
    if (Math.random() < 0.12 && particles.length < 60) {
      particles.push(new Particle());
    }

    // Process all active particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Garbage Collection: Delete dead particles to prevent memory leaks
      if ((particles[i].opacity <= 0 && particles[i].life > 60) || particles[i].y < -50) {
        particles.splice(i, 1);
        i--;
      }
    }
    
    // Call the next frame
    requestAnimationFrame(animate);
  }
  
  // Start the engine
  animate();
}