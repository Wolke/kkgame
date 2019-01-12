tsc
git add .
git commit -m"Dockerfile:$1"
docker build -t kkbox_game .
docker tag kkbox_game gcr.io/easypaking-82ce0/kkbox_game:$1
docker tag kkbox_game gcr.io/easypaking-82ce0/kkbox_game:latest
gcloud auth configure-docker      
gcloud docker -- push gcr.io/easypaking-82ce0/kkbox_game:latest
gcloud beta container images add-tag gcr.io/easypaking-82ce0/kkbox_game:latest gcr.io/easypaking-82ce0/kkbox_game:$1