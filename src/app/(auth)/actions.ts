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

    cookies().set('verification_data', JSON.stringify({
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
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()

  try {
    // First sign up the user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email_verified: false
        },
        emailRedirectTo: undefined
      }
    })

    if (signUpError) {
      return {
        error: signUpError.message
      }
    }

    // Then sign them in immediately
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      return {
        error: signInError.message
      }
    }

    // Store verification data
    cookies().set('verification_data', JSON.stringify({
      email,
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600
    })

    // Send verification email
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
  const supabase = await createClient()
  const verificationData = cookies().get('verification_data')

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
    cookies().delete('verification_data')
    return {
      error: 'Verification code expired. Please try signing up again.'
    }
  }

  if (submittedCode !== data.code) {
    return {
      error: 'Invalid verification code'
    }
  }

  // Get current session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: 'Authentication error. Please try signing in again.'
    }
  }

  // Update user metadata to mark email as verified
  const { error: updateError } = await supabase.auth.updateUser({
    data: { email_verified: true }
  })

  if (updateError) {
    return {
      error: updateError.message
    }
  }

  // Clean up
  cookies().delete('verification_data')

  // Redirect to onboarding after successful verification
  redirect('/onboarding')
}

export async function resendCode(email: string) {
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()

  try {
    // Store new verification data
    cookies().set('verification_data', JSON.stringify({
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

export async function updatePassword(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      error: 'All fields are required'
    }
  }

  if (newPassword !== confirmPassword) {
    return {
      error: 'New passwords do not match'
    }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return {
      error: 'Authentication error'
    }
  }

  // First verify the current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return {
      error: 'Current password is incorrect'
    }
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    return {
      error: updateError.message
    }
  }

  return { success: true }
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
  const cookieStore = cookies()

  // Create a new supabase client for signing out
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Set cookies to expire
  cookieStore.set('sb-access-token', '', {
    expires: new Date(0),
    path: '/'
  })
  cookieStore.set('sb-refresh-token', '', {
    expires: new Date(0),
    path: '/'
  })

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