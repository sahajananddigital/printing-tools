# Printing Tools

A collection of client-side utility tools for printing and PDF manipulation.

## Tools

### Invoice Duplicator
A tool designed to duplicate half-page invoices (A5) onto a single A4 sheet to save paper.

**Features:**
- **Strict A4 Output**: Automatically scales and positions content onto a standard A4 page.
- **Adjustable Split**: "Cut Position" slider allows you to crop empty space from the bottom of the invoice to ensure a perfect fit.
- **Client-Side Only**: All processing happens in your browser using `pdf-lib`. No files are ever uploaded to a server.
- **Distortion-Free**: Uses advanced masking techniques to duplicate content without stretching or squeezing.

## Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS v4
- **PDF Processing**: pdf-lib
- **Testing**: Vitest
- **Routing**: React Router (HashRouter)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm run test
   ```

## Deployment

The project is configured to deploy to **GitHub Pages**.

1. **Push changes to main branch.**
2. **Run deployment script:**
   ```bash
   npm run deploy
   ```
   This will build the project and push the `dist` folder to the `gh-pages` branch.
