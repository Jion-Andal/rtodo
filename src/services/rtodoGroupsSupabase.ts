import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../utils/errorMessage'

interface CreateGroupRpcRow {
  group_id?: string
  group_name?: string
  invite_code?: string
}

export interface RtodoGroup {
  id: string
  name: string
  inviteCode: string
  isOwner: boolean
}

export interface GroupMember {
  userId: string
  username: string
  displayName: string
  isOwner: boolean
  joinedAt: string
}

export interface CreateGroupResult {
  group: RtodoGroup
  inviteUrl: string
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

export function buildGroupInviteUrl(inviteCode: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('join', inviteCode)
  return url.toString()
}

export async function fetchMyGroups(): Promise<RtodoGroup[]> {
  const client = requireClient()

  const { data, error } = await client.rpc('list_my_rtodo_groups')
  if (error) throw error

  return (data as { id: string; name: string; invite_code: string; is_owner: boolean }[]).map(
    (row) => ({
      id: row.id,
      name: row.name,
      inviteCode: row.invite_code,
      isOwner: Boolean(row.is_owner),
    }),
  )
}

export async function fetchActiveGroupId(): Promise<string | null> {
  const client = requireClient()

  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) return null

  const { data, error } = await client
    .from('profiles')
    .select('active_group_id')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.active_group_id ?? null
}

export async function setActiveGroupId(groupId: string | null): Promise<void> {
  const client = requireClient()

  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { error } = await client
    .from('profiles')
    .update({ active_group_id: groupId })
    .eq('id', userId)

  if (error) throw error
}

function parseCreateGroupRow(data: unknown): CreateGroupRpcRow | null {
  if (!data) return null
  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== 'object') return null
  return row as CreateGroupRpcRow
}

export async function createGroup(name: string): Promise<CreateGroupResult> {
  const client = requireClient()

  const { data, error } = await client.rpc('create_rtodo_group', { p_name: name })
  if (error) {
    throw new Error(
      getErrorMessage(error, 'Could not create group. Run supabase/groups-fix.sql in your project.'),
    )
  }

  const row = parseCreateGroupRow(data)
  const groupId = row?.group_id
  const groupName = row?.group_name
  const inviteCode = row?.invite_code

  if (!groupId || !groupName || !inviteCode) {
    throw new Error(
      'Group was created but the server returned an unexpected response. Refresh and check your groups list.',
    )
  }

  const group: RtodoGroup = {
    id: groupId,
    name: groupName,
    inviteCode,
    isOwner: true,
  }

  return {
    group,
    inviteUrl: buildGroupInviteUrl(group.inviteCode),
  }
}

export async function joinGroupByInviteCode(inviteCode: string): Promise<string> {
  const client = requireClient()

  const { data, error } = await client.rpc('join_rtodo_group_by_invite', {
    p_invite_code: inviteCode,
  })
  if (error) throw error
  return data as string
}

export function clearJoinQueryFromUrl(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('join')) return
  url.searchParams.delete('join')
  const next = url.pathname + (url.search || '') + url.hash
  window.history.replaceState({}, '', next)
}

export function getJoinCodeFromUrl(): string | null {
  const code = new URL(window.location.href).searchParams.get('join')
  return code?.trim() || null
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  const client = requireClient()

  const { data, error } = await client.rpc('list_rtodo_group_members', {
    p_group_id: groupId,
  })
  if (error) {
    throw new Error(getErrorMessage(error, 'Could not load group members.'))
  }

  return (
    data as {
      user_id: string
      username: string
      display_name: string
      is_owner: boolean
      joined_at: string
    }[]
  ).map((row) => ({
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    isOwner: Boolean(row.is_owner),
    joinedAt: row.joined_at,
  }))
}

export async function deleteGroup(groupId: string): Promise<void> {
  const client = requireClient()

  const { error } = await client.rpc('delete_rtodo_group', { p_group_id: groupId })
  if (error) {
    throw new Error(getErrorMessage(error, 'Could not delete group.'))
  }
}

export async function leaveGroup(groupId: string): Promise<void> {
  const client = requireClient()

  const { error } = await client.rpc('leave_rtodo_group', { p_group_id: groupId })
  if (error) {
    throw new Error(getErrorMessage(error, 'Could not leave group.'))
  }
}
