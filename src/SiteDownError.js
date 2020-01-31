module.exports = class SiteDownError extends Error {
  constructor(res) {
    super(`Site: ${res.url} is down with status code: ${res.status}.`);
    this.statusCode = res.status;
    this.status = `${this.statusCode}: ${res.statusText}`;
    this.url = res.url;
  }
}