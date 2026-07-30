import type { Node } from '@xyflow/react'

export type MessageData = { role: 'user' | 'assistant'; content: string }
export type StickyData = { text: string }
export type FrameData = { title: string }

export type MessageNodeType = Node<MessageData, 'message'>
export type StickyNodeType = Node<StickyData, 'sticky'>
export type FrameNodeType = Node<FrameData, 'frame'>

// Every node kind that can live on the canvas.
export type AppNode = MessageNodeType | StickyNodeType | FrameNodeType
