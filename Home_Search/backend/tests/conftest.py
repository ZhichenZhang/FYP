import pytest
import sys
import os

# Add parent directory to Python path so tests can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))