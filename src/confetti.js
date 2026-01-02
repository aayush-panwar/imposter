// Lightweight canvas-based confetti animation

export const createConfetti = (container) => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];
    const particles = [];

    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    let animationId;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeParticles = 0;
        particles.forEach(p => {
            if (p.y < canvas.height + 50) {
                activeParticles++;
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        });

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    };

    animate();

    // Auto cleanup after 4 seconds
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        canvas.remove();
    }, 4000);
};
