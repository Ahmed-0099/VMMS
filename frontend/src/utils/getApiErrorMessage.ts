import axios from 'axios'

type ErrorResponse = {
  message?: string
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
