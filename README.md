GUI PARAMETERS

velocityIsTangent: Planet velocities are initialized to different tangents to the Sun. This resets all planets.
planetRadius: Controls the radius of the planets when tangent to the sun (only updates after resetting).
collisionMode: 0 doesn’t do anything. 1 means particles combine on collisions, 2 means they bounce.
doesExplode: Controls whether collisions cause explosions.
Friction: Control how much friction exists in the system.
hasTrail: Control whether particles have trails.
hasSun: Control whether the Sun appears or not.
nParticles: Maximum number of particles in the system.
sunMass: Tune the mass of the Sun.
randomness: Controls the randomness of the colors of the Sun (less random means the Sun is mostly red).
sunAmplitude: How constricted the particles in the Sun are (greater amplitude means the particles move farther from the center of Sun).
sunFrequency: Speed in which the particles in the Sun move.
sunParticles: Number of particles that form the Sun.
sunLifespan: Tune how long the sun particles live.
playing: Control whether the simulation is playing.

FEATURES
PHYSICS
The movement physics was programmed in the update function of the Planet class, Planet.ts. We use a method similar to the Euler integration we learned from lecture where we update the planet’s stored position with its stored velocity and update the planet’s stored velocity with a passed in force parameter, using the equation F=ma. This parameter is meant to be calculated for each frame.

The gravity between planets was implemented in the update function of PlanetParticleModel.ts. We calculated the distance between each pair of planets, which we then used in conjunction with their masses to calculate their independent forces of gravity. For each planet, we added together all of these independent forces and passed it into the planet’s update function.

INDEPENDENT PARTICLE SYSTEMS
To get independent particle systems with their own textures, we had to modify the starter code by allowing different instance classes to be rendered
 
Examples of our independent particle systems include the particles that form the sun, explosions, and trails. What makes these systems independent is the fact that they do not have an impact on the other particle systems at play. The only time the independent particle system for the sun has an impact on the other particles is when the center of the sun is being moved. In this case, the physics of the other particle systems is altered by the sun’s position.

SUN
The Sun is a special class of particle that does not move on its own, however, the user can drag it around the screen and see special flame effects. It interacts with the other particles gravitationally and visually when planets collide with the Sun there is an explosion.

PLANET-SUN COLLISION EXPLOSION
We implemented an explosion effect to occur whenever a planet intersects with the center of the sun. This explosion is also implemented using a particle system and removes any planet which is its cause.

COLLISION DETECTION
Collision detection involves detecting when two particles are overlapping and therefore have collided. This can be calculated by seeing if the square of the distance between the two particles is less than or equal to the sum of the radiuses of the particles squared divided by pi. At each iteration of the main loop of the update function, we are constantly checking for colliding particles.

COLLISION EXPLOSION
Another feature we implemented was collision explosion. Upon collision, the colliding particles emit smaller particles of a different color to show that a collision has occurred.

COLLISION COMBINATIONS
There are two options once two particles have collided: we can combine them into one larger mass or we can bounce them off each other. In this first case, we use conservation of momentum to determine the new mass and resultant velocity of the new particle. We also combine the lifespans of the colliding particles into this new particle. When new particles reach certain masses, the colors change to indicate that it is a larger planet (and of course the size on the screen increases as well).

COLLISION BOUNCING
The other option is that planets that collide can bounce off of one another. This is accomplished by calculating the angle of the respective travel and velocity and computing a resultant velocity for both particles. This does not change the mass of the particles, however, it does cause an explosion.

COLLISION PUSHBACK
Collision pushback is an effect that occurs when two particles collide with each other, which creates a force that blows the other particles in the system back. This force is calculated by taking the distances of each particle to the collision and the force of the collision (calculated through the momentum of the colliding particles) and applying that force to all the particles’ velocities in the system. The effect is that all the particles are pushed back by each collision.

BOUNDING BOX
For our bounding box implementation, once a planet hit the bounds of the box, our system would reverse the velocity in either the x or y direction (depending on the boundary hit), and as a result, send the planet in the opposite direction. For example, if the planet hit the bottom of the AniGraph box, the y component of the velocity would be reversed to send it further up the screen. The bounding box was found by using the controller’s container to get the clientWidth and clientHeight variables in PlanetParticleView.ts and adding an event listener to the window for updates when we resize.

PLANET GRAPHICS
The planets used a unique texture and had variable sizes and colors that changed depending on their changing masses as they collided and combined.

TRAILING
We implemented a trail particle system that follows behind the motion of the individual planets and disappears over time. These particles also change in size and color (each of the colors also included random variations from the base color for emitted particles) depending on the mass of the planet they are trailing and we included a GUI option to keep or remove these particles.

MISC
We implemented a friction parameter to slowly take energy out of the system, stopping everything from spiraling out of control. This simply slows all planets down proportionally to their velocity. We also made slight element changes to the GUI such as the change in background and text as well as view changes to hide the object we need to click to open the view parameter menu.
![image](https://user-images.githubusercontent.com/64929984/147884214-4173b8a8-4d34-4aab-9405-38165b770b7d.png)
