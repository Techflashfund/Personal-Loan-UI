import axios from 'axios'

const BASE_URL = 'https://pl.pr.flashfund.in'

export const formService = {
  submitForm: async (userId, formData, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/form/submit/${userId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit form')
    }
  },

  searchOne: async (userId, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/search/one`,
        { userId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search')
    }
  }
}