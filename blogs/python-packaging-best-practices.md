# Premium Python Packaging: Architecting Professional Geospatial Libraries

Distributing a Python package requires rigorous engineering standards. A professional package must be predictable, secure, typed, and seamlessly integrated into modern CI/CD pipelines.

## 1 | Modern Packaging Architecture
- **`pyproject.toml` as the Source of Truth**: Completely abandon `setup.py`. Unify build systems (Hatch, Poetry, Flit) and tool configurations (Ruff, MyPy, Pytest) into a single declarative file.
- **The `src/` Layout**: Enforce the `src/package_name` directory structure to prevent import shadowing and mandate testing against installed wheels rather than local directories.

## 2 | Quality Gates & Static Analysis
- **Type Hinting**: Implement comprehensive type hints and distribute a `py.typed` marker file (PEP 561) to support enterprise IDEs and static analyzers (MyPy, Pyright).
- **Unified Linting**: Replace flake8, isort, and black with **Ruff**, an ultra-fast Rust-based linter and formatter.
- **Test Matrix**: Utilize `pytest` with `pytest-cov` and enforce a minimum coverage threshold.

## 3 | Supply Chain Security & CI/CD
- **Reproducible Builds**: Pin dependencies using lockfiles for development environments.
- **Automated Publishing**: Leverage GitHub Actions and PyPI Trusted Publishers (OIDC) to securely automate wheel and sdist deployment upon tagged releases.

## Step-by-Step Guide: Scaffolding a Production-Grade Package
*Implement a modern, secure, and fully automated packaging lifecycle using Hatch and GitHub Actions.*

**Step 1: Declarative Configuration (`pyproject.toml`)**
Define metadata, dependencies, and build configurations seamlessly.
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "spatial-toolkit"
version = "0.1.0"
description = "High-performance geospatial utilities."
requires-python = ">=3.10"
dependencies = ["geopandas>=0.13.0", "shapely>=2.0.0"]

[project.optional-dependencies]
dev = ["pytest>=7.0", "ruff>=0.1.0", "mypy>=1.5"]

[tool.ruff]
line-length = 88
select = ["E", "F", "I"] # Enable isort and core checks
```

**Step 2: Automated CI/CD via GitHub Actions**
Create `.github/workflows/publish.yml` for zero-touch PyPI deployment using OIDC (no hardcoded passwords).
```yaml
name: Publish to PyPI
on:
  push:
    tags: ["v*"]
jobs:
  pypi-publish:
    name: Build and publish
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Mandatory for OIDC
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install build
      - run: python -m build
      - uses: pypa/gh-action-pypi-publish@release/v1
```
*This workflow ensures your releases are cryptographically secure, fully automated, and adhere to elite software distribution standards.*
