# Python Packaging Best Practices

Creating and distributing a Python package that is easy to install, reuse, and extend takes more than throwing a few `.py` files on PyPI. Follow these guidelines to ship professional-grade packages that other developers will trust and depend on.

## 1. Embrace the Modern Packaging Standard: `pyproject.toml`

* `pyproject.toml` is the single, tool-agnostic file that tells build back-ends (e.g., **setuptools**, **poetry**, **hatchling**) how to build your project .
* Keep only **build metadata** in this file; runtime configuration belongs in your code.

```toml
[project]
name            = "awesome_pkg"
version         = "0.3.0"
description     = "Awesome things done right"
readme          = "README.md"
requires-python = ">=3.9"
dependencies    = [
    "requests>=2.31",
    "pydantic>=2.5",
]

[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"
```


## 2. Clean Project Layout

```
awesome_pkg/
├── src/awesome_pkg/        # import package
│   ├── __init__.py
│   └── core.py
├── tests/                  # pytest tests
├── docs/                   # Sphinx or MkDocs
├── CHANGELOG.md
├── LICENSE
├── pyproject.toml
└── README.md
```

* **`src/` layout** prevents accidental imports from the project root during testing .
* Keep **tests** out of the package so users don’t install them.


## 3. Semantic Versioning \& PEP 440

* Follow `MAJOR.MINOR.PATCH` (e.g., `2.1.4`).
* Pre-releases: `1.0.0a1`, `1.0.0rc1` are parsed correctly by pip thanks to PEP 440 .


## 4. Pin Build-Time \& Runtime Dependencies

* Put **runtime** deps in `dependencies` (as above).
* Place **dev** tools in a lock file or extras:

```toml
[project.optional-dependencies]
dev = [
    "pytest",
    "ruff",
    "mypy",
]
```

* Avoid overly strict upper bounds (`requests<3`) unless breaking changes are proven.


## 5. Ship Wheels First

* Build **universal wheels** (`*.whl`) for pure-Python; manylinux / musllinux wheels for native extensions .
* Always accompany wheels with a **source distribution** (`sdist`) for fallback.

Commands:


| Action | Tooling Command |
| :-- | :-- |
| Build | `python -m build` |
| Upload | `twine upload dist/*` |

## 6. Automate Quality Gates

1. **Static analysis** – `ruff` or `flake8` for style; `mypy` for types.
2. **Unit tests** – `pytest -ra`; strive for >90% coverage.
3. **Security scans** – `pip-audit` detects vulnerable dependencies .
4. **CI** – run the full matrix on GitHub Actions:
```yaml
strategy:
  matrix:
    python-version: ["3.9", "3.10", "3.11"]
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
    with: { python-version: ${{ matrix.python-version }} }
  - run: pip install -e .[dev]
  - run: pytest
```


## 7. Document, Document, Document

* Use **Sphinx** or **MkDocs** to generate HTML docs from docstrings and Markdown.
* Host on **Read the Docs** for auto-built, versioned docs.


## 8. Sign \& Verify Releases

* Use **twine sign** with GPG or **sigstore** for provenance .
* Add SHA-256 checksums to release notes for manual verification.


## 9. Provide a Reproducible Development Environment

* Supply a `requirements-dev.txt` or `poetry.lock` to freeze tool versions.
* Consider Docker or **Nix** for complete build determinism.


## 10. Respect Your Users

* Keep public APIs stable; deprecate gradually with clear warnings.
* Follow **PEP 561** to distribute type information (`py.typed` file).
* Maintain a **CHANGELOG.md** so users understand every release.


### Quick Best-Practice Checklist

| ✅ Task | Why It Matters |
| :-- | :-- |
| Use `pyproject.toml` only | Future-proof, build-backend agnostic |
| `src/` layout | Avoids import shadowing |
| Wheels + sdist | Fast install, universal fallback |
| CI on push \& PR | Catches regressions early |
| Semantic versioning | Predictable upgrades |
| Typed code \& PEP 561 | IDE autocompletion, safer code |
| Signed artifacts | Supply-chain integrity |

## Conclusion

Thoughtful packaging is the bridge between clever code and real-world adoption. By automating builds, tests, documentation, and security checks—and by embracing modern standards like `pyproject.toml`—you make life easier for both collaborators and end users. Start small, iterate, and keep your package healthy with every release.

**References**

*Python Packaging User Guide – “pyproject.toml”*
W. Foster, *“Why You Should Use a src Layout”*, Real Python, 2021.
PEP 440 – *Version Identification and Dependency Specification*.
*Python Packaging Authority – Packaging Binary Extensions*.
*pip-audit Documentation – “Usage”*.
Sigstore, *“Signing Python Packages”* guide.

