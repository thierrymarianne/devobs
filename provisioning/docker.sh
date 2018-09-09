#!/bin/bash

function build_nginx_image() {
    cd provisioning/containers/nginx
    docker build -t nginx .
}

function remove_nginx_container() {
    if [ `docker ps -a | grep nginx-daily-revue -c` -eq 0 ]
    then
        return;
    fi

    docker ps -a | grep daily-revue | grep -v grep | awk '{print $1}' | xargs docker rm -f
}

function run_nginx_container() {
    remove_nginx_container

    local templates=`pwd`/provisioning/containers/nginx/templates
    local docs=`pwd`/docs
    local logs=`pwd`/logs

    docker run -d --name nginx-daily-revue \
    -p 127.0.0.1:80:80 \
    -v ${docs}:/usr/share/nginx/html \
    -v ${logs}:/var/log/nginx \
    -v ${templates}:/etc/nginx/conf.d:ro \
    nginx
}
