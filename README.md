# PetConnect 🐾

A modern, premium React + Tailwind web app for pet owners to book services and shop for pet products.

## Features

- **Beautiful UI**: Glass morphism design with smooth animations
- **Authentication**: Secure user registration and login with Supabase
- **Responsive Design**: Works perfectly on mobile and desktop
- **Service Booking**: Book vet visits, grooming, and dog walking services
- **Product Shopping**: Browse and purchase premium pet products
- **Booking Management**: Track and manage your pet service appointments

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS 3.4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend**: Supabase
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HenrySConnan/Fetchly.git
cd Fetchly
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Update `src/lib/supabase.js` with your credentials

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth.jsx        # Authentication form
│   ├── Navbar.jsx      # Navigation bar
│   └── Footer.jsx      # Footer component
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── lib/                # External libraries
│   └── supabase.js     # Supabase client
├── pages/              # Page components
│   ├── Home.jsx        # Home page
│   └── Services.jsx    # Services page
└── App.jsx             # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

- **Colors**: Primary blue (#2563eb), Accent cyan (#22d3ee)
- **Typography**: Inter font family
- **Components**: Glass morphism cards with backdrop blur
- **Animations**: Smooth fade-ins and hover effects
- **Layout**: Max width 1280px, centered with generous padding

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Developer**: Henry Connan
- **Email**: [Your Email]
- **GitHub**: [@HenrySConnan](https://github.com/HenrySConnan)

---

Made with ❤️ for pet lovers everywhere 🐾