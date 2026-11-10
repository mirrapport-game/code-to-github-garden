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

- Keep guest progress in browser storage and sync signed-in progress to owner-scoped Cloud records through the participant provider; keep points in a server-written idempotent ledger and roles in user_roles. Why: reloads preserve guest answers while accounts share progress securely across devices.
- Keep challenge scheduling and scoring in browser-safe library modules, and orchestrate its screens on /season. Why: time gates and scoring are independently testable and cannot be bypassed through a second game entry point.
- Use a separate versioned challenge storage key from the legacy season. Why: older answers are not valid baseline tests or daily assignments for the new challenge.
- Keep the original introductory card flow on / and open the challenge on /season after its completion; existing challenge participants retain access. Why: the challenge is an optional continuation, not a replacement for the first experience.
- Keep thematic questions and non-diagnostic reflection prompts in a browser-safe theme module; store personal theme answers separately from daily practice answers. Why: existing drafts remain compatible and reflections do not pretend to infer psychological traits from free text.
- Keep the read-only all-days preview screen only in .lovable/future-seasons/extended; /season does not render it. Why: content inspection must not mark days complete or alter the participant's random cards.
- Keep the extended challenge screens in .lovable/future-seasons/extended and their original storage untouched; the simplified challenge uses its own versioned storage. Why: future seasons can reuse the richer flow without mixing incompatible answers.
- Use the shared AI trainer for separate initial and integrated dialogues in both journeys, preserving legacy choice answers. Why: the participant can compare her own reactions without overwriting earlier progress.
- Store original scenarios separately from curated concept links; persist both concept and scenario ID in daily assignments. Why: life stages and reflection concepts are different, and random scenarios must remain stable after reload.
- Exclude original scenarios with missing levels or covers from random play without authoring replacement text. Why: all imported material stays intact while only complete cards enter the game.
- Keep author shadow descriptions separate from editorial scenario candidates; persist a non-repeating shade ID per challenge day and optional reflections alongside the answer. Why: random reflection lenses must remain stable without diagnosing participants or changing existing completed days.
- Keep editorial shade imagery keyed by stable shade IDs separately from the imported author descriptions. Why: readable game copy can evolve without overwriting source material or saved assignments.
- Use ChallengeJourney on /season with persisted reflection, story, shade questions, manifestations, reaction and feeling selections, then suggested resource and step; share browser-safe practice helpers with introductory integration and retain legacy answers. Why: both journeys stay resumable without duplicate balance screens or lost history.
- Keep ChallengeDay for the introductory scenario, initial dialogue, persisted reflection selections and separate summary; store optional integration of a participant-selected quality in introIntegration without challenge shade assignments. Why: the introductory practice stays resumable and independent of the challenge.
- Keep feelings, qualities, spheres and seed items selection-based; initial and integrated reactions use separate persisted AI transcripts, with request reflection retained separately. Why: participants write their actual reactions while other reflection choices remain quick to answer.
- Keep AI access denials in a server-only database guard and preserve upstream status/messages without retries. Why: blocked providers must remain paused across reloads and server restarts.
- Keep seven paginated stories between personal reflection and shade exploration, separate from random scenarios and shade IDs. Why: each day starts with the card while the season retains its continuous narrative.
- Require the entry test for new challenge participants and offer the repeated test after seven days; preserve access for participants with saved completed days. Why: restoring tests must not erase or block existing progress.
- Show the introductory video on each fresh visit to / before resuming the existing introductory flow; import its CDN asset pointer and keep video dismissal in component state. Why: QR links to the app start with the video without modifying saved game answers.
- Embed the uploaded soundtrack into the introductory MP4, autoplay muted, and restart playback when the participant enables sound. Why: browsers require user interaction for audible playback and participants should hear the recording from its beginning.
- Use separate progress, profile and admin routes, with isolated in-memory admin day previews and shared bottom navigation. Why: inspecting a future day must not change participant assignments, completion or points.
- Link Telegram chats through one-time opaque codes delivered to a secret-verified webhook; keep Telegram calls in authenticated server functions or verified webhook handlers. Why: bot notifications must not expose credentials or permit forged account linking.
- Store the optional challenge request in ChallengeState and snapshot it with each day's integration reflection in JourneyDraft. Why: existing progress sync includes requests, and editing the request does not rewrite completed reflections.

- Keep email authentication passwordless via Cloud magic links and the existing participant profile sync; retain Google and Telegram notification linking separately. Why: email confirmation controls sign-in and Telegram is not a supported account provider.
