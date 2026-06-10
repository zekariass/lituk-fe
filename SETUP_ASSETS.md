# Asset Display Setup

## Required Environment Variable

To display images and videos from Cloudflare R2 storage, you need to add the following environment variable to your `.env.local` file:

```bash
NEXT_PUBLIC_FILES_BASE_URL=https://pub-43ad180d56534021a128961bc3812097.r2.dev
```

## Steps to Enable Asset Display

1. Create or edit `.env.local` in the project root (if it doesn't exist)
2. Add the line above to the file
3. Restart your development server:
   ```bash
   npm run dev
   ```
   or rebuild and restart production:
   ```bash
   npm run build
   npm start
   ```

## How It Works

Assets are stored in Cloudflare R2 with relative paths like:
```
options/41/ac92a0b5-8709-4818-8c0d-0b223d86dadd.png
```

The app constructs full URLs by combining the base URL with the relative path:
```
https://pub-43ad180d56534021a128961bc3812097.r2.dev/options/41/ac92a0b5-8709-4818-8c0d-0b223d86dadd.png
```

## Troubleshooting

If images still don't display after adding the environment variable:

1. **Verify the environment variable is loaded:**
   - Check that `.env.local` exists in the project root
   - Ensure there are no typos in the variable name
   - Restart the dev server completely (stop and start again)

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for 404 errors or CORS issues
   - Verify the constructed URLs are correct

3. **Verify R2 bucket permissions:**
   - Ensure the R2 bucket allows public read access
   - Check that the base URL is correct and accessible

## Asset Types Supported

- **Images:** jpg, jpeg, png, gif, webp, svg
- **Videos:** mp4, webm, ogg
- **Documents:** pdf, doc, docx (shown as placeholder)
