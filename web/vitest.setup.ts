// This file runs before every test file.
// Importing @testing-library/jest-dom adds custom matchers to Vitest's expect:
//   expect(element).toBeInTheDocument()
//   expect(element).toHaveTextContent('hello')
//   expect(element).toHaveClass('bg-accent')
//   ... and ~20 more DOM-specific assertions
//
// Without this, you'd have to use raw DOM assertions like
//   expect(document.body.contains(element)).toBe(true)
// which are harder to read and give worse failure messages.

import '@testing-library/jest-dom'
