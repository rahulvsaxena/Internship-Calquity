// utils/markdownToHtml.js
import { marked } from 'marked'

export const convertMarkdownToHTML = async (markdown) => {
  // Add null/undefined check
  if (!markdown || typeof markdown !== 'string') {
    console.warn('convertMarkdownToHTML received:', typeof markdown, markdown)
    return '<p>No content available</p>'
  }
  
  try {
    // Now safe to call trim()
    const trimmedMarkdown = markdown.trim()
    const html = await marked(trimmedMarkdown)
    return html
  } catch (error) {
    console.error('Error converting markdown to HTML:', error)
    return '<p>Error converting markdown</p>'
  }
}

export const saveHtmlToFile = (html) => {
  if (!html || typeof html !== 'string') {
    console.warn('saveHtmlToFile received invalid HTML:', typeof html, html)
    return
  }
  
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}