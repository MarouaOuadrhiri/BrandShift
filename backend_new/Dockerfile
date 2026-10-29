FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl libcurl4 liblzma5 && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /opt/mongo /data/db && curl -sL https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-debian12-7.0.14.tgz -o /tmp/mongo.tgz && tar xzf /tmp/mongo.tgz -C /opt/mongo --strip-components=1 && rm /tmp/mongo.tgz
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x start.sh
EXPOSE 8000
CMD ["./start.sh"]








