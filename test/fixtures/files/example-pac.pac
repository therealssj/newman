function FindProxyForURL(url, host) {
  if (url === "http://localhost:8000") {
    return 'PROXY localhost:9000';
  }

  return 'DIRECT';
}
