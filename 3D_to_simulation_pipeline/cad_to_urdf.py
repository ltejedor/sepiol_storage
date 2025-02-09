"""
cad_to_urdf.py

A script to convert an Onshape CAD assembly (specified by its document URL)
to a URDF file using the onshape-robotics-toolkit library.
"""

import argparse
from onshape_robotics_toolkit.connect import Client
from onshape_robotics_toolkit.robot import Robot
from onshape_robotics_toolkit.log import LOGGER, LogLevel

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description="Convert an Onshape CAD assembly to a URDF file."
    )
    parser.add_argument(
        "cad_url",
        type=str,
        help="Onshape CAD assembly URL (e.g., 'https://cad.onshape.com/documents/…')"
    )
    parser.add_argument(
        "-n", "--name",
        type=str,
        default="robot",
        help="Name for the generated robot (default: 'robot')"
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default="robot.urdf",
        help="Output URDF file name (default: 'robot.urdf')"
    )
    parser.add_argument(
        "--max-depth",
        type=int,
        default=0,
        help="Maximum subassembly depth to parse (default: 0)"
    )
    parser.add_argument(
        "--use-user-defined-root",
        action="store_true",
        help="If set, use the user-defined assembly root (if available)"
    )
    args = parser.parse_args()

    # Configure logging (optional)
    LOGGER.set_stream_level(LogLevel.INFO)
    # Optionally, you can also set a log file:
    # LOGGER.set_file_name("cad_to_urdf.log")

    # Initialize the Onshape client (reads API keys from the .env file)
    client = Client(env="./.env")

    print("Fetching CAD assembly from Onshape...")
    try:
        # Create the Robot object from the Onshape document URL.
        # The Robot.from_url method will fetch and parse the assembly.
        robot = Robot.from_url(
            name=args.name,
            url=args.cad_url,
            client=client,
            max_depth=args.max_depth,
            use_user_defined_root=args.use_user_defined_root,
        )
    except Exception as e:
        print(f"Error fetching or parsing the assembly: {e}")
        return

    # Optionally, you might generate a graph of the assembly.
    # Uncomment the next line to save the assembly graph as a PNG image.
    # robot.show_graph("assembly_graph.png")

    try:
        # Save the robot as a URDF file.
        robot.save(args.output)
        print(f"URDF file successfully saved as: {args.output}")
    except Exception as e:
        print(f"Error saving the URDF file: {e}")

if __name__ == "__main__":
    main()
