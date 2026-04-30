# Personal Blog

A modern personal blog built with Next.js 14 and Tailwind CSS.

## Features

- **Home Page**: Landing page with navigation to all sections
- **Blog**: Blog listing page with article previews
- **Blog Post Detail**: Individual blog post pages with comment system
- **About/Resume**: Personal profile with skills and work experience
- **Photo Gallery**: Responsive photo gallery

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React 18

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── about/
│   │   └── page.tsx      # About/Resume page
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx  # Blog post detail with comments
│   │   └── page.tsx      # Blog listing page
│   ├── gallery/
│   │   └── page.tsx      # Photo gallery
│   ├── globals.css       # Global styles with Tailwind
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
```

## Future Enhancements

- Blog post upload functionality (admin panel)
- Database integration for blog posts and comments
- Image upload for photo gallery
- Dark mode toggle
- SEO optimization
- RSS feed
