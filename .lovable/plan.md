## Fix the cover image overlay corner coverage

The "Change cover" overlay button in `src/pages/editor/components/cover-image-picker.tsx` inherits `rounded-full` from the base `Button` variant. With its own `rounded-t-2xl`, the bottom-left and bottom-right corners of the overlay become overly rounded, so the dark overlay does not fully cover the cover image's square bottom corners.

### Changes
- Edit `src/pages/editor/components/cover-image-picker.tsx`.
- On the overlay `Button` (line ~60), replace `rounded-t-2xl` with `rounded-none` so the overlay is a flat rectangle that fully covers the image.
- The parent wrapper already has `rounded-t-2xl overflow-hidden`, so it will still clip the top corners to match the cover image.
- Keep the existing hover text fix (`hover:text-white`) and opacity transition intact.

### Verification
- Open a document with a cover image.
- Hover over the cover.
- Confirm the dark overlay covers the entire image, including the bottom-left and bottom-right corners, with no visible uncovered image pixels.
- Confirm the "Change cover" label remains white on hover.