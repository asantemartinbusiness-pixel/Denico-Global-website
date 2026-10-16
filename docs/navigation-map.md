# Navigation map

## Header (all pages)

```
[Denico Global wordmark] → /
Primary navigation (≥ 960px):  Our Story · Inside Denico · Portfolio · Contact
Mobile (< 960px):  [Menu] button → full-height panel:
                   Home · Our Story · Inside Denico · Portfolio · Contact
```

- The current page carries `aria-current="page"` and an underline.
- The mobile panel moves focus to its first link, keeps Tab within the toggle and links, closes on Escape (returning focus to the toggle), on route change, on link click, and when the viewport widens to desktop.
- **No dropdowns.** The original header's dropdown structure was not observed, and with five destinations none is needed. If the original had dropdowns, OD-02 evidence would show them.

## Footer (all pages)

| Column | Links |
|---|---|
| Brand | Wordmark → `/`; site description |
| Explore | Home, Our Story, Inside Denico, Portfolio, Contact |
| Contact | info@ (Group and business enquiries), press@ (Press and media), studio@ (Denico Studios enquiries), all `mailto:` with text equal to the destination |
| Administrative hours | Mon–Fri, 9:00 AM – 5:00 PM, by appointment only |
| Base | © year Denico Global · Privacy notice → `/privacy/` |

No social links: none were observed or confirmed.

## In-page pathways

| From | To | Label |
|---|---|---|
| Home slider 1 / 2 / 3 | `/our-story/` · `/inside-denico/` · `/companies-2/` | Read our story · Inside Denico Global · View the group portfolio |
| Home "Explore" | Our Story, Inside Denico, Portfolio, Contact | Pathway list |
| Home CTA band | `/contact/` | Contact us |
| Our Story "Continue exploring" | Inside Denico, Group Portfolio Overview, Business Enquiries | **Observed on the original** |
| Inside Denico | `/companies-2/#denico-studios`; `/contact/` | View in the group portfolio; Business enquiries |
| Portfolio card | `/contact/?enquiry=studios#enquiry-form`; `mailto:studio@` | Enquire with Denico Studios |
| Portfolio CTA band | `/contact/` | Business enquiries |
| Contact form | `/privacy/` | privacy notice |
| Privacy | `/contact/` | Return to Contact |
| 404 | `/`, `/contact/` | Go to the homepage; Contact us |

Every internal link is crawled and must return 200 (`tests/e2e/links.spec.ts`). `href="#"`, `javascript:`, external links and unexpected `mailto:` targets fail the build's test suite.
