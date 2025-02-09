import os
import glob
import trimesh

# Define the input and output directories
stl_dir = "stl/"  # Folder where STL files are stored
obj_dir = "obj/"   # Folder where OBJ files will be saved

# Create output directory if it doesn't exist
os.makedirs(obj_dir, exist_ok=True)

# Get all STL files in the stl directory
stl_files = glob.glob(os.path.join(stl_dir, "*.stl"))

# Convert all STL files to OBJ
obj_files = []
for stl_file in stl_files:
    obj_file = os.path.join(obj_dir, os.path.basename(stl_file).replace(".stl", ".obj"))
    mesh = trimesh.load_mesh(stl_file)
    mesh.export(obj_file)
    obj_files.append(obj_file)

print("Converted OBJ files:", obj_files)