from setuptools import setup, find_packages

setup(
    name="instantory",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # Core dependencies
        "python-dotenv>=1.0.0",
        "Pillow>=10.1.0",
        "openai>=1.6.0",
        "tenacity>=8.0.1",
        "aiohttp>=3.9.1",
        "httpx>=0.25.2",
        
        # Database
        "asyncpg>=0.29.0",  # Updated to match requirements.txt
        "async_timeout>=4.0.3",
        
        # Document processing
        "PyPDF2>=3.0.1",
        "python-docx>=0.8.11",
        
        # Web framework - ensure auth dependencies are included
        "quart>=0.19.0",
        "quart-cors>=0.7.0",
        "quart-auth>=0.9.0",  # Added missing quart-auth package
        "hypercorn>=0.15.0",
        
        # Auth dependencies
        "google-auth>=2.22.0",  # Added explicit Google auth package
        "pyjwt>=2.5.0",         # Added JWT for token handling
        "bcrypt>=4.0.0",        # Added for password hashing
        
        # Type checking - fixed version conflict
        "typing-extensions>=4.9.0",
        "pydantic==2.5.2",
        "pydantic-core==2.14.5",
        
        # ASGI servers for deployment
        "gunicorn>=21.2.0",
        "uvicorn>=0.23.0",
        "python-multipart>=0.0.6",
        
        # Additional required packages
        "aiosignal>=1.3.1",
        "annotated-types>=0.6.0",
        "anyio>=4.2.0",
        "attrs>=23.1.0",
        "blinker>=1.7.0",
        "certifi>=2023.11.17",
        "charset-normalizer>=3.3.2",
        "click>=8.1.7",
        "distro>=1.8.0",
        "frozenlist>=1.4.1",
        "h11>=0.14.0",
        "idna>=3.6",
        "multidict>=6.0.4",
        "priority>=2.0.0",
        "sniffio>=1.3.0",
        "tqdm>=4.66.1",
        "wsproto>=1.2.0",
        "yarl>=1.9.4",
        "protobuf==5.26.1",
        "packaging==23.2"
    ],
    python_requires=">=3.8",
    author="default_user",
    author_email="",
    description="A web-based application for document and inventory management using AI",
    long_description=open("README.md").read() if open("README.md", "r", encoding="utf-8") else "",
    long_description_content_type="text/markdown",
    url="https://github.com/squidwizard/instantory",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    entry_points={
        "console_scripts": [
            "instantory=backend.server:main",  # Changed to use a main function for proper initialization
        ],
    },
)
