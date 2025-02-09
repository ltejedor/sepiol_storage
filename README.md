What we've used so far:
Hardhat for smart contracts
Genesis
Eezybot Arm

Roboforge for CAD to URDF for simulation


Embodiment Class Contract: https://sepolia.arbiscan.io/address/0xa090431c3d10d9b7d374fd5b8de7bb0687ddbd52


onshape robotics toolkit for CAD to URDF: https://github.com/neurobionics/onshape-robotics-toolkit


Link to the Eezybot URDF in Genesis



We built git for agentic robots. Traditionally, robotic agents in simulated environments and robotic agents in physical robots exist in two separate constructs. Sepiol Storage unifies the two. Not only does this provide a decentralized repository that creates a common representation between virtual and physical robotics agents, but it is also the first decentralized repository able to train robots across a decentralized system and capture affordance (functional) and safety attestations. 

Digital twins of robotic agents can be used to train in simulation. 

However, many robot versions, of embodiments, aren't readily available. 

Sepiol Storage is a decentralized registry of robot embodiments and models, where users can add new embodiments and distribute training. 

Stored on Arbitrum

After registering an embodiment, a digital version of the embodiment gets generated which can run in the Genesis Simulator. 

After registering an instance of that embodiment, an identifier is added to the model itself before it's sent out to a 3D printer. 

This system of identifying embodiments and instances of robots is the foundation of a long-term solution that can be used to track robotic agents, store training instances over time, distribute training data, add them to a swarm or DAO, and attest or expand funcionality across a distributed system. 



Parts of the project:

3D Pipelines
![](./media/identifier.png)

Digital Twin conversion pipeline



Sepiol Storage is git for agentic robots. New embodiments can be registered, automatically converted into digital twins for simulation and training, and instances of specific embodiments can be added to the system, their virtual and physical representations paired. 