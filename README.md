# Projection Ensemble: Visualizing the Robust Structures of Multidimensional Projections

![interface](https://user-images.githubusercontent.com/98008363/235410453-d19917b0-cd02-490a-916b-5292106a0287.png)

**Projection Ensemble** is a system designed to identify and visualize robust structures across multidimensional projections.
Although multidimensional projections, such as t-Stochastic Neighbor Embedding (t-SNE), have gained popularity, their stochastic nature often leads the user to interpret the structures that arise by chance and make erroneous findings.
To overcome this limitation, we present a relaxed frequent subgraph mining algorithm and a visualization interface to extract and visualize the consistent structures across multiple projections.
We demonstrate that our system not only identifies trustworthy structures but also detects accidental clustering or separation of data points.

# Development

The Projection Ensemble is implemented using D3.js and is served as an npm project.
To use it, you'll need to set up a python backend server using FastAPI.
Follow the instructions below to get started.

Clone this repository:
```Bash
git clone https://github.com/jjmmwon/ProjectionEnsemble.git
cd ProjectionEnsemble
```
Install the dependencies and requirements:
```Bash
## I recommend you to use python virtual environment using conda
conda create -n projection_ensemble python=3.9
conda activate projection_ensemble
pnpm install
pip install -r requirements.txt
```

Run the FastAPI server and the dev server:
```Bash
python main.py
npm run dev
```

Then explore your data through the system.


# Live Demo
[Demo Video](https://youtu.be/rgzyFg7mOfc)
[Web Demo]

# Reference

TBA



[Web Demo]: <https://jjmmwon.github.io/ProjectionEnsemble/>
