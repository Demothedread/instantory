"""Test suite for the backend application."""

import os
import pytest
from pathlib import Path

# Set test environment variables
os.environ['TESTING'] = 'true'
os.environ['ENVIRONMENT'] = 'test'

# Get project root directory
PROJECT_ROOT = Path(__file__).parent.parent

# Ensure test directories exist
TEST_DIRS = [
    'tests/data',
    'tests/data/uploads',
    'tests/data/images/inventory',
    'tests/data/exports',
    'tests/data/documents'
]

for dir_path in TEST_DIRS:
    path = PROJECT_ROOT / dir_path
    path.mkdir(parents=True, exist_ok=True)
