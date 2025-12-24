# Double Slit Wave Interference Simulator

A web-based simulation of the classic Double Slit Experiment. This project visualizes wave propagation, diffraction, and interference patterns using a 2D Finite-Difference Time-Domain (FDTD) wave equation solver.

## Overview

This application provides a real-time, interactive environment to explore wave physics. It uses a grid-based solver to numerically calculate the wave equation, allowing users to observe how waves interact with obstacles (the slits) and with themselves to create interference patterns.

## Key Features

*   **Real-time Wave Physics**: Accurately matches the behavior of waves using the FDTD method. We implement Mur's Absorbing Boundary Conditions (ABC) to prevent waves from reflecting off the edges of the simulation, simulating an openinfinite medium.
*   **Interactive Controls**:
    *   **Frequency**: Adjust the frequency of the wave source.
    *   **Slit Gap**: Change the distance between the two slits.
    *   **Slit Width**: Modify the width of the openings.
    *   **Screen Position**: Move the virtual measurement screen to see how interference patterns evolve at different distances.
*   **Visualizations**:
    *   High-performance Canvas rendering for smooth wave animation.
    *   Real-time Intensity Profile graph showing the interference pattern at the screen's location.

## Tech Stack

The project is built with standard modern web technologies:

*   **Frontend**: React 19, Vite
*   **Physics Engine**: Custom JavaScript implementation of a 2D FDTD Grid.
*   **Rendering**: HTML5 Canvas API.

## Getting Started

### Prerequisites

*   Node.js (v16 or higher)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/deveworld/slit_exp.git
    cd slit_exp
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Simulation Implementation Details

The simulation solves the standard 2D wave equation using a discrete grid.

The engine (`src/simulation/Engine.js`) ensures numerical stability by adhering to the Courant-Friedrichs-Lewy (CFL) condition. This prevents the simulation from "blowing up" or producing artifacts. 

Surrounding the simulation area are absorbing boundaries (Mur's First-Order ABC), which mathematically cancel out outgoing waves so they don't bounce back into the viewable area.

## License

This project is open source.
