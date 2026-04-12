# Pagex Chrome Web Store Submission Checklist

## 1. Runtime package / 运行时包

- [ ] Run `npm run generate:store-assets`
- [ ] Run `npm run package`
- [ ] Confirm upload archive exists:
  - `release/pagex-v0.1.0.zip`
- [ ] Confirm runtime icons exist:
  - `assets/icons/pagex-16.png`
  - `assets/icons/pagex-32.png`
  - `assets/icons/pagex-48.png`
  - `assets/icons/pagex-128.png`

## 2. Store images / 商店图片

- [ ] Upload small promo image:
  - `store-assets/promo/pagex-small-promo-440x280.png`
  - required size: `440x280`
- [ ] Upload marquee image if desired:
  - `store-assets/promo/pagex-marquee-1400x560.png`
  - recommended size: `1400x560`
- [ ] Upload at least 1 screenshot, preferably all 4:
  - `store-assets/screenshots/pagex-screenshot-01-target-tab-1280x800.png`
  - `store-assets/screenshots/pagex-screenshot-02-parsing-1280x800.png`
  - `store-assets/screenshots/pagex-screenshot-03-parse-complete-1280x800.png`
  - `store-assets/screenshots/pagex-screenshot-04-copy-json-1280x800.png`
  - target size: `1280x800`

## 3. Listing copy / 商店文案

- [ ] Use English primary copy from:
  - `docs/store-listing/listing-en.md`
- [ ] Use Chinese reference copy from:
  - `docs/store-listing/listing-zh-CN.md`
- [ ] Confirm summary is within Chrome Web Store limits
- [ ] Confirm title stays concise: `Pagex`
- [ ] Avoid keyword stuffing, exaggerated claims, fake ranking claims, or misleading comparisons

## 4. Privacy and support / 隐私与支持

- [ ] Publish an accessible privacy policy page based on:
  - `docs/store-listing/privacy-policy-en.md`
  - `docs/store-listing/privacy-policy-zh-CN.md`
- [ ] Replace all placeholders:
  - support URL if it changes
  - website if it changes
  - privacy policy URL if hosted outside GitHub
- [ ] Make sure Chrome Web Store privacy fields match the published policy and actual extension behavior

## 5. Metadata and dashboard / 元数据与后台配置

- [ ] Confirm category selection
- [ ] Add support URL
- [ ] Add homepage URL if available
- [ ] Add privacy policy URL
- [ ] Review permissions shown in listing:
  - `activeTab`
  - `scripting`
  - `storage`
  - `tabs`
  - `webNavigation`
  - optional site access by origin request

## 6. Compliance self-check / 合规自检

- [ ] Screenshots reflect real product behavior
- [ ] Promo images use brand styling, not fake Chrome system warnings
- [ ] Listing text is accurate, current, and complete
- [ ] Description does not contain anonymous testimonials
- [ ] Description does not repeat keywords unnaturally
- [ ] Privacy claims match actual code behavior
- [ ] The extension does not claim remote AI processing unless that feature truly exists

## 7. Final verification / 最终验证

- [ ] Load unpacked extension locally
- [ ] Parse a real page successfully
- [ ] Confirm permission request flow works
- [ ] Confirm `COPY.JSON` works
- [ ] Confirm the packaged zip installs correctly before submitting
