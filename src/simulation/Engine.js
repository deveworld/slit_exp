export class FDTDGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        // Triple buffer system - no allocation during update()
        this.u = new Float32Array(this.size);      // current
        this.uPrev = new Float32Array(this.size);  // previous
        this.uNext = new Float32Array(this.size);  // next (reused)

        // Walls mask: 1 = empty space, 0 = wall
        this.walls = new Float32Array(this.size).fill(1.0);

        // Optimal Courant number for 2D: 1/√2 ≈ 0.707
        // This eliminates numerical anisotropy (same speed in all directions)
        this.c = 1 / Math.SQRT2;
        this.c2 = this.c * this.c; // Pre-compute c²
        this.damping = 0.9999;
        this.time = 0;

        // Mur ABC coefficient
        this.murCoeff = (this.c - 1) / (this.c + 1);
    }

    setSlits(slitGap, slitWidth, wallX) {
        const x = Math.floor(wallX);
        if (x < 0 || x >= this.width) return;

        const centerY = this.height / 2;
        this.walls.fill(1.0);

        const wallThickness = 2; // Thinner wall for speed

        for (let y = 0; y < this.height; y++) {
            let isHole = false;
            if (Math.abs(y - (centerY - slitGap / 2)) < slitWidth / 2) isHole = true;
            if (Math.abs(y - (centerY + slitGap / 2)) < slitWidth / 2) isHole = true;

            if (!isHole) {
                for (let dx = -wallThickness; dx <= wallThickness; dx++) {
                    const wx = x + dx;
                    if (wx >= 0 && wx < this.width) {
                        const idx = y * this.width + wx;
                        this.walls[idx] = 0.0;
                        this.u[idx] = 0;
                        this.uPrev[idx] = 0;
                    }
                }
            }
        }
    }

    addSource(x, y, amplitude, frequency) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const w = this.width;
        const val = amplitude * Math.sin(this.time * frequency);

        // Soft Gaussian-like source for smoother waves
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const px = ix + dx;
                const py = iy + dy;
                if (px >= 2 && px < this.width - 2 && py >= 2 && py < this.height - 2) {
                    const idx = py * w + px;
                    if (this.walls[idx] > 0) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const falloff = Math.exp(-dist * 0.5);
                        this.u[idx] = val * falloff;
                    }
                }
            }
        }
    }

    update() {
        const w = this.width;
        const h = this.height;
        const c2 = this.c2;
        const c = this.c;
        const damping = this.damping;
        const walls = this.walls;
        const u = this.u;
        const uPrev = this.uPrev;
        const uNext = this.uNext;

        // Mur coefficient for ABC
        const murCoeff = (c - 1) / (c + 1);

        // Interior update (y=2 to h-3 for Mur boundary space)
        for (let y = 2; y < h - 2; y++) {
            const rowOffset = y * w;
            for (let x = 2; x < w - 2; x++) {
                const i = rowOffset + x;

                if (walls[i] === 0) {
                    uNext[i] = 0;
                    continue;
                }

                const uL = walls[i - 1] > 0 ? u[i - 1] : 0;
                const uR = walls[i + 1] > 0 ? u[i + 1] : 0;
                const uU = walls[i - w] > 0 ? u[i - w] : 0;
                const uD = walls[i + w] > 0 ? u[i + w] : 0;

                const laplacian = uL + uR + uU + uD - 4 * u[i];
                uNext[i] = (2 * u[i] - uPrev[i] + c2 * laplacian) * damping;
            }
        }

        // Mur's First-Order ABC (absorbing boundary conditions)
        // Left boundary (x = 1)
        for (let y = 2; y < h - 2; y++) {
            const i = y * w + 1;
            const iAdj = i + 1;
            uNext[i] = u[iAdj] + murCoeff * (uNext[iAdj] - u[i]);
        }

        // Right boundary (x = w-2)
        for (let y = 2; y < h - 2; y++) {
            const i = y * w + (w - 2);
            const iAdj = i - 1;
            uNext[i] = u[iAdj] + murCoeff * (uNext[iAdj] - u[i]);
        }

        // Top boundary (y = 1)
        for (let x = 2; x < w - 2; x++) {
            const i = w + x;
            const iAdj = i + w;
            uNext[i] = u[iAdj] + murCoeff * (uNext[iAdj] - u[i]);
        }

        // Bottom boundary (y = h-2)
        for (let x = 2; x < w - 2; x++) {
            const i = (h - 2) * w + x;
            const iAdj = i - w;
            uNext[i] = u[iAdj] + murCoeff * (uNext[iAdj] - u[i]);
        }

        // Outer edge: zero
        for (let x = 0; x < w; x++) {
            uNext[x] = 0;
            uNext[(h - 1) * w + x] = 0;
        }
        for (let y = 0; y < h; y++) {
            uNext[y * w] = 0;
            uNext[y * w + w - 1] = 0;
        }

        // Rotate buffers
        const temp = this.uPrev;
        this.uPrev = this.u;
        this.u = this.uNext;
        this.uNext = temp;

        this.time++;
    }
}

