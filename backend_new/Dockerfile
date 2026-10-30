FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl libcurl4 liblzma5 && rm -rf /var/lib/apt/lists/*
# MongoDB binaries are CPU-specific: the deploy host is ARM64, so pick the
# tarball that matches the build architecture (x86_64 locally, aarch64 there).
# There is no aarch64-debian12 build of 7.0.14; the ubuntu2204 ARM build runs
# fine on this Debian image (same libssl3/libcurl4 ABI).
RUN mkdir -p /opt/mongo /data/db && \
    case "$(uname -m)" in \
      aarch64|arm64) MONGO_TGZ=mongodb-linux-aarch64-ubuntu2204-7.0.14.tgz ;; \
      *) MONGO_TGZ=mongodb-linux-x86_64-debian12-7.0.14.tgz ;; \
    esac && \
    echo "Downloading ${MONGO_TGZ}" && \
    curl -sL "https://fastdl.mongodb.org/linux/${MONGO_TGZ}" -o /tmp/mongo.tgz && \
    tar xzf /tmp/mongo.tgz -C /opt/mongo --strip-components=1 && rm /tmp/mongo.tgz
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x start.sh
EXPOSE 8000
CMD ["./start.sh"]
