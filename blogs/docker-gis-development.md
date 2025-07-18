## Docker GIS Development: A Practical Guide to Portable Geospatial Workflows

Geographic Information Systems (GIS) projects often juggle multiple libraries (GDAL, PROJ, GEOS), spatial databases, and web-mapping services. Docker lets you package this entire stack into lightweight, reproducible containers that run the same on any workstation or cloud host — no more “it works on my machine” headaches.

### Why Docker for GIS?

- **Consistency across environments** – every team member (or CI runner) pulls the same container image.
- **Fast onboarding** – clone, `docker compose up`, and dive straight into analysis.
- **Isolation of native dependencies** – common GIS build issues (e.g., PROJ vs. GDAL version mismatches) remain inside the container.
- **Effortless scalability** – scale PostGIS or GeoServer services horizontally with a single CLI flag.
- **Clean host OS** – your laptop avoids lingering libraries that collide with other projects.


## Core Components of a Containerised GIS Stack

| Layer | Role | Popular Docker Images |
| :-- | :-- | :-- |
| Spatial Database | Store \& query geometry | `postgis/postgis`, `timescale/timescaledb-postgis` |
| GIS Libraries | GDAL, rasterio, Fiona, pyproj | Official OSGeo Python wheels, or `osgeo/gdal` base image |
| Web Map Services | Serve tiles/OGC APIs | `kartoza/geoserver`, `camptocamp/mapserver` |
| Workflow Orchestration | Pipelines \& scheduled jobs | `apache/airflow`, `azavea/koopa` (Kubernetes) |
| Front-End/Notebooks | Ad-hoc analysis | `jupyter/datascience-notebook` with GIS extensions |

## Building a Minimal GIS Dockerfile

```dockerfile
# ----- Base OS with GDAL & PROJ -----
FROM osgeo/gdal:alpine-small-latest

# ----- Install Python GIS stack -----
RUN pip install --no-cache-dir \
      rasterio==1.3.9 \
      fiona==1.9.4 \
      pyproj==3.6.0 \
      geopandas==0.14.0 \
      ipykernel

# ----- Set UTF-8 and non-root user -----
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=UTC

WORKDIR /workspace
COPY requirements.txt .
RUN pip install -r requirements.txt
CMD ["python", "-m", "ipykernel_launcher", "-f", "/dev/null"]
```

**Key tips**

1. Use the official `osgeo/gdal` base image – it bundles GDAL, PROJ, GEOS, and native drivers.
2. Pin exact library versions to guarantee reproducibility.
3. Keep the image small: Alpine variants plus `--no-cache-dir` reduce size.

## Orchestrating Services with `docker-compose`

Below is a starter `docker-compose.yml` that spins up PostGIS, GeoServer, and a Jupyter notebook—all networked together:

```yaml
version: "3.9"
services:
  db:
    image: postgis/postgis:16-3.4
    container_name: postgis
    environment:
      POSTGRES_PASSWORD: gispass
      POSTGRES_USER: gisuser
      POSTGRES_DB: gisdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  geoserver:
    image: kartoza/geoserver:2.23.2
    environment:
      - GEOSERVER_ADMIN_PASSWORD=geopass
    ports:
      - "8080:8080"
    depends_on:
      - db

  notebook:
    build: .
    container_name: gis-notebook
    volumes:
      - ./notebooks:/workspace/notebooks
    ports:
      - "8888:8888"
    depends_on:
      - db

volumes:
  pgdata:
```

Launch with a single command:

```bash
docker compose up --build
```

You now have:

- **PostGIS** at `localhost:5432`
- **GeoServer** web UI at `http://localhost:8080/geoserver`
- **JupyterLab** at `http://localhost:8888`


### Connecting from Python

```python
import geopandas as gpd
import sqlalchemy as sa

engine = sa.create_engine("postgresql://gisuser:gispass@db:5432/gisdb")
gdf = gpd.read_postgis("SELECT * FROM public.boundaries;", engine)
```

Note how `db` resolves via Docker’s internal network—no hard-coding localhost.

## Best Practices for Production

1. **Separate Concerns** – keep application code, data, and databases in distinct containers.
2. **Use Healthchecks** – ensure services exit if PostGIS fails to start.
3. **Persist Volumes** – mount `pgdata` on durable disks for stateful workloads.
4. **Automated Builds** – push images to a registry via CI whenever `main` updates.
5. **Multi-Platform Builds** – compile for `linux/amd64` and `linux/arm64` so images run on Macs and cloud runners alike.
6. **Security Updates** – rebuild weekly or pin to minimal OS images (e.g., `alpine`, `distroless`).
7. **Environment Variables** – never bake secrets into images; inject at runtime or via orchestration secrets-store.

## Extending the Stack

- **GPU-accelerated Raster Processing** – base on `nvidia/cuda` images plus CuPy and Rasterio for lightning-fast imagery analytics.
- **Task Schedulers** – add Airflow or Prefect for recurring ETL pipelines.
- **Vector Tiles** – integrate `postgis/postgis` with `klokantech/tileserver-gl` to serve MBTiles.
- **Serverless Compute** – package GDAL into AWS Lambda layers using Docker’s `--platform` to cross-compile for `arm64` Lambdas.
- **GenAI \& Large-Scale Analysis** – mount cloud buckets into worker containers and orchestrate with Kubernetes for elastic scaling of transformer-based geo models.


## Troubleshooting Cheat-Sheet

| Symptom | Likely Cause | Fix |
| :-- | :-- | :-- |
| `error while loading shared libraries: libgdal.so` | Your custom container didn’t include GDAL runtime libs | Base on `osgeo/gdal` or install `gdal-bin` inside image |
| GeoServer can’t see PostGIS | Database container isn’t ready | Add `depends_on` **and** a healthcheck wait loop |
| Notebook can’t plot maps | Missing fontconfig or PROJ data | Install `fontconfig`, `proj-data`, and set `PROJ_LIB` |
| Image > 5 GB | Too many build layers or cached wheels | Combine RUN steps \& use `--no-cache-dir` |

## Final Thoughts

Docker fundamentally changes the way GIS engineers prototype, share, and deploy spatial solutions. By encapsulating heavyweight libraries and databases into portable containers, you can move from “works on my laptop” to “works everywhere” in minutes. Whether you’re building a PostGIS-backed web map, automating satellite imagery pipelines, or experimenting with GenAI models on geospatial data, containerising your stack keeps you fast, flexible, and future-proof.

Happy mapping—one container at a time!

**References**

Docker Inc., “Why Containers,” *Docker Docs*.
Open Source Geospatial Foundation, “Official GDAL Docker Images,” *OSGeo Containers*.
Docker Inc., “Buildx and Multi-Platform Builds,” *Docker Docs*.

