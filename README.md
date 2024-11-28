# Supabase Auth Boilerplate with Next.js

A modern authentication boilerplate using Supabase, Next.js 14, and TypeScript. This template provides a solid foundation for building applications with email authentication, protected routes, and user profiles.

## Features

- 🔐 Email Authentication
- 👤 User Profile Management
- 🛡️ Protected Routes
- 🚀 Next.js 14 App Router
- 📱 Responsive Design
- 🎨 Tailwind CSS
- ✉️ Custom Email Templates with Resend

## Prerequisites

- Node.js 18+ 
- A Supabase account
- A Resend account

## Setup Instructions

### 1. Clone the repository
```bash
git clone [your-repo-url]
cd supabase-auth-boilerplate
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Once your project is ready, go to Project Settings > API
3. Copy your project URL and anon key
4. In the SQL editor, run the following commands to set up the database:

```sql
-- Create the profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text,
  first_login boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policies
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Create triggers
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 4. Configure Supabase Email Templates

1. Go to Authentication > Email Templates
2. Click on "Change Email Address" template
3. Replace the default template with:

```html
<h2>Confirm Email Change</h2>

<p>Follow this link to confirm the update of your email from {{ .Email }} to {{ .NewEmail }}:</p>
<p><a href="{{ .SiteURL }}/email-confirmation?token_hash={{ .TokenHash }}&type=email-change&next=/dashboard">Change Email</a></p>

<p>Or copy and paste the URL into your browser:</p>
<p>{{ .SiteURL }}/email-confirmation?token_hash={{ .TokenHash }}&type=email-change&next=/dashboard</p>

<p>If you didn't request this email change, you can safely ignore this email.</p>
```

### 5. Set up Resend

1. Create an account at [Resend](https://resend.com)
2. Create an API key
3. Add your domain and verify it
4. Create an email template (optional)

### 6. Environment Setup

1. Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update the `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=your-resend-api-key
```

### 7. Run the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Protected dashboard
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   ├── emails/            # Email templates
│   └── utils/             # Utility functions
│       └── supabase/      # Supabase client setup
├── public/                # Static assets
└── tailwind.config.js    # Tailwind CSS configuration
```

## Authentication Flow

1. Users can sign up with email
2. Upon first login, users are redirected to the dashboard
3. A profile is automatically created for new users
4. The dashboard shows a different welcome message for first-time users
5. Email change requests trigger a confirmation email using custom template

## Email Features

- Custom email templates using Resend
- Email change confirmation
- Responsive email designs
- HTML and plain text versions
- Tracking and analytics (via Resend dashboard)

## Common Issues

1. **Database Error Granting User**: Make sure you've run all the SQL commands in your Supabase SQL editor
2. **Auth Not Working**: Verify your environment variables are correctly set
3. **Profile Not Created**: Check if the database triggers are properly set up
4. **Emails Not Sending**: 
   - Verify your Resend API key is correct
   - Check if your domain is properly verified in Resend
   - Ensure email templates are properly configured in Supabase

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
