# News review

## Installation

Install dependencies

```shell
make install
```

## Development

Generate TLS certificates with [mkcert](https://mkcert.dev)

```shell
make generate-tls-certificates
```

Serve with hot reload from devobs.me:3000

```shell
HOSTNAME=devobs.me && make development-server
```

## Production

Build for production by generating static files

```shell
make build
```

Launch server

```shell
make start
```
