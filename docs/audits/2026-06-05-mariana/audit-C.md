# Phase C — Legal Compliance / Privacy

_Mariana Trench audit — 2026-06-05 · HEAD `3faadfb` · REPORT mode · portfolio-ibaifernandez_

**9 findings** — MEDIUM 3 · LOW 4 · INFO 2

### Evidence Dashboard

| Confidence | Count | % |
|---|---|---|
| PROVEN | 8 | 89% |
| SUSPECTED | 0 | 0% |
| UNVERIFIABLE | 1 | 11% |
| **Total** | **9** | 100% |

Health signal: **healthy (PROVEN ≥ 60%)**.

- **Legal** — 9 findings · PROVEN 8 / SUSPECTED 0 / UNVERIFIABLE 1 · code-read 5 · manual-verification 2 · tool-external 1 · graph-local 0 (graphify used for navigation only)

## Findings (severity-sorted)

| ID | Sev | Conf | Dim | Finding | Ref | Effort |
|---|---|---|---|---|---|---|
| L-PRIV-01 | MEDIUM | PROVEN | Legal | No Art.6 GDPR legal basis stated per processing purpose (analytics, contact form, anti-spam) | GDPR Art.13(1)(c)/Art.6 · Ley 21.719 Art.12 | S |
| L-PRIV-02 | MEDIUM | PROVEN | Legal | No retention period for the received contact-form email nor for GA4 analytics data | GDPR Art.13(2)(a) · Ley 21.719 Art.14ter | S |
| L-PRIV-05 | MEDIUM | PROVEN | Legal | International-transfer clause relies on bare 'you acknowledge these transfers' — no per-processor transfer mechanism | GDPR Art.44-46 (Chap.V) · Ley 21.719 Chap.V | S |
| L-PRIV-03 | LOW | PROVEN | Legal | Complaint-authority reference is generic ('your national data-protection authority') — no supervisory authority named | GDPR Art.13(2)(d) · Ley 21.719 (Agencia de Proteccion de Datos) | S |
| L-PRIV-04 | LOW | PROVEN | Legal | No imprint / aviso legal (LSSI-CE) — controller identified by name + email only, no postal/fiscal identity | LSSI-CE Art.10 · GDPR Art.13(1)(a) | M |
| L-PRIV-07 | LOW | PROVEN | Legal | DSR flow is proportionate (no ID-document over-collection) but deletion without identity check has a minor third-party-erasure risk | GDPR Art.12(3)/(6) · Ley 21.719 derechos ARCO+ | S |
| L-PRIV-09 | LOW | UNVERIFIABLE | Legal | GA4 property-level data-retention setting and Google Signals state cannot be confirmed from source | GDPR Art.5(1)(e)/Art.25 · GA4 admin | S |
| L-PRIV-06 | INFO | PROVEN | Legal | GA4 consent architecture is COMPLIANT (denied-by-default Consent Mode v2, prior consent) — verified positive, no pre-consent tracking | GDPR Art.6(1)(a)/ePrivacy Art.5(3) — SATISFIED | S |
| L-PRIV-08 | INFO | PROVEN | Legal | DPO-absence justification is thin but defensible for a personal portfolio | GDPR Art.37(1) | S |

## Detail

#### L-PRIV-01 — No Art.6 GDPR legal basis stated per processing purpose (analytics, contact form, anti-spam)
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** S · **Ref:** GDPR Art.13(1)(c)/Art.6 · Ley 21.719 Art.12
- **Evidence:** grep -niE 'legal basis|legitimate interest|Art\. 6|base legal' src/pages/privacy.template.html returns only the analytics-consent sentence (L55) and the localStorage 'consent decision' line (L49). No line names the lawful basis per purpose: analytics consent (Art.6(1)(a)) is implied but never stated; the contact form (first_name/last_name/email/subject/message -> Resend, confirmed netlify/functions/contact.js:186 + custom.js:1775 url '/.netlify/functions/contact') has NO stated basis; Cloudflare Turnstile anti-spam telemetry (privacy.template.html:47) has no stated basis. Art.13(1)(c) GDPR requires the legal basis per purpose; Ley 21.719 Art.12 requires a fuente de licitud.
- **Recommendation:** Add one explicit legal-basis line per purpose: analytics = consent (Art.6(1)(a)); contact form = consent or legitimate interest in replying to enquiries (Art.6(1)(f)/(b)); anti-spam/Turnstile = legitimate interest in security (Art.6(1)(f)). Mirror keys in en.json + es.json.

#### L-PRIV-02 — No retention period for the received contact-form email nor for GA4 analytics data
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** tool-external · **Effort:** S · **Ref:** GDPR Art.13(2)(a) · Ley 21.719 Art.14ter
- **Evidence:** grep -niE 'retention|retain|conserv|kept for|deleted after|14 month|26 month|retencion' privacy.html src/pages/privacy.template.html returns only the Netlify-server-logs line (L69, 'retained per Netlify policy'). Section 1 li1 (privacy.template.html:46) says contact data 'is not stored on this site or in any database' — but the email delivered to info@ibaifernandez.com persists in the mailbox with no period disclosed. GA4 (G-T8FTTWBQS3, analytics-ga4.html:41-44) has no retention window stated. Art.13(2)(a) GDPR mandates the storage period or the criteria to determine it; Ley 21.719 Art.14ter / finality principle parallels this.
- **Recommendation:** State concrete periods (e.g. contact emails kept up to 24 months then deleted unless an engagement starts; GA4 retention set to 14 months in the GA4 admin and disclosed in section 2). Keep both en.json/es.json in sync.

#### L-PRIV-05 — International-transfer clause relies on bare 'you acknowledge these transfers' — no per-processor transfer mechanism
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** GDPR Art.44-46 (Chap.V) · Ley 21.719 Chap.V
- **Evidence:** Section 6 (src/pages/privacy.template.html:108): processors (Resend, Netlify, Cloudflare, Google) are US-headquartered and 'Where required, these providers rely on Standard Contractual Clauses (SCCs) or equivalent ... By using the contact form or accepting analytics, you acknowledge these transfers.' GDPR Chap.V (Art.44-46) requires identifying the actual safeguard per processor (e.g. EU-US Data Privacy Framework for Google/Cloudflare, SCCs for Resend) and a way to obtain a copy. 'You acknowledge these transfers' is not itself a valid transfer mechanism and frames transfers as consent-by-use. Ley 21.719 Chap.V parallels this.
- **Recommendation:** Replace 'you acknowledge' with the actual mechanism per processor (Google & Cloudflare under the EU-US Data Privacy Framework; Resend & Netlify under SCCs) and add 'a copy of the safeguards is available on request'. Do not frame transfers as user-acknowledged.

#### L-PRIV-03 — Complaint-authority reference is generic ('your national data-protection authority') — no supervisory authority named
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** GDPR Art.13(2)(d) · Ley 21.719 (Agencia de Proteccion de Datos)
- **Evidence:** src/pages/privacy.template.html:95 — 'Lodge a complaint with your national data-protection authority.' grep -niE 'supervisory|AEPD|Agencia|autoridad|complaint' returns only this one generic line. GDPR Art.13(2)(d) requires informing of the right to complain to a supervisory authority; for a Spain/EEA-facing bilingual policy (es.json, 44 privacy keys) best practice names the AEPD, and Chile Ley 21.719 names the new Agencia de Proteccion de Datos Personales. Naming none is the weak end of acceptable.
- **Recommendation:** Add the relevant authorities (AEPD for Spain/EEA, Chile Agencia de Proteccion de Datos Personales, Brazil ANPD) with links, alongside the existing generic phrasing.

#### L-PRIV-04 — No imprint / aviso legal (LSSI-CE) — controller identified by name + email only, no postal/fiscal identity
- **Severity:** LOW · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** M · **Ref:** LSSI-CE Art.10 · GDPR Art.13(1)(a)
- **Evidence:** Section 5 'Data controller' (src/pages/privacy.template.html:103): 'The data controller is Ibai Fernandez, the site owner. Contact via info@ibaifernandez.com.' grep -niE 'address|domicil|NIF|CIF|aviso legal|imprint|VAT' src/pages/privacy.template.html returns no postal address, tax ID, or aviso legal. Site is bilingual/Spain-facing (es.json); LSSI-CE Art.10 requires an identifiable establishment. GDPR Art.13(1)(a) requires controller identity+contact — name+email is the minimum and defensible for a personal portfolio, but no aviso legal page exists.
- **Recommendation:** If the operator is a registered professional/autonomo in Spain, add a minimal aviso legal (full name, fiscal/registration ID, contact, purpose). If purely personal under another jurisdiction, document which regime applies; name+email controller identity is otherwise defensible.

#### L-PRIV-07 — DSR flow is proportionate (no ID-document over-collection) but deletion without identity check has a minor third-party-erasure risk
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** GDPR Art.12(3)/(6) · Ley 21.719 derechos ARCO+
- **Evidence:** src/pages/privacy.template.html:98 — DSR via mailto info@ibaifernandez.com, response within 30 days, 'No proof of identity is required for simple deletion requests; access/portability requests may ask you to confirm the email address used in the original submission.' Avoids over-collection (good, Art.12(6) proportionality) and the 30-day window matches Art.12(3). Minor risk: deletion without any identity check could let a third party erase another person's submission; low impact given the data is only an email thread.
- **Recommendation:** Keep the lightweight, no-ID-document flow but add one line that deletion requests for another person's data will be declined or require email-address confirmation.

#### L-PRIV-09 — GA4 property-level data-retention setting and Google Signals state cannot be confirmed from source
- **Severity:** LOW · **Confidence:** UNVERIFIABLE (NV_DASHBOARD) · **Source:** manual-verification · **Effort:** S · **Ref:** GDPR Art.5(1)(e)/Art.25 · GA4 admin
- **Evidence:** Source sets anonymize_ip:true (analytics-ga4.html:44) — proven in code. But the GA4 property-level retention period (2 vs 14 months) and whether Google Signals / Ads features are disabled live in the GA4 dashboard (property G-T8FTTWBQS3), not the repo; cannot be line-proven here. This underlies the retention gap in L-PRIV-02.
- **Recommendation:** In GA4 admin set Data Retention to 14 months, disable Google Signals, confirm no Ads links, then disclose the chosen retention in section 2 (closes L-PRIV-02).

#### L-PRIV-06 — GA4 consent architecture is COMPLIANT (denied-by-default Consent Mode v2, prior consent) — verified positive, no pre-consent tracking
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** manual-verification · **Effort:** S · **Ref:** GDPR Art.6(1)(a)/ePrivacy Art.5(3) — SATISFIED
- **Evidence:** analytics-ga4.html:14-20 sets gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500}) BEFORE gtag.js loads. __initGA4() (L35-57) only fetches gtag.js + config G-T8FTTWBQS3 with anonymize_ip:true, and restores stored consent ONLY if localStorage portfolio_consent==='granted' (L48) — it never grants by itself, so the idle/visibilitychange trigger (L59-72) cannot send a non-consented hit. cookie-consent.js:31-46 flips analytics_storage to 'granted' only on explicit Accept click (L64-68); banner shows when no decision stored (L78-83). gtag.js loading in denied state sets no cookies and sends no hits — satisfies ePrivacy/GDPR prior consent.
- **Recommendation:** No action required. Optionally note in the policy that gtag.js may be fetched before consent but stays inert (no cookies, no hits) under default-denied Consent Mode v2, to pre-empt naive 'GA loaded before consent' audit flags.

#### L-PRIV-08 — DPO-absence justification is thin but defensible for a personal portfolio
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** GDPR Art.37(1)
- **Evidence:** src/pages/privacy.template.html:103 — 'no designated data protection officer (DPO) — the site does not meet the processing thresholds that would require one under GDPR Art. 37 or equivalent.' Correct for a personal portfolio (no large-scale systematic monitoring, no special-category data at scale, Art.37(1)(b)/(c)). Claim is line-present and defensible; flagged only because 'thresholds' is vague.
- **Recommendation:** Optionally tighten to 'no large-scale systematic monitoring and no special-category processing, so Art.37(1) does not apply.' No urgent action.
