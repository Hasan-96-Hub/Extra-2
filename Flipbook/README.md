# 日本語総まとめ JLPT N3・N2・N1 語彙 — 3D Flipbook

**Instructor:** Md Hasanul Mobin  
**Role:** Japanese Language Instructor  
**Institution:** আমাদের Nihongo Gakkou  
**Contact:** 01925-548059

## বইয়ের পরিসংখ্যান

| Level | Weeks | Study days | Mock tests | Vocabulary |
|---|---:|---:|---:|---:|
| N3 | 6 | 36 | 6 | 736 |
| N2 | 8 | 48 | 8 | 1,400 |
| N1 | 8 | 48 | 8 | 1,400 |
| **মোট** | **22** | **132** | **22** | **3,536** |

- বাধ্যতামূলক level sequence: **N3 → N2 → N1**
- Day 1–6-এ vocabulary; প্রতিটি Week-এর Day 7 কেবল Mock Test
- 628 interactive flipbook pages
- প্রতিটি entry-তে読み方、漢字・表現、বাংলা অর্থ, জাপানি usage/example এবং বাংলা ব্যাখ্যা
- N2 dataset-এ 1,400টি unique term; repeated filler row নেই

## প্রধান সুবিধা

- FlipHTML5-style realistic 3D page curl, paper shadow ও directional page-turn sound
- Sound flip animation শুরু হওয়ার সঙ্গে সঙ্গে বাজে; completion-এর পরে delay নেই
- পাতার corner, middle ও **Fore-edge**—পুরো page surface ধরে live drag/curl করা যায়
- পাতার ডান/বাম পাশে left-click বা right-click এবং mouse wheel দিয়ে page turn
- ডবল ক্লিকে 170% Zoom; Zoom অবস্থায় mouse-drag করলে বই pan হবে, পাতা উল্টাবে না; আবার ডবল ক্লিকে reset
- বাম/ডান dynamic paper-stack thickness—বাস্তব বইয়ের মতো completed ও remaining pages বোঝায়
- 540ms দ্রুত page-turn animation; responsive touch/pointer handling
- Desktop-এ দুই-পৃষ্ঠার spread; mobile portrait-এ fitted single-page layout
- Mouse drag, touch swipe, keyboard এবং First/Previous/Next/Last navigation
- `#p=পৃষ্ঠা` deep linking, level-aware thumbnails ও multilevel table of contents
- N3/N2/N1 সব level জুড়ে 3,536-entry full-text search
- Zoom, Auto Flip, Fullscreen, Share, Print এবং sound toggle
- Installable PWA ও offline cache
- সম্পূর্ণ local static build; কোনো CDN/runtime API dependency নেই

## লোকালভাবে চালানো

ফোল্ডারের মধ্যে terminal খুলে চালান:

```bash
python -m http.server 8000
```

তারপর browser-এ খুলুন:

```text
http://localhost:8000
```

> সরাসরি `file://` দিয়ে না খুলে local server বা Netlify ব্যবহার করুন, যাতে service worker/offline support সঠিকভাবে কাজ করে।

## Netlify-তে প্রকাশ

1. `JLPT_N3_N2_N1_3D_Flipbook_Netlify.zip` extract করুন।
2. Netlify Dashboard-এর **Add new site → Deploy manually** নির্বাচন করুন।
3. extracted folder-এর সম্পূর্ণ content drag-and-drop করুন।
4. মূল প্রবেশপথ `index.html`; build command বা environment variable প্রয়োজন নেই।

একই static file structure বজায় রেখে Cloudflare Pages, GitHub Pages বা cPanel-এও প্রকাশ করা যাবে।

## Data and media notes

- N3 primary ও matching Missing sections week/day অনুযায়ী merge করা হয়েছে।
- N2 W1–W4-এর repeated filler বাদ দিয়ে public Nihongo So-Matome N2 W1–W4 study notes থেকে unique real terms নেওয়া হয়েছে; supplied day totals অক্ষুণ্ণ রাখা হয়েছে।
- N2 W5–W8 এবং N1 W1–W8 supplied final HTML sources থেকে নেওয়া।
- Selected Japanese usage sentences are from the edited **Tanaka Corpus** distributed by EDRDG; the corpus was originally released to the public domain and its current edited distribution permits reuse with source attribution.
- Page-turn recording: **“Pages that turn #8”** by Joseph Sardin / BigSoundBank, released under **CC0 Public Domain**; processed in-browser with directional stereo panning and a subtle settle layer.
