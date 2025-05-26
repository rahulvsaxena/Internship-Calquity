import '@mdxeditor/editor/style.css'
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  diffSourcePlugin,
  UndoRedo, 
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  ListsToggle,
  toolbarPlugin 
} from '@mdxeditor/editor'
import html2pdf from 'html2pdf.js'
import { useState, useCallback, useEffect } from 'react'
import { convertMarkdownToHTML, saveHtmlToFile } from './utils/markdownToHtml'

function App() {
  // Initialize with default content instead of empty string
  const [markdown, setMarkdown] = useState(`# Welcome to MDXEditor

This is a **rich text editor** with multiple features.

## Features
- Lists
- Tables
- Images
- Links
- And more!

## Table Example
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

> This is a blockquote example

## Image Examples
![Random Image](https://picsum.photos/seed/demo1/400/200)

![Another Image](https://picsum.photos/seed/demo2/300/150)

You can also add images by:
1. Using the Insert Image button in the toolbar
2. Pasting image URLs directly
3. Uploading local image files`)
  
  const [htmlOutput, setHtmlOutput] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Read markdown from file
  const readMarkdownFile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/example.md')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      if (text && text.trim()) {
        setMarkdown(text)
        console.log('Successfully loaded markdown from file')
      }
    } catch (error) {
      console.error('Error reading markdown file:', error)
      console.log('Using default content')
      // Keep the default content already set in useState
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize markdown from file
  useEffect(() => {
    readMarkdownFile()
  }, [])

  // Handle markdown file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/markdown') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        if (content) {
          setMarkdown(content)
        }
      }
      reader.readAsText(file)
    } else {
      alert('Please upload a valid markdown file (.md)')
    }
  }

  // Generate HTML from current markdown
  const handleGenerateHTML = useCallback(async () => {
    if (!markdown) {
      console.warn('No markdown content to convert')
      return
    }
    const html = await convertMarkdownToHTML(markdown)
    setHtmlOutput(html)
  }, [markdown])

  // Save HTML to file
  const handleSaveHtml = useCallback(() => {
    if (!htmlOutput) {
      alert('Please generate HTML first!')
      return
    }
    saveHtmlToFile(htmlOutput)
  }, [htmlOutput])

  // Export HTML to PDF
  const handleExportPDF = useCallback(async () => {
    if (!markdown) {
      alert('No content to export!')
      return
    }

    try {
      const html = await convertMarkdownToHTML(markdown)
      const tempContainer = document.createElement('div')
      tempContainer.innerHTML = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        ">
          ${html}
        </div>
      `
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      document.body.appendChild(tempContainer)

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'mdx-document.pdf',
        image: { 
          type: 'jpeg', 
          quality: 0.95 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait'
        }
      }

      await html2pdf().set(opt).from(tempContainer.firstChild).save()
      document.body.removeChild(tempContainer)
      console.log('PDF export completed successfully')
    } catch (error) {
      console.error('Error during PDF export:', error)
      alert('An error occurred during PDF export. Please check the console for details.')
    }
  }, [markdown])

  const onUpdate = useCallback((newMarkdown) => {
    if (newMarkdown !== undefined) {
      setMarkdown(newMarkdown)
    }
  }, [])

  // Enhanced image upload handler that handles both files and URLs
  const imageUploadHandler = async (image) => {
    // If it's already a URL string, return it as-is
    if (typeof image === 'string') {
      return image
    }
    
    // If it's a File object, convert to data URL
    if (image instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(image)
      })
    }
    
    // Fallback - return the input as-is
    return image
  }

  // Initialize HTML output - but only when markdown is available
  useEffect(() => {
    if (markdown && !isLoading) {
      convertMarkdownToHTML(markdown).then(setHtmlOutput)
    }
  }, [markdown, isLoading])

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <>
      {/* Add custom CSS for better image handling */}
      <style>{`
        .mdx-editor img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 10px 0 !important;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .mdx-editor .image-node {
          text-align: center;
        }
        
        .mdx-editor .image-node img {
          border: 1px solid #e0e0e0;
        }
        
        /* Handle broken images */
        .mdx-editor img[src=""] {
          display: none;
        }
        
        .mdx-editor img:not([src]),
        .mdx-editor img[src=""] {
          display: none;
        }
      `}</style>
      
      <div style={{ 
        margin: '20px', 
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>MDXEditor</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="file"
            accept=".md"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="markdown-upload"
          />
          <label 
            htmlFor="markdown-upload"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Upload Markdown
          </label>
          <button 
            onClick={handleExportPDF}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Export to PDF
          </button>
        </div>
      </div>

      {/* Editor Panel */}
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '20px',
        backgroundColor: 'white'
      }}>
        <MDXEditor 
          markdown={markdown}
          onChange={onUpdate}
          contentEditableClassName="prose prose-sm max-w-none"
          viewMode="rich-text"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({
              imageUploadHandler,
              imageAutocompleteSuggestions: ['https://picsum.photos/400/200', 'https://picsum.photos/300/150'],
              imagePreviewHandler: async (src) => src, // Allow any URL
              imageAttributes: {
                style: 'max-width: 100%; height: auto; display: block; margin: 10px 0;',
                loading: 'lazy'
              }
            }),
            tablePlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <ListsToggle />
                </>
              )
            }),
            diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' })
          ]} 
        />
      </div>
    </div>
    </>
  )
}

export default App