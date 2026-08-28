# WHAT THE FOUNDER NEEDS TO DO

Everything the build could do without you is done. Six jobs remain. They are
ordered so the slowest things start first — **jobs 1 and 2 gate everything
else, so start them today even though job 3 is quicker.**

Tick items as you go. Nothing here needs technical skill except job 3, which is
one command someone can run for you.

---

## JOB 1 — Email three lawyers  ⏱ 30 min today, then 2–4 weeks waiting

**This gates the entire pilot.** No participant can be sent to a trail until a
lawyer approves the participant agreement. Everything else can be ready and the
pilot still cannot start.

### Steps

1. **Find three candidates.** Search for lawyers with any of:
   - federal public lands / National Park Service regulatory experience
   - outdoor recreation, guiding, or outfitting clients
   - Or ask an outfitter who already holds a Commercial Use Authorization who
     they use.

2. **Email all three the same message.** Something like:

   > I'm building a small consumer app around National Parks and I need two
   > pieces of work, in this order.
   >
   > **First, and urgently: a participant agreement and assumption-of-risk**
   > for people who independently run or hike a published route on open public
   > trails, enforceable in Maine, Virginia and Utah. I'd like this as a fixed
   > fee with a five-business-day turnaround, quoted separately.
   >
   > **Second, and less urgently: a memo on seven regulatory questions** —
   > principally whether this model requires a National Park Service Commercial
   > Use Authorization. I have a written description of the operating model and
   > the seven questions ready to send.
   >
   > Can you take the first piece, and what would it cost?

3. **Send them `docs/validation/operating-model.md`** once one replies. It
   describes exactly what we do and don't do, and it's what the memo answers.

### ⚠️ The one thing that matters
**Ask for the agreement as a separate, first deliverable.** If you scope it as
one big engagement, the agreement arrives with the memo in 3–4 weeks and the
pilot cannot start in the meantime.

### Done looks like
- [ ] Three lawyers emailed
- [ ] One engaged, with the agreement scoped separately and a date
- [ ] Agreement received and approved

---

## JOB 2 — Set up the company  ⏱ 30 min of forms, ~1 week of waiting

**This gates all money.** No entity means no Stripe, which means no $99
Founding Collector — which is the strongest willingness-to-pay signal in the
whole pilot.

### Steps, in this order (each depends on the last)

1. **Form an LLC.** Your home state is fine. Use an online formation service or
   your state's website directly. ~$50–500 depending on state.
2. **Get an EIN** — free, from the IRS website, takes about 10 minutes online.
   You need the LLC first.
3. **Open a business bank account.** You need the LLC documents and the EIN.
4. **Open a Stripe account** using the LLC and that bank account.
5. **Open a second bank account, or a separate sub-account.** Founding
   Collector money goes here and is *not* spending money — it is reserved for
   fulfillment and refunds. This is a promise we made on the checkout page.

### Done looks like
- [ ] LLC formed
- [ ] EIN received
- [ ] Business bank account open
- [ ] Stripe account approved
- [ ] Separate account for preorder funds

---

## JOB 3 — Load the park data  ⏱ 10 minutes

The app has a map of all 63 parks but no coordinates yet, because
`developer.nps.gov` is blocked from the environment I run in. **This is one
command on any normal computer.** You already have the API key.

### Steps

1. On a machine with normal internet and [Node.js](https://nodejs.org)
   installed (any recent version):

   ```
   git clone https://github.com/SoberKeys/National-Parks.git
   cd National-Parks
   git checkout claude/national-parks-platform-4poqba
   NPS_API_KEY=your-key-here node scripts/fetch-parks.mjs
   ```

2. **Read what it prints.** It will either write the file, or refuse and tell
   you exactly what does not reconcile. It refuses on purpose — a wrong park
   coordinate sends someone to the wrong place.

3. If it wrote the file:
   ```
   git add app/src/data/parks.json
   git commit -m "Seed park data from the NPS Data API"
   git push
   ```

4. If it refused, paste me what it printed and I'll fix the reconciliation.

**Alternative:** allow `developer.nps.gov` in this environment's network policy
and I'll run it myself.

### Done looks like
- [ ] `parks.json` contains 63 parks with coordinates, committed

---

## JOB 4 — Open six accounts  ⏱ 45 minutes

All free at our scale. Send me the keys and I'll wire them up.

| Service | What it does | What I need from you |
|---|---|---|
| **Supabase** | The database | Project URL, anon key, service role key |
| **Vercel** | Hosts the site | Just connect the GitHub repo |
| **Resend** | Sends the emails | API key, and a verified sending domain |
| **PostHog** | Measures the funnel | Project API key |
| **Sentry** | Catches errors | DSN |
| **Stripe** | Takes payment | Test keys first (needs job 2) |

**Do Stripe last** — it needs the company from job 2.

### Done looks like
- [ ] All six created
- [ ] Keys sent to me

---

## JOB 5 — Verify the five routes on the ground  ⏱ the long pole

**No route reaches a participant until this is done.** The app enforces it —
every challenge currently shows "we have not confirmed this route on the
ground yet", and that is correct.

### Two of these are safety items, not admin — do them first

**🔴 Shenandoah — Lewis Spring Falls.** We have it listed as the *easy*
Explorer route. It has roughly 820 feet of climb over 3.3 miles on a steep,
rocky descent toward a waterfall. That is not an entry-level running route
whatever the distance says.
→ **Decide:** re-label it as the harder Adventure route, or find an easier
route in the Big Meadows area.

**🔴 Zion — Pa'rus Trail.** The trail follows the Virgin River, and southern
Utah gets a late-summer monsoon. We do not yet have current NPS flash-flood or
heat guidance.
→ **Do:** find the official NPS guidance and the live conditions page for Zion,
and send me both links.

**🟡 Acadia — Ocean Path.** It measures about 7.08 km, which is neither a 5K
nor a 10K, so it cannot carry a label honestly.
→ **Find:** an Acadia route between **4.25 and 5.75 km**. A shorter carriage
road loop is the likely answer. Do not shorten Ocean Path to fit — an invented
turnaround is a place with no junction and nothing to see.

### For each of the five routes

You don't have to go yourself — a trusted local who runs it and sends a GPX
counts just as much.

1. Run it, or have someone run it, recording on any watch or phone.
2. Export the GPX.
3. Upload it at `/admin/queue` → "Analyse a track". It gives you the real
   distance, elevation and the corridor width the terrain needs.
4. Send me the GPX and I'll attach it to the challenge.

### Done looks like
- [ ] Shenandoah difficulty resolved
- [ ] Zion flash-flood and heat guidance confirmed at an NPS source
- [ ] Acadia replacement Explorer route chosen
- [ ] A GPX for each of the five published routes

---

## JOB 6 — Commission the artwork  ⏱ 1 hour to brief, 2 weeks to deliver

One illustrator, fixed fee, roughly $900.

**Brief:** three park illustrations (Acadia, Shenandoah, Zion) plus one neutral
founder mark. Line work, one colour, restrained — the reference points are
historic park posters and premium topographic maps, **not copies of either**.
No product name and no logo: branding is a separate phase.

**Do not order physical inventory yet.** Quotes, artwork and samples only until
Gate 1 says go. That is a standing rule (Round 2, Amendment 3).

### Done looks like
- [ ] Illustrator briefed
- [ ] Artwork delivered
- [ ] Printer identified, quotes obtained, **nothing ordered**

---

## The order, if you only do one thing at a time

1. **Today:** email the lawyers (job 1) and start the LLC (job 2). Both are
   waiting games — start the clock.
2. **This week:** park data (job 3) and accounts (job 4). Quick, and they let me
   connect everything up.
3. **Next two weeks:** route verification (job 5) and artwork (job 6).

## What happens then

When jobs 1–5 are done we set a start date, and the 45-day pilot begins. I stop
at Gate 1 (day 15) and hand you eight things: the dashboard, actual versus
target, the cohort breakdown, participant quotes, cash spent and committed,
what surprised us, what changed my view, and a go / modify / stop
recommendation.

## Money

**$10,000 authorized.** Nothing spent yet. Expected total is $7,500–9,300,
which includes the counsel fee, the artwork, the physical kits and a little
travel. I flag it before the projected total reaches $9,500, and I do not go
past $12,000 without you saying so in writing.
