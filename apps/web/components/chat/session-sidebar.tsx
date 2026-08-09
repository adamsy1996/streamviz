'use client'

import { AlertDialog } from '@astryxdesign/core/AlertDialog'
import { Button } from '@astryxdesign/core/Button'
import { CommandPalette } from '@astryxdesign/core/CommandPalette'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Divider } from '@astryxdesign/core/Divider'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, Layout, LayoutContent, LayoutFooter, VStack } from '@astryxdesign/core/Layout'
import { MoreMenu } from '@astryxdesign/core/MoreMenu'
import { NavIcon } from '@astryxdesign/core/NavIcon'
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { createStaticSource, type SearchableItem } from '@astryxdesign/core/Typeahead'
import { ChatBubbleLeftRightIcon, MagnifyingGlassIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useMemo, useState } from 'react'

export type ChatSession = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

type SessionSearchItem = SearchableItem<{ group: string }>

type SessionSidebarProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  isLoading: boolean
  isRunning: boolean
  error?: string
  agentStatus: { configured: boolean; provider: string; model: string }
  onNewChat: () => void
  onSelect: (sessionId: string) => void
  onRename: (sessionId: string, title: string) => Promise<void>
  onDelete: (sessionId: string) => Promise<void>
}

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()

const getDateGroup = (isoDate: string) => {
  const today = startOfDay(new Date())
  const updated = startOfDay(new Date(isoDate))
  const age = Math.floor((today - updated) / 86_400_000)
  if (age <= 0) return 'Today'
  if (age === 1) return 'Yesterday'
  if (age < 7) return 'Previous 7 days'
  return 'Earlier'
}

const groupOrder = ['Today', 'Yesterday', 'Previous 7 days', 'Earlier'] as const

function SessionItem({
  session,
  isSelected,
  isDisabled,
  onSelect,
  onRename,
  onDelete,
}: {
  session: ChatSession
  isSelected: boolean
  isDisabled: boolean
  onSelect: () => void
  onRename: () => void
  onDelete: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <VStack gap={0} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <SideNavItem
        label={session.title}
        icon={ChatBubbleLeftRightIcon}
        href={`/chat/?thread=${encodeURIComponent(session.id)}`}
        isSelected={isSelected}
        isDisabled={isDisabled}
        onClick={(event) => {
          event.preventDefault()
          onSelect()
        }}
        endContent={isHovered || isMenuOpen ? (
          <MoreMenu
            size="sm"
            label={`Options for ${session.title}`}
            isMenuOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            items={[
              { label: 'Rename', onClick: onRename },
              { label: 'Delete', onClick: onDelete },
            ]}
          />
        ) : undefined}
      />
    </VStack>
  )
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  isLoading,
  isRunning,
  error,
  agentStatus,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
}: SessionSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null)
  const [actionPending, setActionPending] = useState(false)

  const grouped = useMemo(() => groupOrder.map(group => ({
    group,
    sessions: sessions.filter(session => getDateGroup(session.updatedAt) === group),
  })).filter(section => section.sessions.length), [sessions])

  const searchSource = useMemo(() => createStaticSource<SessionSearchItem>(sessions.map(session => ({
    id: session.id,
    label: session.title,
    auxiliaryData: { group: getDateGroup(session.updatedAt) },
  }))), [sessions])

  const submitRename = async () => {
    if (!renameTarget || !renameValue.trim()) return
    setActionPending(true)
    try {
      await onRename(renameTarget.id, renameValue.trim())
      setRenameTarget(null)
    } finally {
      setActionPending(false)
    }
  }

  const submitDelete = async () => {
    if (!deleteTarget) return
    setActionPending(true)
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setActionPending(false)
    }
  }

  return (
    <>
      <SideNav
        collapsible
        resizable={{ defaultWidth: 288, minWidth: 220, maxWidth: 400, autoSaveId: 'streamviz-chat-sidebar' }}
        header={(
          <SideNavHeading
            heading="StreamViz"
            headingHref="/"
            icon={<NavIcon icon={<Icon icon={SparklesIcon} size="sm" />} />}
          />
        )}
        footer={(
          <SideNavSection title="Agent" isHeaderHidden>
            <StatusDot
              variant={agentStatus.configured ? 'success' : 'error'}
              label={agentStatus.configured ? `${agentStatus.provider} · ${agentStatus.model}` : 'Agent offline'}
              isPulsing={isRunning}
            />
          </SideNavSection>
        )}
      >
        <SideNavSection title="Menu" isHeaderHidden>
          <SideNavItem label="New chat" icon={PlusIcon} onClick={onNewChat} isDisabled={isRunning} />
          <SideNavItem label="Search chats" icon={MagnifyingGlassIcon} onClick={() => setSearchOpen(true)} isDisabled={!sessions.length} />
        </SideNavSection>
        <Divider />
        {isLoading ? (
          <SideNavSection title="Conversations"><Text type="supporting" color="secondary">Loading conversations…</Text></SideNavSection>
        ) : grouped.length ? grouped.map(section => (
          <SideNavSection key={section.group} title={section.group}>
            {section.sessions.map(session => (
              <SessionItem
                key={session.id}
                session={session}
                isSelected={session.id === activeSessionId}
                isDisabled={isRunning}
                onSelect={() => onSelect(session.id)}
                onRename={() => {
                  setRenameTarget(session)
                  setRenameValue(session.title)
                }}
                onDelete={() => setDeleteTarget(session)}
              />
            ))}
          </SideNavSection>
        )) : (
          <SideNavSection title="Conversations">
            <Text type="supporting" color="secondary">{error || 'Your conversations will appear here.'}</Text>
          </SideNavSection>
        )}
      </SideNav>

      <CommandPalette
        isOpen={searchOpen}
        onOpenChange={setSearchOpen}
        searchSource={searchSource}
        label="Search conversations"
        emptyBootstrapText="No conversations yet."
        emptySearchText="No matching conversations."
        onValueChange={(sessionId) => {
          setSearchOpen(false)
          onSelect(sessionId)
        }}
      />

      <Dialog isOpen={Boolean(renameTarget)} onOpenChange={(open) => { if (!open && !actionPending) setRenameTarget(null) }} purpose="form" width={440}>
        <Layout
          header={<DialogHeader title="Rename conversation" subtitle="Choose a short title that is easy to find later." onOpenChange={() => setRenameTarget(null)} />}
          content={<LayoutContent><TextInput label="Conversation title" value={renameValue} onChange={setRenameValue} hasAutoFocus width="100%" /></LayoutContent>}
          footer={(
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button label="Cancel" variant="secondary" onClick={() => setRenameTarget(null)} isDisabled={actionPending} />
                <Button label="Save" variant="primary" onClick={() => void submitRename()} isLoading={actionPending} isDisabled={!renameValue.trim()} />
              </HStack>
            </LayoutFooter>
          )}
        />
      </Dialog>

      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open && !actionPending) setDeleteTarget(null) }}
        title="Delete conversation?"
        description="This permanently removes the conversation and its messages."
        actionLabel="Delete conversation"
        onAction={() => void submitDelete()}
        isActionLoading={actionPending}
      />
    </>
  )
}
