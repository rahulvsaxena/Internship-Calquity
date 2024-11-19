const puppeteer = require('puppeteer');

async function convertHtmlToPdf(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-web-security',
    ]
  });

  try {
    const page = await browser.newPage();

    // Add CSS to prevent component breaks and style the footer
    const htmlWithStyles = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* Prevent component breaks */
                    h1, h2, h3, h4, h5, h6, img, figure, pre, .company-update, .key-metric {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

    // Set content and wait for load
    await page.setContent(htmlWithStyles, {
      waitUntil: 'networkidle0'
    });

    // Get the total number of pages
    const pdf = await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '40px',
        right: '20px',
        bottom: '90px', // Increased bottom margin for footer
        left: '20px'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // Empty header
      footerTemplate: `
                <style>
                html {
                    -webkit-print-color-adjust: exact;
                }
                </style>
                <footer style="font-size: 14px; padding: 30px 10px 30px 10px; width: 100%;
                        background-color: #f1f5f9;
                        border-top: 1px solid #e2e8f0;
                        font-family: 'Arial', sans-serif;
                        margin-bottom: -20px;
                        color: #475569;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
                        <span>© 2024 Financial News Corp.</span>
                        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                    </div>
                </footer>
            `,
      preferCSSPageSize: false
    });

    console.log(`PDF successfully created at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}


// Example usage
const regex = /\/\*([\s\S]*?)\*\//g;

const html = `  
<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>CQNowReport</title>  
    <style>  
        *,
::before,
::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}

/*
! tailwindcss v3.4.14 | MIT License | https://tailwindcss.com
*/
/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured  font-family by default.
5. Use the user's configured  font-feature-settings by default.
6. Use the user's configured  font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
  tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from  so users can set them as a class directly on the  element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured  font-family by default.
2. Use the user's configured  font-feature-settings by default.
3. Use the user's configured  font-variation-settings by default.
4. Correct the odd  font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent  and  elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional  styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to  in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/
dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder,
textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/
:disabled {
  cursor: default;
}

/*
1. Make replaced elements  by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add  to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */
[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.relative {
  position: relative;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-12 {
  margin-bottom: 3rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-12 {
  margin-top: 3rem;
}

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.table {
  display: table;
}

.grid {
  display: grid;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-3 {
  height: 0.75rem;
}

.h-4 {
  height: 1rem;
}

.h-6 {
  height: 1.5rem;
}

.h-8 {
  height: 2rem;
}

.h-9 {
  height: 2.25rem;
}

.h-full {
  height: 100%;
}

.min-h-screen {
  min-height: 100vh;
}

.w-12 {
  width: 3rem;
}

.w-3 {
  width: 0.75rem;
}

.w-4 {
  width: 1rem;
}

.w-6 {
  width: 1.5rem;
}

.w-9 {
  width: 2.25rem;
}

.w-full {
  width: 100%;
}

.w-screen {
  width: 100vw;
}

.max-w-7xl {
  max-width: 80rem;
}

.shrink-0 {
  flex-shrink: 0;
}

.caption-bottom {
  caption-side: bottom;
}

.list-inside {
  list-style-position: inside;
}

.list-disc {
  list-style-type: disc;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.flex-col {
  flex-direction: column;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.space-y-1> :not([hidden])~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));
}

.space-y-1\.5> :not([hidden])~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.375rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.375rem * var(--tw-space-y-reverse));
}

.space-y-3> :not([hidden])~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
}

.space-y-4> :not([hidden])~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1rem * var(--tw-space-y-reverse));
}

.overflow-auto {
  overflow: auto;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: var(--radius);
}

.rounded-md {
  border-radius: calc(var(--radius) - 2px);
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-t-2xl {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.rounded-t-lg {
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
}

.rounded-t-xl {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.border {
  border-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-t {
  border-top-width: 1px;
}

.border-input {
  border-color: hsl(var(--input));
}

.border-transparent {
  border-color: transparent;
}

.bg-background {
  background-color: hsl(var(--background));
}

.bg-card {
  background-color: hsl(var(--card));
}

.bg-destructive {
  background-color: hsl(var(--destructive));
}

.bg-gray-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}

.bg-green-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(220 252 231 / var(--tw-bg-opacity));
}

.bg-yellow-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 249 195 / var(--tw-bg-opacity));
}

.bg-muted {
  background-color: hsl(var(--muted));
}

.bg-muted\/50 {
  background-color: hsl(var(--muted) / 0.5);
}

.bg-primary {
  background-color: hsl(var(--primary));
}

.bg-red-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 226 226 / var(--tw-bg-opacity));
}

.bg-secondary {
  background-color: hsl(var(--secondary));
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.p-8 {
  padding: 2rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-2\.5 {
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}

.px-3 {
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}

.py-0\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-4 {
  padding-bottom: 1rem;
}

.pt-0 {
  padding-top: 0px;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.align-middle {
  vertical-align: middle;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.leading-none {
  line-height: 1;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.text-card-foreground {
  color: hsl(var(--card-foreground));
}

.text-destructive-foreground {
  color: hsl(var(--destructive-foreground));
}

.text-foreground {
  color: hsl(var(--foreground));
}

.text-gray-700 {
  --tw-text-opacity: 1;
  color: rgb(55 65 81 / var(--tw-text-opacity));
}

.text-green-600 {
  --tw-text-opacity: 1;
  color: rgb(22 163 74 / var(--tw-text-opacity));
}

.text-green-700 {
  --tw-text-opacity: 1;
  color: rgb(21 128 61 / var(--tw-text-opacity));
}

.text-yellow-600 {
  --tw-text-opacity: 1;
  color: rgb(202 138 4 / var(--tw-text-opacity));
}

.text-yellow-700 {
  --tw-text-opacity: 1;
  color: rgb(161 98 7 / var(--tw-text-opacity));
}

.text-muted-foreground {
  color: hsl(var(--muted-foreground));
}

.text-primary {
  color: hsl(var(--primary));
}

.text-primary-foreground {
  color: hsl(var(--primary-foreground));
}

.text-red-600 {
  --tw-text-opacity: 1;
  color: rgb(220 38 38 / var(--tw-text-opacity));
}

.text-red-700 {
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity));
}

.text-secondary-foreground {
  color: hsl(var(--secondary-foreground));
}

.underline-offset-4 {
  text-underline-offset: 4px;
}

.opacity-90 {
  opacity: 0.9;
}

.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.outline {
  outline-style: solid;
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@keyframes enter {

  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {

  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0));
  }
}

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }

  a:hover {
    color: #747bff;
  }

  button {
    background-color: #f9f9f9;
  }
}

.hover\:bg-accent:hover {
  background-color: hsl(var(--accent));
}

.hover\:bg-destructive\/90:hover {
  background-color: hsl(var(--destructive) / 0.9);
}

.hover\:bg-gray-200:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
}

.hover\:bg-green-200:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(187 247 208 / var(--tw-bg-opacity));
}

.hover\:bg-muted\/50:hover {
  background-color: hsl(var(--muted) / 0.5);
}

.hover\:bg-primary\/80:hover {
  background-color: hsl(var(--primary) / 0.8);
}

.hover\:bg-primary\/90:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.hover\:bg-red-200:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(254 202 202 / var(--tw-bg-opacity));
}

.hover\:bg-secondary\/80:hover {
  background-color: hsl(var(--secondary) / 0.8);
}

.hover\:text-accent-foreground:hover {
  color: hsl(var(--accent-foreground));
}

.hover\:underline:hover {
  text-decoration-line: underline;
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus\:ring-ring:focus {
  --tw-ring-color: hsl(var(--ring));
}

.focus\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}

.focus-visible\:outline-none:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-visible\:ring-1:focus-visible {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus-visible\:ring-ring:focus-visible {
  --tw-ring-color: hsl(var(--ring));
}

.disabled\:pointer-events-none:disabled {
  pointer-events: none;
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.data-\[state\=selected\]\:bg-muted[data-state="selected"] {
  background-color: hsl(var(--muted));
}

@media (min-width: 640px) {

  .sm\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {

  .lg\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media print {

  .print\:rounded-none {
    border-radius: 0px;
  }

  .print\:bg-white {
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  }

  .print\:p-0 {
    padding: 0px;
  }
}

.\[\&\:has\(\[role\=checkbox\]\)\]\:pr-0:has([role=checkbox]) {
  padding-right: 0px;
}

.\[\&\>\[role\=checkbox\]\]\:translate-y-\[2px\]>[role=checkbox] {
  --tw-translate-y: 2px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.\[\&\>tr\]\:last\:border-b-0:last-child>tr {
  border-bottom-width: 0px;
}

.\[\&_svg\]\:pointer-events-none svg {
  pointer-events: none;
}

.\[\&_svg\]\:size-4 svg {
  width: 1rem;
  height: 1rem;
}

.\[\&_svg\]\:shrink-0 svg {
  flex-shrink: 0;
}

.\[\&_tr\:last-child\]\:border-0 tr:last-child {
  border-width: 0px;
}

.\[\&_tr\]\:border-b tr {
  border-bottom-width: 1px;
}

#root {
  margin: 0 auto;
  text-align: center;
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}  
    </style>  
</head>  
<body>  
  <div id="root">  
    <div class="min-h-screen bg-background p-4 w-screen">  
      <div class="max-w-7xl mx-auto">  
        <div class="bg-white w-full relative">  
          <div class="p-4 pb-4">  
              
        <header class="bg-primary text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break">  
          <div class="flex items-center gap-4">
<svg id="Layer_29" data-name="Layer 29" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 595.28 595.28" width="70" height="70">
  <defs>
    <style>
      .cls-1 {
        filter: url(#drop-shadow-2);
      }

      .cls-1, .cls-2 {
        fill: none;
        stroke: #fff;
        stroke-linejoin: round;
        stroke-width: 15px;
      }

      .cls-2 {
        filter: url(#drop-shadow-1);
      }
    </style>
    <filter id="drop-shadow-1" filterUnits="userSpaceOnUse">
      <feOffset dx="7" dy="7"/>
      <feGaussianBlur result="blur" stdDeviation="2.83"/>
      <feFlood flood-color="#000" flood-opacity=".75"/>
      <feComposite in2="blur" operator="in"/>
      <feComposite in="SourceGraphic"/>
    </filter>
    <filter id="drop-shadow-2" filterUnits="userSpaceOnUse">
      <feOffset dx="7" dy="7"/>
      <feGaussianBlur result="blur-2" stdDeviation="5"/>
      <feFlood flood-color="#000" flood-opacity=".75"/>
      <feComposite in2="blur-2" operator="in"/>
      <feComposite in="SourceGraphic"/>
    </filter>
  </defs>
  <rect y=".04" width="595.28" height="595.28"/>
  <g>
    <polyline class="cls-2" points="285.03 177.91 285.03 142.21 136.59 142.21 136.59 285.02 433.46 285.02 433.45 427.83 285.03 427.83 285.03 249.32"/>
    <line class="cls-1" x1="458.68" y1="453.07" x2="433.45" y2="427.83"/>
  </g>
</svg>  
            <div>  
              <h1 class="text-3xl font-bold">Weekly Financial Update</h1>  
              <p class="text-sm opacity-90 text-left">Week ended 23th Nov 2024</p>  
            </div>  
          </div>  
        </header>  
      
            <section class="mb-8 avoid-break">  
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Market Overview</h2>  
              <div class="rounded-xl border bg-card text-card-foreground">  
                <div class="relative w-full overflow-auto">  
                  <table class="w-full caption-bottom text-sm">  
                    <thead class="[&_tr]:border-b">  
                      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                        <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Company</th>  
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground text-center">Weekly Close</th>  
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground text-center">Weekly</th>  
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground text-center">YTD</th>  
                      </tr>  
                    </thead>  
                    <tbody class="[&_tr:last-child]:border-0">  
                        
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/JIOFIN.NS.png?height=30" class="h-4 rounded-sm"><span>Jio Financial Services Limited (JIOFIN)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹319.35</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+2.4%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+48.2%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/BHARTIARTL.NS.png?height=30" class="h-4 rounded-sm"><span>Bharti Airtel Limited (BHARTIARTL)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹1525.50</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-2.2%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+59.6%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/ASIANPAINT.NS.png?height=30" class="h-4 rounded-sm"><span>Asian Paints Limited (ASIANPAINT)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹2483.70</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-2.2%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-20.0%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/RELIANCE.NS.png?height=30" class="h-4 rounded-sm"><span>Reliance Industries Limited (RELIANCE)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹1241.65</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-2.4%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+6.4%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/M&M.NS.png?height=30" class="h-4 rounded-sm"><span>Mahindra & Mahindra Limited (M&M)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹2948.95</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+0.6%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+91.4%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/ZOMATO.NS.png?height=30" class="h-4 rounded-sm"><span>Zomato Limited (ZOMATO)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹271.36</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+4.9%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+129.7%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/MAHABANK.NS.png?height=30" class="h-4 rounded-sm"><span>Bank of Maharashtra (MAHABANK)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹52.43</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-1.7%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+19.5%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/DBREALTY.NS.png?height=30" class="h-4 rounded-sm"><span>Valor Estate Limited (DBREALTY)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹154.92</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-5.7%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-26.9%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/KHADIM.NS.png?height=30" class="h-4 rounded-sm"><span>Khadim India Limited (KHADIM)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹366.45</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-3.5%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+0.7%</div>  
                </td>  
            </tr>  
          
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="https://financialmodelingprep.com/image-stock/FEDERALBNK.NS.png?height=30" class="h-4 rounded-sm"><span>The Federal Bank  Limited (FEDERALBNK)</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">₹206.65</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>-0.5%</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>+41.0%</div>  
                </td>  
            </tr>  
          
                    </tbody>  
                  </table>  
                </div>  
              </div>  
            </section>  
              
        <section class="mb-8 avoid-break">  
            <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">General Insights</h2>  
            <div class="space-y-4">  
                  
            <div class="p-3 bg-muted rounded-lg">  
                <h4 class="font-semibold mb-1 text-left">New Title 2</h4>  
                <p class="text-left">NIFTY High: BULLISH Market</p>  
            </div>  
              
            </div>  
        </section>  
          
              
        <section class="mb-8 avoid-break">  
            <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Reports from the Analysts' Desk</h2>  
            <div class="space-y-4">  
                  
            <div class="p-3 bg-muted rounded-lg">  
                <h4 class="font-semibold mb-1 text-left"><a href="https://calquity-pdf-upload.s3.ap-southeast-1.amazonaws.com/cqnow-broker-reports/1732037223770PrathamJain_Resume.pdf" target="_blank">New Report</a></h4>  
            </div>  
              
            </div>  
        </section>  
          
            <section>  
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Company Updates</h2>  
              <div class="grid grid-cols-1 gap-6">  
                  
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/JIOFIN.NS.png?height=30" class="h-6 rounded-sm">Jio Financial Services Limited (JIOFIN)  
                        </div>  
                        <div>
                          
                        <div class="text-base mt-1 font-semibold text-green-600">₹319.35</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">125.24</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">1.47</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">-4.62</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">-4.78</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/news/india/i-do-not-believe-in-work-life-balance-infosys-narayana-murthy-stands-with-his-view/articleshow/115305558.cms" style="text-decoration: none; color: inherit;" target="_blank">I do not believe in work-life balance: Infosys' Narayana Murthy stands with his view</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/personal-finance/unifi-capital-gets-sebis-all-clear-to-start-mutual-fund-operations-12867275.html" style="text-decoration: none; color: inherit;" target="_blank">Unifi Capital Gets Sebis All Clear To Start Mutual Fund Operations</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/BHARTIARTL.NS.png?height=30" class="h-6 rounded-sm">Bharti Airtel Limited (BHARTIARTL)  
                        </div>  
                        <div>
                          
                <div class="flex flex-wrap gap-1">  
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-yellow-100 text-yellow-700">RSI Oversold</span>  
                </div>  
                  
                        <div class="text-base mt-1 font-semibold text-red-600">₹1525.50</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">73.52</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">10.13</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0.52</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">-7.54</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">8.44</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/BHARTIARTL_15112024143144_Reg30DoTPenaltyNov15.pdf" style="text-decoration: none; color: inherit;" target="_blank">Bharti Airtel Limited Receives Penalty Notice from Department of Telecommunications</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/BHARTIARTL_14112024185519_Reg30DoTPenaltyNov14.pdf" style="text-decoration: none; color: inherit;" target="_blank">Bharti Airtel Limited Receives Penalty Notice from Department of Telecommunications</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/BHARTIARTL_13112024183351_Reg30InvestorConfNov13.pdf" style="text-decoration: none; color: inherit;" target="_blank">Bharti Airtel Limited Announces Upcoming Investor Conferences</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/BHARTIARTL_13112024143414_Reg30DoTPenaltyNov13.pdf" style="text-decoration: none; color: inherit;" target="_blank">Bharti Airtel Limited Receives Notice of Penalty from Department of Telecommunications</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/BHARTIARTL_12112024230808_Reg30IDTPenaltyNov12.pdf" style="text-decoration: none; color: inherit;" target="_blank">Bharti Airtel Limited Disputes GST Penalty Order</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/ASIANPAINT.NS.png?height=30" class="h-6 rounded-sm">Asian Paints Limited (ASIANPAINT)  
                        </div>  
                        <div>
                          
                <div class="flex flex-wrap gap-1">  
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700">52 Week Low</span> <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-yellow-100 text-yellow-700">RSI Oversold</span>  
                </div>  
                  
                        <div class="text-base mt-1 font-semibold text-red-600">₹2483.70</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">52.08</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">13.2</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">1.3</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">-18.19</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">-15.69</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                <div class="mb-4">  
                    <h4 class="font-semibold mb-2 text-left">Insights from the Analysts' Desk</h4>  
                    <div class="space-y-3">  
                          
                <div class="p-3 bg-muted rounded-lg">  
                    <h4 class="font-semibold mb-1 text-left">New Title</h4>  
                    <p class="text-left">BUY Now</p>  
                </div>  
                  
                    </div>  
                </div>  
              
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/ASIANPAINT_14112024193220_SEIntimationScheduleofAnalystInvestorMeet.pdf" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints Limited Announces Participation in Analyst/Investor Conference</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/ASIANPAINT_14112024191535_SEIntimationTranscriptH1FY25.pdf" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints Limited Q2 FY2025 Earnings Conference Transcript Released</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/expert-view/tata-motors-poised-for-growth-with-strong-jlr-and-cv-outlook-deven-choksey/articleshow/115204436.cms" style="text-decoration: none; color: inherit;" target="_blank">Tata Motors poised for growth with strong JLR and CV outlook: Deven Choksey</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/earnings/asian-paints-q2-competitive-risks-come-to-the-fore-12863504.html" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints Q2 Competitive Risks Come To The Fore</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/expert-view/input-costs-and-competition-weigh-on-paint-sector-mayuresh-joshi/articleshow/115181271.cms" style="text-decoration: none; color: inherit;" target="_blank">Input costs and competition weigh on paint sector: Mayuresh Joshi</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/stocks/news/asian-paints-loses-lustre-for-investors-too/articleshow/115196730.cms" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints loses lustre for investors, too</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.livemint.com/news/india/traders-mete-out-stiffer-penalty-to-india-firms-missing-earnings-11731370642991.html" style="text-decoration: none; color: inherit;" target="_blank">Traders Mete Out Stiffer Penalty to India Firms Missing Earnings</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/ASIANPAINT_11112024202552_SEIntimationAudioRecordingH1FY25.pdf" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints Limited Announces Audio Recording of Investor Conference</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/markets/asian-paints-not-seeing-disruption-from-new-entrants-says-ceo-amit-syngle-12863259.html" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints Not Seeing Disruption From New Entrants Says Ceo Amit Syngle</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/markets/technical-view-nifty-needs-to-defend-24000-to-bounce-towards-24500-amid-choppy-trade-12863150.html" style="text-decoration: none; color: inherit;" target="_blank">Technical View Nifty Needs To Defend 24000 To Bounce Towards 24500 Amid Choppy Trade</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/quick-take-asian-paints-q2-is-competition-hurting-growth-12862766.html" style="text-decoration: none; color: inherit;" target="_blank">Quick Take Asian Paints Q2 Is Competition Hurting Growth</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/expert-view/mm-emerging-as-leading-auto-pick-amid-positive-tractor-outlook-sandip-sabharwal/articleshow/115164545.cms" style="text-decoration: none; color: inherit;" target="_blank">M&M emerging as leading auto pick amid positive tractor outlook: Sandip Sabharwal</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.livemint.com/market/stock-market-news/asian-paints-shares-slide-9-5-to-over-3-year-low-as-q2-results-disappoint-analysts-cut-target-price-11731297016194.html" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints shares slide 9.5% to over 3-year low as Q2 results disappoint, analysts cut target price</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.business-standard.com/markets/news/asian-paints-tanks-9-hits-over-3-year-low-on-weak-q2-results-124111100199_1.html" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints stock tanks 9%, hits over 3-year low on weak Q2 numbers</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/markets/brokerages-sound-the-alarm-over-asian-paints-underwhelming-q2fy25-results-12862450.html" style="text-decoration: none; color: inherit;" target="_blank">Brokerages Sound The Alarm Over Asian Paints Underwhelming Q2Fy25 Results</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/markets/live-can-nifty-defend-24000-as-technical-bounce-reverses-tata-motors-in-focus-opening-bell-12862464.html" style="text-decoration: none; color: inherit;" target="_blank">Live Can Nifty Defend 24000 As Technical Bounce Reverses Tata Motors In Focus Opening Bell</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/markets/brokerage-radar-jpmorgan-downgrades-asian-paints-to-underweight-kotak-upgrades-ashok-leyland-to-add-12862441.html" style="text-decoration: none; color: inherit;" target="_blank">Brokerage Radar Jpmorgan Downgrades Asian Paints To Underweight Kotak Upgrades Ashok Leyland To Add</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/stocks/earnings/asian-paints-needs-to-play-the-price-card-well-to-get-back-its-colour/articleshow/115157229.cms" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints needs to play the price card well to get back its colour</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/industry/cons-products/paints/asian-paints-reports-significant-42-4-year-on-year-drop-in-net-profit/articleshow/115145593.cms" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints reports significant 42.4% year-on-year drop in net profit</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://www.business-standard.com/companies/news/interarch-building-products-plans-to-double-turnover-to-rs-2-500-cr-by-2028-124111000136_1.html" style="text-decoration: none; color: inherit;" target="_blank">Interarch Building Products plans to double turnover to Rs 2,500 cr by 2028</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/stocks/earnings/asian-paints-q2-net-falls-42-on-subdued-demand/articleshow/115134181.cms" style="text-decoration: none; color: inherit;" target="_blank">Asian Paints Q2 Net falls 42% on subdued demand</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/RELIANCE.NS.png?height=30" class="h-6 rounded-sm">Reliance Industries Limited (RELIANCE)  
                        </div>  
                        <div>
                          
                <div class="flex flex-wrap gap-1">  
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-yellow-100 text-yellow-700">RSI Oversold</span>  
                </div>  
                  
                        <div class="text-base mt-1 font-semibold text-red-600">₹1241.65</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">24.74</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">2.05</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0.4</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">-10.15</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">-14.17</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                <div class="mb-4">  
                    <h4 class="font-semibold mb-2 text-left">Reports from the Analysts' Desk</h4>  
                    <div class="space-y-3">  
                          
                <div class="p-3 bg-muted rounded-lg">  
                    <h4 class="font-semibold mb-1 text-left"><a href="https://calquity-pdf-upload.s3.ap-southeast-1.amazonaws.com/cqnow-broker-reports/1732033433857PrathamJain_Resume.pdf" target="_blank">Research Report about Resume</a></h4>  
                </div>  
                  
                    </div>  
                </div>  
              
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_14112024213500_SE_14112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance Industries and Disney Complete Joint Venture Transaction</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/industry/telecom/telecom-news/customers-consuming-more-should-pay-more-subs-loss-to-bsnl-reversing-quickly-vi-official/articleshow/115306452.cms" style="text-decoration: none; color: inherit;" target="_blank">Customers consuming more should pay more, subs loss to BSNL reversing quickly: Vi official</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_14112024213118_SE_14112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance Industries and Disney Complete Joint Venture Transaction</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_14112024211516_SE_Pre.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance Industries Limited to Participate in Morgan Stanley Asia-Pacific Summit</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://www.business-standard.com/companies/news/vodafone-idea-expects-subscriber-losses-from-tariff-hike-to-reverse-soon-124111401949_1.html" style="text-decoration: none; color: inherit;" target="_blank">Vodafone Idea expects subscriber losses from tariff hike to reverse soon</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.business-standard.com/companies/news/ril-viacom18-and-disney-complete-merger-to-create-a-rs-70-352-cr-jv-124111401795_1.html" style="text-decoration: none; color: inherit;" target="_blank">RIL, Viacom18 and Disney complete merger to create a Rs 70,352 cr JV</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.livemint.com/industry/media/reliance-ril-walt-disney-kevin-vaz-kiran-mani-sanjog-gupta-ril-disney-merger-viacom18-star-india-mukesh-ambani-bob-iger-11731588933803.html" style="text-decoration: none; color: inherit;" target="_blank">Kevin Vaz, Kiran Mani and Sanjog Gupta to head Reliance-Disney JV as CEOs</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/reliance-and-disney-complete-transaction-to-form-jv-for-entertainment-brands-in-india-12867744.html" style="text-decoration: none; color: inherit;" target="_blank">Reliance And Disney Complete Transaction To Form Jv For Entertainment Brands In India</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.business-standard.com/companies/news/reliance-disney-complete-merger-form-rs-70-352-crore-joint-venture-124111401609_1.html" style="text-decoration: none; color: inherit;" target="_blank">Reliance, Disney complete merger, form Rs 70,352 crore joint venture</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/industry/media/entertainment/media/ril-viacom18-and-disney-complete-merger-to-create-a-rs-70352-cr-jv/articleshow/115299610.cms" style="text-decoration: none; color: inherit;" target="_blank">RIL, Viacom18 and Disney complete merger to create a Rs 70,352 cr JV</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_14112024173335_SE_MR.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance and Disney Announce Joint Venture to Transform India's Entertainment Landscape</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_14112024172615_SE_MR.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance and Disney Announce Joint Venture Completion</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.business-standard.com/finance/personal-finance/mf-trends-net-equity-inflows-hit-all-time-high-in-oct-24-up-75-this-year-124111400929_1.html" style="text-decoration: none; color: inherit;" target="_blank">MF trends: Net equity inflows hit all-time high in Oct 24; up 75% this year</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/personal-finance/unifi-capital-gets-sebis-all-clear-to-start-mutual-fund-operations-12867275.html" style="text-decoration: none; color: inherit;" target="_blank">Unifi Capital Gets Sebis All Clear To Start Mutual Fund Operations</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_13112024214629_SE_post_13112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance Industries Limited Provides Update on Institutional Investors’ Meeting</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_13112024212203_SE_13112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance Industries Limited to Participate in JM Financial India Conference</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/RELIANCE_12112024202405_SE_12112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Reliance Industries Limited to Participate in CLSA India Forum</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.business-standard.com/companies/news/ril-to-invest-rs-65-000-crore-in-andhra-pradesh-for-clean-energy-project-124111200423_1.html" style="text-decoration: none; color: inherit;" target="_blank">RIL to invest Rs 65,000 crore in Andhra Pradesh for clean energy project</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/industry/renewables/ril-to-pump-rs-65000-cr-into-andhra-pradesh-for-500-biogas-plants-its-biggest-investment-outside-gujarat/articleshow/115191748.cms" style="text-decoration: none; color: inherit;" target="_blank">RIL to pump Rs 65,000 cr  into Andhra Pradesh for 500 biogas plants, its biggest RE investment outside Gujarat</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/industry/telecom/telecom-news/satcom-has-the-potential-to-connect-the-hitherto-unconnected-communications-minister-jyotiraditya-scindia/articleshow/115190685.cms" style="text-decoration: none; color: inherit;" target="_blank">Satcom has the potential to connect the hitherto unconnected: Communications minister Jyotiraditya Scindia</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.business-standard.com/india-news/uttar-pradesh-govt-plans-private-textile-parks-to-curb-chinese-imports-124111101761_1.html" style="text-decoration: none; color: inherit;" target="_blank">Uttar Pradesh govt plans private textile parks to curb Chinese imports</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/stocks/news/sc-dismisses-sebis-appeals-against-sat-relief-for-reliance-promoters/articleshow/115188207.cms" style="text-decoration: none; color: inherit;" target="_blank">SC dismisses Sebi's appeals against SAT relief for Reliance, promoters</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.business-standard.com/industry/news/trai-to-finalise-satcom-spectrum-allocation-norm-suggestions-by-dec-15-124111101527_1.html" style="text-decoration: none; color: inherit;" target="_blank">Trai to finalise satcom spectrum allocation norm suggestions by Dec 15</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.business-standard.com/companies/news/supreme-court-dismisses-1994-sebi-appeal-against-ambani-s-reliance-entities-124111101209_1.html" style="text-decoration: none; color: inherit;" target="_blank">Supreme Court dismisses 1994 Sebi appeal against Ambani's Reliance entities</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/tech/technology/swiggy-expands-leadership-team-with-two-senior-appointments/articleshow/115182460.cms" style="text-decoration: none; color: inherit;" target="_blank">Swiggy expands leadership team with two senior appointments</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/tech/technology/5-things-to-know-heres-all-about-jio-vs-starlink-battle-for-satellite-spectrum/videoshow/115182476.cms" style="text-decoration: none; color: inherit;" target="_blank">5 Things to know: Here’s all about Jio vs Starlink battle for satellite spectrum</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.business-standard.com/companies/news/elon-musk-s-starlink-moves-closer-to-india-licence-accepts-data-terms-124111101109_1.html" style="text-decoration: none; color: inherit;" target="_blank">Elon Musk's Starlink moves closer to India licence, accepts data terms</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.livemint.com/companies/news/supreme-court-sebi-penalty-plea-mukesh-ambani-reliance-industries-ril-rpl-share-manipulation-case-sat-11731313266998.html" style="text-decoration: none; color: inherit;" target="_blank">SC dismisses Sebi's  ₹25 crore penalty plea against Mukesh Ambani in RPL share manipulation case</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/news/india/rpl-case-sc-dismisses-sebis-appeal-against-mukesh-ambanis-reliance/articleshow/115169735.cms" style="text-decoration: none; color: inherit;" target="_blank">RPL case: SC dismisses SEBI’s appeal against Mukesh Ambani’s Reliance</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/personal-finance/which-overseas-international-mutual-funds-open-for-subscription-currently-12860911.html" style="text-decoration: none; color: inherit;" target="_blank">Which Overseas International Mutual Funds Open For Subscription Currently</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/telecom/elon-musks-starlink-agrees-to-security-norms-licence-application-back-on-track-12862578.html" style="text-decoration: none; color: inherit;" target="_blank">Elon Musks Starlink Agrees To Security Norms Licence Application Back On Track</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.business-standard.com/companies/results/q2-results-today-hindalco-ongc-britannia-among-321-to-post-earnings-124111100218_1.html" style="text-decoration: none; color: inherit;" target="_blank">Q2 results today: Hindalco, ONGC, Britannia among 321 to post earnings</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/earnings/earnings-slowdown-more-than-half-of-nifty-firms-report-lower-than-expected-profits-12862489.html" style="text-decoration: none; color: inherit;" target="_blank">Earnings Slowdown More Than Half Of Nifty Firms Report Lower Than Expected Profits</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/ipo/swiggy-ipo-allotment-status-how-to-check-details-online-via-registrar-bse-12861752.html" style="text-decoration: none; color: inherit;" target="_blank">Swiggy Ipo Allotment Status How To Check Details Online Via Registrar Bse</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/stocks/news/mcap-of-6-of-top-10-most-valued-firms-erode-rs-1-55-lakh-cr-reliance-biggest-laggard/articleshow/115136515.cms" style="text-decoration: none; color: inherit;" target="_blank">Mcap of 6 of top-10 most-valued firms erode Rs 1.55 lakh cr; Reliance biggest laggard</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/markets/mcap-of-6-of-top-10-most-valued-firms-erode-rs-1-55-lakh-cr-reliance-biggest-laggard-12862200.html" style="text-decoration: none; color: inherit;" target="_blank">Mcap Of 6 Of Top 10 Most Valued Firms Erode Rs 1 55 Lakh Cr Reliance Biggest Laggard</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://www.business-standard.com/pti-stories/national/mcap-of-6-of-top-10-most-valued-firms-erode-rs-1-55-lakh-cr-reliance-biggest-laggard-124111000123_1.html" style="text-decoration: none; color: inherit;" target="_blank">Mcap of 6 of top-10 most-valued firms erode Rs 1.55 trn; RIL top laggard</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/M&M.NS.png?height=30" class="h-6 rounded-sm">Mahindra & Mahindra Limited (M&M)  
                        </div>  
                        <div>
                          
                        <div class="text-base mt-1 font-semibold text-green-600">₹2948.95</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">29.18</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">4.66</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0.74</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">0.67</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">18.07</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/M&M_14112024214254_Employeeslist14112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Mahindra & Mahindra Announces Transfer of Equity Shares to Employees</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/M&M_14112024151416_Concluded14112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Mahindra & Mahindra Limited Participates in Avendus Spark Investor Conference</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/M&M_12112024184819_Concluded12112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Mahindra & Mahindra Limited Updates on Analyst/Investor Meeting Participation</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/ZOMATO.NS.png?height=30" class="h-6 rounded-sm">Zomato Limited (ZOMATO)  
                        </div>  
                        <div>
                          
                        <div class="text-base mt-1 font-semibold text-green-600">₹271.36</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">323.05</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">11.2</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">1.3</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">26.78</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/MAHABANK.NS.png?height=30" class="h-6 rounded-sm">Bank of Maharashtra (MAHABANK)  
                        </div>  
                        <div>
                          
                        <div class="text-base mt-1 font-semibold text-red-600">₹52.43</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">7.58</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">1.62</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">2.7</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">-5.88</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">-14.17</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/MAHABANK_16112024131508_MCLRIntimation_November2024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Bank of Maharashtra Announces MCLR Review and Updates</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/MAHABANK_13112024185811_LettertoSE_AppofSCA_13112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Bank of Maharashtra Appoints New Statutory Central Auditors for 2024-25</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/DBREALTY.NS.png?height=30" class="h-6 rounded-sm">Valor Estate Limited (DBREALTY)  
                        </div>  
                        <div>
                          
                <div class="flex flex-wrap gap-1">  
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700">52 Week Low</span>  
                </div>  
                  
                        <div class="text-base mt-1 font-semibold text-red-600">₹154.92</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">31.75</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">1.66</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">-12.9</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">-25.51</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/DBREALTY_16112024132812_SE_Intimation_newspaper_adv.pdf" style="text-decoration: none; color: inherit;" target="_blank">Valor Estate Limited Publishes Unaudited Financial Results</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/DBREALTY_14112024230256_Statement_of_Deviation_or_Variation.pdf" style="text-decoration: none; color: inherit;" target="_blank">Valor Estate Limited Reports No Deviation in Fund Utilization for Q3 2024</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/DBREALTY_14112024223753_Monitoring_Report_Fn.pdf" style="text-decoration: none; color: inherit;" target="_blank">Valor Estate Limited Releases Monitoring Agency Report for Q3 2024</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/DBREALTY_14112024220534_Disclosure_of_Change_in_Statutory_Auditors.pdf" style="text-decoration: none; color: inherit;" target="_blank">Change in Statutory Auditor for Neelkamal Realtors Tower Private Limited</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/DBREALTY_14112024215807_CoveringletterandPressRelease.pdf" style="text-decoration: none; color: inherit;" target="_blank">Valor Estate Limited Reports Financial Results and Major Developments</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/DBREALTY_14112024215434_Intimationnse.pdf" style="text-decoration: none; color: inherit;" target="_blank">Valor Estate Limited Announces Successful Land Sale and Debt Reduction</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>  
                        </div><span class="text-red-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/results_14112024214529.pdf" style="text-decoration: none; color: inherit;" target="_blank">Valor Estate Limited Announces Financial Results for Q2 and Half Year Ended September 30, 2024</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/KHADIM.NS.png?height=30" class="h-6 rounded-sm">Khadim India Limited (KHADIM)  
                        </div>  
                        <div>
                          
                        <div class="text-base mt-1 font-semibold text-red-600">₹366.45</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">113.1</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">2.7</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">-2.58</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">1.89</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/KHADIM_16112024134125_ConcallTranscript.pdf" style="text-decoration: none; color: inherit;" target="_blank">Khadim India Limited Reports Q2 & H1 FY '25 Results and Strategic Developments</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/KHADIM_15112024135141_NewspaperPublication.pdf" style="text-decoration: none; color: inherit;" target="_blank">Khadim India Limited Announces Hearing for Company Scheme Petition</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/KHADIM_12112024185035_InvestorMeetAudioLink.pdf" style="text-decoration: none; color: inherit;" target="_blank">Khadim India Limited Announces Audio Recording of Investor Meet</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/KHADIM_12112024145919_IPQ2H1FY25.pdf" style="text-decoration: none; color: inherit;" target="_blank">Khadim India Limited Announces Investor Presentation for Q2 & H1 FY25 Results</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://www.moneycontrol.com/news/business/earnings/khadim-india-consolidated-september-2024-net-sales-at-rs-160-58-crore-up-2-22-y-o-y-12862753.html" style="text-decoration: none; color: inherit;" target="_blank">Khadim India Consolidated September 2024 Net Sales At Rs 160 58 Crore Up 2 22 Y O Y</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="https://financialmodelingprep.com/image-stock/FEDERALBNK.NS.png?height=30" class="h-6 rounded-sm">The Federal Bank  Limited (FEDERALBNK)  
                        </div>  
                        <div>
                          
                <div class="flex flex-wrap gap-1">  
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700">52 Week High</span>  
                </div>  
                  
                        <div class="text-base mt-1 font-semibold text-red-600">₹206.65</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                      
                <div class="flex flex-wrap gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P E Ratio</p><p class="font-semibold">12.34</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">P B Ratio</p><p class="font-semibold">1.55</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Dividend Yield</p><p class="font-semibold">0.6</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 50DMA</p><p class="font-semibold">6.67</p></div> <div class="flex flex-col flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">Price to 200DMA</p><p class="font-semibold">18.09</p></div>  
                </div>  
              
                    <div class="space-y-4">  
                          
                          
                          
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                         
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/FEDERALBNK_16112024132442_SEINTIMATION241057.pdf" style="text-decoration: none; color: inherit;" target="_blank">Federal Bank Announces Allotment of Equity Shares Under Employee Stock Option Schemes</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/FEDERALBNK_14112024220232_InvestorMeeting_141124.pdf" style="text-decoration: none; color: inherit;" target="_blank">Federal Bank Schedules Analyst/Investor Meeting</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/FEDERALBNK_14112024214119_Investor_Meeting_14112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Federal Bank Schedules Analyst/Investor Meetings</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  
                        </div><span class="text-gray-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/FEDERALBNK_13112024213944_Investor_Meeting_13112024.pdf" style="text-decoration: none; color: inherit;" target="_blank">Federal Bank Schedules Analyst/Investor Meetings</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://nsearchives.nseindia.com/corporate/FEDERALBNK_12112024135417_SE_intimaton_post_allotment_V2.pdf" style="text-decoration: none; color: inherit;" target="_blank">Federal Bank Raises INR 1,500 Crore Through Allotment of Infrastructure Bonds</a>  
                        </span>  
                    </li>  
                  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700 mt-1 shrink-0">  
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>  
                        </div><span class="text-green-700 text-left">  
                        <a href="https://economictimes.indiatimes.com/markets/stocks/news/nifty-weak-but-sharp-fall-unlikely-technical-analysts/articleshow/115157034.cms" style="text-decoration: none; color: inherit;" target="_blank">Nifty weak, but sharp fall unlikely: Technical Analysts</a>  
                        </span>  
                    </li>  
                  
                    </ul>  
                </div>  
              
                          
                    </div>  
                </div>  
            </div>  
          
              </div>  
            </section>  
          </div>  
        </div>  
      </div>  
    </div>  
  </div>  
</body>  
</html>  
    `;

// Replace all matches with empty string
const htmlSafe = html.replace(regex, '');

// Execute the conversion
convertHtmlToPdf(htmlSafe, 'output.pdf')
  .catch(err => console.error('Conversion failed:', err));