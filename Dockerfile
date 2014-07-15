FROM freekkalter/wkiw-docker-base

# setup app
RUN mkdir /app
WORKDIR /app
ADD ./webapp/ /app
# replace "testing" files in webapp dir with production ones
ADD ./index.html /app/index.html
ADD ./config.json /app/config.json
RUN chmod +x /app/webapp

