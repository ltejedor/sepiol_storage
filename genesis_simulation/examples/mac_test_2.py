import genesis as gs
gs.init(backend=gs.cpu)

scene = gs.Scene(show_viewer=True)
plane = scene.add_entity(gs.morphs.Plane())
franka = scene.add_entity(
    gs.morphs.URDF(file='urdf/eezybot/EEZYbotARM_MK2.urdf'),
)

scene.build()

def run_sim(scene):
    for i in range(100):
        scene.step()

# You need to run simulation in a separate thread on MacOS
gs.tools.run_in_another_thread(fn=run_sim, args=(scene,))
# This must be called from the main thread after starting the thread
scene.viewer.start() 