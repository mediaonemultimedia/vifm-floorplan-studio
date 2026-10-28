# Private floorplan generation Worker

The public Studio remains on GitHub Pages. This Worker is its authenticated generation service. Uploaded evidence goes from the browser to the Worker and then to the OpenAI Responses API; a strict JSON draft comes back to the same editor. It does **not** post into an existing Codex/ChatGPT chat or inherit this conversation automatically. The shared drafting contract is supplied explicitly from `drawing-instructions.js`.

## One-time activation

Requires a Cloudflare account with Workers access and a funded OpenAI API project with access to the configured model. These are separate from access to this Codex chat. The Worker was deployed on October 28, 2026 at `https://vifm-floorplan-generator.vifm-floorplan-studio.workers.dev`. Its private API key and Studio access code still need to be entered before generation is active.

From the repository root:

```sh
npm ci
npx wrangler login
npm run worker:deploy
npx wrangler secret put OPENAI_API_KEY --config server/wrangler.toml
npx wrangler secret put STUDIO_ACCESS_TOKEN --config server/wrangler.toml
```

Enter secret values only in Wrangler's private prompts, Cloudflare's secret editor, or the GitHub Actions secret settings. Never paste an OpenAI key into the Studio form, repository, public config or this chat. Use a long random Studio access code, separate from the API key. Until all secrets and bindings exist the service returns “not configured.”

Alternatively add repository Actions secrets named `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `OPENAI_API_KEY`, and `STUDIO_ACCESS_TOKEN`, then manually run **Deploy floorplan generator**. The Cloudflare API token must be scoped to deploy Workers in the intended account. The workflow sends the two application secrets directly to Cloudflare and removes its temporary secret file; it does not put values in the public site.

Open **New floorplan → Generation connection**, enter the deployed `https://…workers.dev` address and Studio access code, then choose **Check and save connection**. The address is saved locally; the access code is held in tab-session storage. `generation-config.json` can also contain the public Worker address as an organization default once it is known. It must never contain credentials.

`ALLOWED_ORIGIN` defaults to `https://mediaonemultimedia.github.io`. This is an origin, not a repository URL path. Set additional comma-separated origins explicitly when needed. Requests must have both an allowed origin and a correct access code. The code is suitable for a small trusted team; use individual authentication such as Cloudflare Access if the audience expands.

## Request contract

- `GET /health`, authenticated: reports whether the service is configured.
- `POST /generate`, authenticated: `{brief, media}`. Brief is validated boat metadata plus reference identities, roles, floor ownership and notes. Media carries only prepared inline images, PDFs or text. Video stills include timestamps and retain the source reference ID.
- Success: `{format:"vifm-floorplan-draft-v1", draft, requestId}`. Failure: a sanitized `{error}` and appropriate HTTP status. Unsupported or invalid geometry never overwrites a drawing.

The default model is `gpt-5.4`, configurable via `OPENAI_MODEL`; it must support image/PDF input, reasoning and strict structured outputs. Requests use `store:false`, a 20,000-output-token ceiling and a 270-second upstream deadline. `store:false` is an API storage setting, not a claim about all provider retention. Do not submit references unsuitable for the selected provider/account terms.

The Worker rejects unsupported media types, mismatched reference IDs, invalid image/PDF signatures and oversized requests. The prepared payload limit is 18 MiB; original video files are not transmitted. PDFs sent for generation must be 10 MiB or less. The browser prepares stills and normalizes images. Reference contents are treated as evidence, never as higher-priority instructions. Structured output is validated again before creating independent editor geometry.

The Cloudflare rate-limit binding allows approximately two generation requests per minute per location. It is not a strict global spending cap. Set API project budgets/usage alerts in the OpenAI project and restrict who receives the Studio code. Provider errors are sanitized; neither secret values nor reference bodies are logged by this code. Worker observability is disabled in the supplied configuration.

## Verification and known boundary

```sh
npm test
npm run worker:check
```

The local build verifies authentication/origin gates, payload validation, the Responses contract, geometry compilation, saved-project isolation, PDF exports and browser upload/video-still flows. Browser return-to-editor testing uses a clearly identified local synthetic response; it does not prove live model quality. A real generation request still needs the account activation above and should be reviewed against its evidence before client release.

The Worker is stateless and does not save uploaded references or projects. Originals and the intake stay in this browser's IndexedDB; generated project JSON and its navigation entry use local storage. A project JSON export includes the reference manifest, not original upload bytes. Browser/device sharing of original references and organization-wide cloud project storage are not included. Requests are not automatically retried; stopping the browser wait does not guarantee a provider request has been cancelled.

Official implementation references: [OpenAI file inputs](https://developers.openai.com/api/docs/guides/file-inputs), [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [images and vision](https://developers.openai.com/api/docs/guides/images-vision), and [Cloudflare Worker rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
