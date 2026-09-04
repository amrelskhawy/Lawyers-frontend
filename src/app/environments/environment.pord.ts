// Production environment.
// NOTE (Angular): environment-specific values live here and are swapped in at
// build time via the `fileReplacements` in angular.json — Angular does not read
// a .env file at runtime. See `.env.example` for the canonical list of values.
export const environment = {
  baseApi: "https://www.saadalboqami.com/api/v1/",
  // Absolute origin of the public site. Every canonical URL, og:url and
  // sitemap entry is built from it, so it must match the host visitors
  // actually land on (www vs apex) exactly.
  siteUrl: "https://www.saadalboqami.com",
  // baseApi: "http://localhost:8000/api/v1/",
  production: true,
  gtmId: 'AW-18117334418',
}
