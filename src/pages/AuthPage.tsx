import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import type { AuthResponse } from '../types/index'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // 로그인
        const { data, error: rpcError } = await supabase.rpc('login_user', {
          p_username: username,
          p_password: password
        })

        if (rpcError) throw rpcError

        const result = data as AuthResponse
        
        if (result.error) {
          setError(result.error)
        } else if (result.success && result.user_id && result.username && result.role) {
          login({
            user_id: result.user_id,
            username: result.username,
            role: result.role
          })
          navigate('/')
        }
      } else {
        // 회원가입
        const { data, error: rpcError } = await supabase.rpc('register_user', {
          p_username: username,
          p_password: password
        })

        console.log('=== 회원가입 디버깅 ===')
        console.log('RPC Error:', rpcError)
        console.log('Data:', data)
        console.log('Username:', username)
        console.log('Password:', password)
        console.log('Password length:', password.length)

        if (rpcError) throw rpcError

        const result = data as AuthResponse
        
        if (result.error) {
          setError(result.error)
          console.log(result.error)
        } else if (result.success) {
          setError('')
          alert('회원가입 성공! 로그인해주세요.')
          setIsLogin(true)
          setPassword('')
        }
      }
    } catch (err) {
      setError('오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? '로그인' : '회원가입'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">유저명</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="3-20자"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="8자리 숫자"
              maxLength={8}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition"
          >
            {loading ? '처리중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setPassword('')
            }}
            className="text-purple-500 hover:underline text-sm"
          >
            {isLogin ? '회원가입하기' : '로그인하기'}
          </button>
        </div>
      </div>
    </div>
  )
}