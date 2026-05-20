import { client } from './client'

export interface UserOut {
  id: number
  email: string
  display_name: string | null
  is_professor: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: UserOut
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  isProfessor: boolean,
): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/register', {
    email,
    password,
    display_name: displayName,
    is_professor: isProfessor,
  })
  return data
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/login', { email, password })
  return data
}
