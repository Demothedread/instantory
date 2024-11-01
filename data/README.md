# Data Folder Structure

This folder contains all the data related to our inventory management system. Here's an overview of the folder structure and its contents:

```
data/
├── exports/
├── images/
│   ├── uploads/
│   └── inventory/
├── output/
├── product_data/
└── temp/
```

## Folders

### exports/
- Destination for exported data in various formats (CSV, JSON, etc.).

### images/
- Contains all image files related to the inventory.
- `uploads/` is where newly uploaded images are stored before processing.
- `inventory/` holds images that are part of the inventory.

### output/
- This folder is used for storing processed output files, such as results from image processing.

### product_data/
- Contains structured data related to the products in the inventory.

### temp/
- Temporary files created during processing (e.g., base64 encoded images).
- This folder can be cleared periodically.

## Usage

1. New image uploads should be placed in `images/uploads/`.
2. The image processing script will take images from `images/uploads/`, process them, and store the results in `images/inventory/`.
3. Exported data will be saved in the `exports/` folder.
4. The `temp/` folder can be used for any intermediate files created during processing.
5. Update the configuration files in `product_data/` as needed for image processing or other system settings.

Remember to update the paths in your scripts (main.py, server.py, etc.) to reflect this new structure.
