'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-6 p-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Favorite Tenant Map
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? 'アカウントにログイン'
              : '新しいアカウントを作成'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'login' ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center text-sm">
          {mode === 'login' ? (
            <button
              onClick={() => setMode('register')}
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              アカウントをお持ちでない方はこちら
            </button>
          ) : (
            <button
              onClick={() => setMode('login')}
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              既にアカウントをお持ちの方はこちら
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
