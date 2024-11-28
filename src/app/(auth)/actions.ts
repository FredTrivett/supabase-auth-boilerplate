'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const AuthSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type ActionResponse = {
  error?: string;
  success?: boolean;
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const validatedFields = AuthSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid credentials format'
    }
  }

  const { email, password } = validatedFields.data

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message
    }
  }

  // Check if email is verified
  const { data: { user } } = await supabase.auth.getUser()
  const isVerified = user?.user_metadata?.email_verified || false

  if (!isVerified) {
    // Generate and send new verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()

    const cookieStore = await cookies()
    cookieStore.set('verification_data', JSON.stringify({
      email,
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600
    })

    await resend.emails.send({
      from: 'Fred at Growvy <fred@growvy.app>',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <h2>Your Verification Code</h2>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    })

    redirect('/verify-code')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const validatedFields = AuthSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid credentials format'
    }
  }

  const { email, password } = validatedFields.data

  // Create user with email_verified explicitly set to false
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        email_verified: false
      },
      emailRedirectTo: undefined // Disable Supabase email
    }
  })

  if (signUpError) {
    return {
      error: signUpError.message
    }
  }

  // Sign in the user immediately
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) {
    return {
      error: signInError.message
    }
  }

  // Generate verification code
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()

  try {
    // Store verification data in cookies
    const cookieStore = await cookies()
    cookieStore.set('verification_data', JSON.stringify({
      email,
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600
    })

    // Send verification email through Resend only
    await resend.emails.send({
      from: 'Fred at Growvy <fred@growvy.app>',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <h2>Your Verification Code</h2>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    })

    return { success: true }

  } catch (error) {
    console.error('Error in signup:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function verifyCode(formData: FormData) {
  const cookieStore = await cookies()
  const verificationData = cookieStore.get('verification_data')

  if (!verificationData?.value) {
    return {
      error: 'Verification session expired. Please try signing up again.'
    }
  }

  const data = JSON.parse(verificationData.value)

  // Combine the code inputs into a single string
  const submittedCode = Array.from({ length: 4 }, (_, i) =>
    formData.get(`code-${i}`)
  ).join('')

  if (Date.now() > data.expires) {
    cookieStore.delete('verification_data')
    return {
      error: 'Verification code expired. Please try signing up again.'
    }
  }

  if (submittedCode !== data.code) {
    return {
      error: 'Invalid verification code'
    }
  }

  // Update user metadata to mark email as verified
  const supabase = await createClient()
  const { error: updateError } = await supabase.auth.updateUser({
    data: { email_verified: true }
  })

  // Clean up
  cookieStore.delete('verification_data')

  if (updateError) {
    return {
      error: updateError.message
    }
  }

  // Redirect to onboarding after successful verification
  redirect('/onboarding')
}

export async function resendCode(email: string) {
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()

  try {
    // Store new verification data
    const cookieStore = await cookies()
    cookieStore.set('verification_data', JSON.stringify({
      email,
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600
    })

    // Send new code via Resend
    await resend.emails.send({
      from: 'Fred at Growvy <fred@growvy.app>',
      to: email,
      subject: 'Your New Verification Code',
      html: `
        <h2>Your New Verification Code</h2>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    })

    return { success: true }
  } catch (error) {
    return {
      error: 'Error sending verification code. Please try again.'
    }
  }
}

export async function updatePassword(formData: FormData, code: string) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return {
      error: 'Passwords do not match'
    }
  }

  try {
    // Exchange the recovery code for a session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      return {
        error: 'Invalid or expired reset link. Please request a new one.'
      }
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      return {
        error: updateError.message
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      error: 'An error occurred while resetting your password. Please try again.'
    }
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return {
      error: 'Email is required'
    }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    return {
      error: error.message
    }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient()

  const newEmail = formData.get('email') as string

  if (!newEmail) {
    return {
      error: 'Email is required'
    }
  }

  // First get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: 'Not authenticated'
    }
  }

  // Update the email
  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?success=email-change`,
      data: {
        skipOldEmailNotification: true // This tells Supabase to skip notifying the old email
      }
    }
  })

  if (updateError) {
    if (updateError.message.includes('email already in use')) {
      return {
        error: 'An account with this email already exists'
      }
    }
    return {
      error: updateError.message
    }
  }

  return { success: true }
}

export async function completeOnboarding(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const role = formData.get('role') as string

  if (!name || !role) {
    return {
      error: 'Name and role are required'
    }
  }

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: 'Authentication error'
    }
  }

  // Insert/update profile with first_login set to true
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name,
      role,
      first_login: true // This will be true on first login
    })

  if (profileError) {
    return {
      error: profileError.message
    }
  }

  // Update user metadata to mark onboarding as complete
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      onboarding_completed: true
    }
  })

  if (updateError) {
    return {
      error: updateError.message
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateProfile(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const role = formData.get('role') as string

  if (!name || !role) {
    return {
      error: 'Name and role are required'
    }
  }

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: 'Authentication error'
    }
  }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name,
      role,
    })
    .eq('id', user.id)

  if (profileError) {
    return {
      error: profileError.message
    }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}