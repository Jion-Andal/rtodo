export function preserveEntryMeta(
  existing: { createdAt?: string; createdBy?: string } | undefined,
  username: string | null,
  isEdit: boolean,
): { createdAt: string; createdBy?: string } {
  return {
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    createdBy: existing?.createdBy ?? (!isEdit && username ? username : undefined),
  }
}
