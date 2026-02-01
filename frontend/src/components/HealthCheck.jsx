import { useState } from 'react'

function HealthCheck() {
   const [message, setMessage] = useState('')
   const [response, setResponse] = useState(null)
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState(null)

   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      try {
         const res = await fetch('http://localhost:8000/health', {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })

         if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
         }

         const data = await res.json()
         setResponse(data)
      } catch (err) {
         setError(err.message)
         console.error('Error calling backend:', err)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl">
         <h2 className="text-2xl font-semibold text-white mb-4">
            Backend Health Check
         </h2>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Test Message (Optional)
               </label>
               <input
                  type="text"
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter a message to send..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
               />
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
               {loading ? (
                  <span className="flex items-center justify-center">
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Sending...
                  </span>
               ) : (
                  'Send Request'
               )}
            </button>
         </form>

         {/* Response Display */}
         {response && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-fade-in">
               <h3 className="text-lg font-semibold text-green-400 mb-2">
                  ✓ Response Received
               </h3>
               <pre className="text-sm text-gray-200 overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
               </pre>
            </div>
         )}

         {/* Error Display */}
         {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
               <h3 className="text-lg font-semibold text-red-400 mb-2">
                  ✗ Error
               </h3>
               <p className="text-sm text-gray-200">{error}</p>
               <p className="text-xs text-gray-400 mt-2">
                  Make sure the backend is running on http://localhost:8000
               </p>
            </div>
         )}
      </div>
   )
}

export default HealthCheck
