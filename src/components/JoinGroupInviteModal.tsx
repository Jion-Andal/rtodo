import { ConfirmModal } from './ConfirmModal'

interface JoinGroupInviteModalProps {
  open: boolean
  joining: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function JoinGroupInviteModal({
  open,
  joining,
  error,
  onConfirm,
  onCancel,
}: JoinGroupInviteModalProps) {
  return (
    <ConfirmModal
      open={open}
      title="Join group?"
      message={
        error ??
        'You were invited to join a shared group. Accept to see and edit entries with other members.'
      }
      confirmLabel={joining ? 'Joining…' : 'Join group'}
      confirmDisabled={joining}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
