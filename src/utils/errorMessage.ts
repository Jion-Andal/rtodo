export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }
  return fallback
}
