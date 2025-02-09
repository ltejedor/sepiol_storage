#!/usr/bin/env python3
"""
Script: add_raised_text_pyvista.py

Description:
    Loads a 3D OBJ model and adds an extruded ("raised") text mesh to it.
    The text is generated using VTK's vtkVectorText and vtkLinearExtrusionFilter,
    then positioned on top of the original model. The combined mesh is exported
    as a new OBJ file.

Usage:
    python add_raised_text_pyvista.py \
        --input ./obj/EBA_01.00.010_basement.obj \
        --output ./id/EBA_01.00.010_basement.obj \
        --text 0x4c2d6f8569aef610ed40fc3a97ad9257889146377eb4c18e925b5fa90231f0bb \
        [--depth 2.0] [--scale 1.0] [--offset DX DY DZ]

Optional arguments:
    --depth: Extrusion depth for the text mesh (default: 2.0).
    --scale: Scale factor for the text size (default: 1.0).
    --offset: Additional translation offset (dx dy dz) for the text mesh.
    
Dependencies:
    pyvista, vtk

Install with:
    pip install pyvista vtk
"""

import argparse
import numpy as np
import pyvista as pv
import vtk


def create_text_mesh(text, depth):
    """
    Create a 3D extruded text mesh using VTK's vtkVectorText and vtkLinearExtrusionFilter.
    
    Parameters:
        text (str): The text to generate.
        depth (float): The extrusion depth.
    
    Returns:
        pyvista.PolyData: The extruded text mesh.
    """
    # Generate 2D text geometry.
    vector_text = vtk.vtkVectorText()
    vector_text.SetText(text)
    vector_text.Update()
    
    # Extrude the 2D text to give it 3D volume.
    extrude = vtk.vtkLinearExtrusionFilter()
    extrude.SetInputConnection(vector_text.GetOutputPort())
    extrude.SetExtrusionTypeToNormalExtrusion()
    extrude.SetVector(0, 0, 1)  # Extrude along the z-axis.
    extrude.SetScaleFactor(depth)
    extrude.Update()
    
    # Convert the resulting vtkPolyData into a PyVista mesh.
    text_mesh = pv.wrap(extrude.GetOutput())
    return text_mesh


def main():
    parser = argparse.ArgumentParser(
        description="Add a raised (extruded) text mesh to a 3D OBJ model using PyVista."
    )
    parser.add_argument(
        "--input",
        type=str,
        default="./obj/EBA_01.00.010_basement.obj",
        help="Path to the input OBJ model.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./id/EBA_01.00.010_basement.obj",
        help="Path for the output OBJ model.",
    )
    parser.add_argument(
        "--text",
        type=str,
        default="0x4c2d6f8569aef610ed40fc3a97ad9257889146377eb4c18e925b5fa90231f0bb",
        help="The text to add to the model.",
    )
    parser.add_argument(
        "--depth",
        type=float,
        default=5.0,
        help="Extrusion depth for the text mesh (default: 2.0).",
    )
    parser.add_argument(
        "--scale",
        type=float,
        default=0.5,
        help="Scale factor for the text size (default: 1.0).",
    )
    parser.add_argument(
        "--offset",
        type=float,
        nargs=3,
        default=[33.0, 17.0, -28.0],
        help="Additional translation offset (dx dy dz) for the text mesh.",
    )

    args = parser.parse_args()

    # Load the original OBJ model.
    print(f"Loading model from {args.input} ...")
    try:
        model = pv.read(args.input)
    except Exception as e:
        print("Error loading model:", e)
        return

    # Create the extruded text mesh.
    print(f"Creating text mesh for text: '{args.text}' with depth {args.depth} ...")
    text_mesh = create_text_mesh(args.text, args.depth)
    text_mesh.rotate_x(90, inplace=True)

    # Optionally scale the text mesh.
    if args.scale != 1.0:
        print(f"Scaling text mesh by factor {args.scale} ...")
        text_mesh.scale([args.scale, args.scale, args.scale], inplace=True)

    # Adjust text position so that its base (lowest z-value) is at z=0.
    txmin, txmax, tymin, tymax, tzmin, tzmax = text_mesh.bounds
    print("Adjusting text mesh so its base sits at z=0 ...")
    text_mesh.translate((0, 0, -tzmin), inplace=True)

    # Compute where to place the text on the original model.
    # The model bounds are given as (xmin, xmax, ymin, ymax, zmin, zmax).
    xmin, xmax, ymin, ymax, zmin, zmax = model.bounds
    top_z = zmax
    margin = 0.1 * (zmax - zmin)  # 10% of the model's height.
    base_z = top_z + margin
    print(f"Placing text mesh on top of the model at approximately z={base_z} ...")

    # Apply translation: position the text above the model and add any additional offset.
    offset = np.array(args.offset)
    translation = (offset[0], offset[1], base_z + offset[2])
    text_mesh.translate(translation, inplace=True)
    


    # Combine the original model with the text mesh.
    print("Combining the model and the text mesh ...")
    combined = model.merge(text_mesh)

    # Export the combined mesh as an OBJ file.
    print(f"Saving combined mesh to {args.output} ...")
    try:
        combined.save(args.output)
        print("Done.")
    except Exception as e:
        print("Error saving combined mesh:", e)


if __name__ == "__main__":
    main()
