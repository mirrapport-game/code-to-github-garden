<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Challenge progress, daily card assignments, drafts, tests and feedback persist in browser localStorage until accounts exist; migrate to database tables when a backend is added. Why: daily assignments and answers must survive reloads without login.
- Keep challenge scheduling and scoring in browser-safe library modules, and orchestrate its screens on /season. Why: time gates and scoring are independently testable and cannot be bypassed through a second game entry point.
- Use a separate versioned challenge storage key from the legacy season. Why: older answers are not valid baseline tests or daily assignments for the new challenge.
- Keep the original introductory card flow on / and open the challenge on /season after its completion; existing challenge participants retain access. Why: the challenge is an optional continuation, not a replacement for the first experience.
- Keep thematic questions and non-diagnostic reflection prompts in a browser-safe theme module; store personal theme answers separately from daily practice answers. Why: existing drafts remain compatible and reflections do not pretend to infer psychological traits from free text.
- Preview all challenge days through a read-only screen independent of scheduling and assignments. Why: content inspection must not mark days complete or alter the participant's random cards.
- Keep the extended challenge screens in .lovable/future-seasons/extended and their original storage untouched; the simplified challenge uses its own versioned storage. Why: future seasons can reuse the richer flow without mixing incompatible answers.
- Define four response choices and their non-diagnostic reflections in a browser-safe module shared by daily play, preview and saved results. Why: a selected answer must produce the same reflection after reload.
- Store original scenarios separately from curated concept links; persist both concept and scenario ID in daily assignments. Why: life stages and reflection concepts are different, and random scenarios must remain stable after reload.
- Exclude original scenarios with missing levels or covers from random play without authoring replacement text. Why: all imported material stays intact while only complete cards enter the game.

