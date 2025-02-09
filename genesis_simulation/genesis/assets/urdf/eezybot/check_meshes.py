import os
import trimesh

def check_mesh_file(filepath):
    try:
        # Load the file using trimesh
        mesh = trimesh.load(filepath, force='mesh')
        if mesh.is_empty:
            print(f"[WARNING] {filepath}: Mesh is empty.")
        elif not hasattr(mesh, 'vertices') or not hasattr(mesh, 'faces'):
            print(f"[ERROR] {filepath}: Does not contain mesh data.")
        elif len(mesh.vertices) == 0 or len(mesh.faces) == 0:
            print(f"[WARNING] {filepath}: Mesh has no vertices or faces.")
        else:
            print(f"[OK] {filepath}: Valid mesh with {len(mesh.vertices)} vertices and {len(mesh.faces)} faces.")
    except Exception as e:
        print(f"[ERROR] {filepath}: Exception while loading mesh: {e}")

def check_meshes_in_folder(folder_path):
    # List all files in the folder
    for filename in os.listdir(folder_path):
        # Optionally, only check files with common mesh extensions.
        if filename.lower().endswith(('.stl', '.obj', '.ply', '.dae')):
            full_path = os.path.join(folder_path, filename)
            check_mesh_file(full_path)
        else:
            print(f"[SKIP] {filename}: Unsupported file extension.")

if __name__ == "__main__":
    # Set the folder path (adjust as needed)
    folder = "meshes"
    
    if not os.path.isdir(folder):
        print(f"The folder '{folder}' does not exist.")
    else:
        print(f"Checking mesh files in folder: {folder}")
        check_meshes_in_folder(folder)
