"use client"

import { useState } from "react"
import { useAppContext } from "./app-context"
import { X, Trophy } from "lucide-react"

export default function Modal() {
  const { activeModal, hideModal, modalData, navigateTo } = useAppContext()

  if (!activeModal) return null

  const renderModalContent = () => {
    switch (activeModal) {
      case "success":
        return <SuccessModalContent />
      case "snippets":
        return <SnippetsModalContent />
      default:
        return <div>Unknown modal type</div>
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] transition-opacity ${activeModal ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      <div className="bg-white rounded-lg w-[90%] max-w-md p-6 shadow-xl transform transition-transform">
        {renderModalContent()}
      </div>
    </div>
  )
}

function SuccessModalContent() {
  const { hideModal, modalData, navigateTo } = useAppContext()

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Trophy className="text-amber-400 mr-2" /> Challenge Completed!
        </h2>
        <button className="text-2xl text-gray-500" onClick={hideModal}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mb-6">
        <p>Congratulations! You've successfully solved the challenge and earned points.</p>
        <div className="text-2xl text-center my-4 font-bold text-primary">+{modalData.points} points!</div>
      </div>
      <div className="flex justify-end">
        <button
          className="bg-primary text-white px-6 py-2 rounded-lg"
          onClick={() => {
            hideModal()
            navigateTo("questions")
          }}
        >
          Continue
        </button>
      </div>
    </>
  )
}

function SnippetsModalContent() {
  const { hideModal, snippets, saveSnippet, deleteSnippet, loadSnippet, modalData } = useAppContext()
  const [selectedSnippet, setSelectedSnippet] = useState<any>(null)
  const [snippetName, setSnippetName] = useState("")
  const [snippetDescription, setSnippetDescription] = useState("")
  const mode = modalData.mode || "load"

  const handleSave = () => {
    if (saveSnippet(snippetName, snippetDescription)) {
      hideModal()
    }
  }

  const handleLoad = () => {
    if (selectedSnippet) {
      loadSnippet(selectedSnippet)
      hideModal()
    } else {
      alert("Please select a snippet to load")
    }
  }

  const handleDelete = () => {
    if (selectedSnippet) {
      deleteSnippet(selectedSnippet.id)
      setSelectedSnippet(null)
    } else {
      alert("Please select a snippet to delete")
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Code Snippets
        </h2>
        <button className="text-2xl text-gray-500" onClick={hideModal}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {snippets.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto mb-4 border rounded-lg divide-y">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                className={`p-3 cursor-pointer ${
                  selectedSnippet && selectedSnippet.id === snippet.id ? "bg-gray-100" : ""
                }`}
                onClick={() => setSelectedSnippet(snippet)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="snippet"
                    id={`snippet-${snippet.id}`}
                    checked={selectedSnippet && selectedSnippet.id === snippet.id}
                    onChange={() => setSelectedSnippet(snippet)}
                    className="mr-2"
                  />
                  <label htmlFor={`snippet-${snippet.id}`} className="flex-1 cursor-pointer">
                    <strong>{snippet.name}</strong>
                    <div className="text-sm text-gray-500">
                      {snippet.language} | {new Date(snippet.date).toLocaleDateString()}
                    </div>
                    {snippet.description && <div className="mt-1 text-sm">{snippet.description}</div>}
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 my-8">
            No saved snippets yet. Save your code to create snippets!
          </div>
        )}
        {mode === "save" && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Save New Snippet</h3>
            <input
              type="text"
              placeholder="Snippet name"
              value={snippetName}
              onChange={(e) => setSnippetName(e.target.value)}
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Optional description"
              value={snippetDescription}
              onChange={(e) => setSnippetDescription(e.target.value)}
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {snippets.length > 0 && (
          <button
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg"
            onClick={handleDelete}
            disabled={!selectedSnippet}
          >
            Delete Selected
          </button>
        )}
        {mode === "save" ? (
          <button className="bg-primary text-white px-4 py-2 rounded-lg" onClick={handleSave}>
            Save
          </button>
        ) : (
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg"
            onClick={handleLoad}
            disabled={!selectedSnippet}
          >
            Load Selected
          </button>
        )}
      </div>
    </>
  )
}

