import axios from 'axios'

export const userService = {
  checkUserDetails: async (userId) => {
    try {
      const response = await axios.get(
        `https://pl.pr.flashfund.in/api/userdetails/check-user/${userId}`
      )
      return response.status === 200
    } catch (error) {
      if (error.response?.status === 404) {
        return false
      }
      throw error
    }
  },

  searchOne: async (userId, token) => {
    try {
      const response = await axios.post(
        'https://pl.pr.flashfund.in/api/search/one',
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }
}