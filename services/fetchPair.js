import axios from 'axios'

import { BASE_URL, tokenAddresses } from '../config'

export const fetchPair = async (baseToken = null, quoteToken = null) => {
  try {
    baseToken = baseToken || tokenAddresses.ETH
    quoteToken = quoteToken || tokenAddresses.TOMO

    const response = await axios.get(`${BASE_URL}/pair?baseToken=${baseToken}&quoteToken=${quoteToken}`)

    return response.data.data
  } catch (err) {
    console.log(err)
    return null
  }
}
