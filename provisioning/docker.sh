#!/bin/bash

function build_nginx_image() {
    cd provisioning/containers/nginx || exit
    docker build -t nginx .
}

function remove_nginx_container() {
    if [ "$(docker ps -a | grep nginx-news-review -c)" = "0" ]
    then
        echo 'No running container for news review'
        return;
    fi

    docker ps -a | grep nginx-news-review | grep -v grep | awk '{print $1}' | xargs docker rm -f
}

function run_nginx_container() {
    remove_nginx_container

    local workdir
    workdir="$(pwd)"

    local templates
    templates="${workdir}"/provisioning/containers/nginx/templates

    local dist
    dist="${workdir}"/dist

    local logs
    logs="${workdir}"/logs

    docker run -d --name nginx-news-review \
    -p 127.0.0.1:81:80 \
    -v "${dist}":/usr/share/nginx/html \
    -v "${logs}":/var/log/nginx \
    -v "${templates}":/etc/nginx/conf.d:ro \
    nginx
}
