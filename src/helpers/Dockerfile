FROM ubuntu:xenial
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -q && apt-get install -qy \
    texlive \
    python-pygments gnuplot \
    make git \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /data
VOLUME ["/data"]