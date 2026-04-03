# Printing Tools

A collection of client-side utility tools for printing and PDF manipulation.

## Tools

### Invoice Duplicator
A tool designed to duplicate half-page invoices (A5) onto a single A4 sheet to save paper.

### Passport Photo Maker
Create professional passport photos with background removal, color customization, and tiling on A4 or 4x6 paper.

**Features:**
- **Background Removal**: AI-powered background removal entirely in your browser.
- **Custom Backgrounds**: Change background to white, blue, or other standard colors.
- **Suit Overlay**: Add a formal suit overlay to your portrait.
- **Multiple Sizes**: Support for standard 35x45mm and US 2x2 inch photos.
- **Print-Ready Tiling**: Automatically tiles photos onto A4 or 4x6 photo paper for easy printing.

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

## Contributing

Contributions are welcome! Whether you want to report a bug, suggest a new feature, or contribute code, your help makes this project better.

### How to Contribute
- **Report a Bug**: Use the [Bug Report](https://github.com/sahajananddigital/printing-tools/issues/new?template=bug_report.md) template.
- **Suggest a Feature**: Use the [Feature Request](https://github.com/sahajananddigital/printing-tools/issues/new?template=feature_request.md) template.
- **Contribute Code**: Check out the existing issues or open a new one to discuss your idea. Fork the repository, create a branch, and submit a Pull Request.

For more details, visit the [Contribute](/contribute) page within the application.

## Deployment

The project is configured to deploy to **GitHub Pages**.

1. **Push changes to main branch.**
2. **Run deployment script:**
   ```bash
   npm run deploy
   ```
   This will build the project and push the `dist` folder to the `gh-pages` branch.
